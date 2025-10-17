const express = require('express');
const { body, query } = require('express-validator');
const PickupTask = require('../models/PickupTask');
const WasteReport = require('../models/WasteReport');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authMiddleware, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/pickups
// @desc    Schedule a pickup task (admin only)
// @access  Private (Admin)
router.post('/', [
  authorize('admin'),
  body('reportId')
    .isMongoId()
    .withMessage('Invalid report ID'),
  body('collectorId')
    .isMongoId()
    .withMessage('Invalid collector ID'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('estimatedDuration')
    .isInt({ min: 5 })
    .withMessage('Duration must be at least 5 minutes'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters'),
  validate
], async (req, res) => {
  try {
    const { reportId, collectorId, scheduledDate, estimatedDuration, notes } = req.body;

    // Check if report exists and is not already assigned
    const report = await WasteReport.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule pickup for completed report'
      });
    }

    // Check if collector exists and is active
    const collector = await User.findOne({ _id: collectorId, role: 'collector', isActive: true });
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector not found or inactive'
      });
    }

    // Create pickup task
    const pickupTask = new PickupTask({
      reportId,
      collectorId,
      scheduledDate: new Date(scheduledDate),
      estimatedDuration,
      notes
    });

    await pickupTask.save();

    // Update report status and assign collector
    report.status = 'assigned';
    report.assignedCollectorId = collectorId;
    report.scheduledPickupDate = new Date(scheduledDate);
    await report.save();

    // Create notifications
    const notifications = [
      {
        userId: collectorId,
        type: 'pickup_scheduled',
        title: 'New Pickup Task',
        message: `You have been assigned a new pickup task scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
        data: { pickupTaskId: pickupTask._id, reportId },
        priority: 'high'
      },
      {
        userId: report.userId,
        type: 'pickup_scheduled',
        title: 'Pickup Scheduled',
        message: `Your waste report has been scheduled for pickup on ${new Date(scheduledDate).toLocaleDateString()}`,
        data: { pickupTaskId: pickupTask._id, reportId },
        priority: 'medium'
      }
    ];

    await Notification.insertMany(notifications);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('assign_task', {
        pickupTask,
        report,
        collector
      });
    }

    res.status(201).json({
      success: true,
      message: 'Pickup task scheduled successfully',
      data: { pickupTask }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/pickups
// @desc    Get pickup tasks with filtering
// @access  Private
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'])
    .withMessage('Invalid status'),
  query('collectorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid collector ID'),
  validate
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Collectors can only see their own tasks
    if (req.user.role === 'collector') {
      filter.collectorId = req.user._id;
    }

    // Residents can see tasks for their reports
    if (req.user.role === 'resident') {
      const userReports = await WasteReport.find({ userId: req.user._id }).select('_id');
      filter.reportId = { $in: userReports.map(r => r._id) };
    }

    // Apply query filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.collectorId) {
      filter.collectorId = req.query.collectorId;
    }

    // Get pickup tasks with pagination
    const pickupTasks = await PickupTask.find(filter)
      .populate('reportId', 'type description location priority estimatedVolume')
      .populate('collectorId', 'firstName lastName email phone')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await PickupTask.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        pickupTasks,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/pickups/:id
// @desc    Get single pickup task by ID
// @access  Private
router.get('/:id', [
  validate
], async (req, res) => {
  try {
    const pickupTask = await PickupTask.findById(req.params.id)
      .populate('reportId')
      .populate('collectorId', 'firstName lastName email phone');

    if (!pickupTask) {
      return res.status(404).json({
        success: false,
        message: 'Pickup task not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'collector' && pickupTask.collectorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'resident' && pickupTask.reportId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { pickupTask }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PATCH /api/pickups/:id/start
// @desc    Start pickup task (collector only)
// @access  Private (Collector)
router.patch('/:id/start', [
  authorize('collector'),
  validate
], async (req, res) => {
  try {
    const pickupTask = await PickupTask.findById(req.params.id);

    if (!pickupTask) {
      return res.status(404).json({
        success: false,
        message: 'Pickup task not found'
      });
    }

    if (pickupTask.collectorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (pickupTask.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Task is not in scheduled status'
      });
    }

    await pickupTask.startTask();

    // Update report status
    await WasteReport.findByIdAndUpdate(pickupTask.reportId, {
      status: 'in_progress'
    });

    // Create notification for report creator
    const report = await WasteReport.findById(pickupTask.reportId);
    await Notification.createNotification(
      report.userId,
      'pickup_reminder',
      'Pickup Started',
      'Your waste pickup has started',
      { pickupTaskId: pickupTask._id },
      'medium'
    );

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('task_update', {
        pickupTask,
        status: 'in_progress'
      });
    }

    res.json({
      success: true,
      message: 'Pickup task started successfully',
      data: { pickupTask }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PATCH /api/pickups/:id/complete
// @desc    Complete pickup task (collector only)
// @access  Private (Collector)
router.patch('/:id/complete', [
  authorize('collector'),
  body('completionNotes')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Completion notes cannot exceed 300 characters'),
  validate
], async (req, res) => {
  try {
    const pickupTask = await PickupTask.findById(req.params.id);

    if (!pickupTask) {
      return res.status(404).json({
        success: false,
        message: 'Pickup task not found'
      });
    }

    if (pickupTask.collectorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (pickupTask.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Task is not in progress'
      });
    }

    const { completionNotes } = req.body;

    await pickupTask.completeTask(completionNotes);

    // Update report status
    await WasteReport.findByIdAndUpdate(pickupTask.reportId, {
      status: 'completed',
      completedAt: new Date()
    });

    // Create notifications
    const report = await WasteReport.findById(pickupTask.reportId);
    const notifications = [
      {
        userId: report.userId,
        type: 'report_completed',
        title: 'Pickup Completed',
        message: 'Your waste pickup has been completed successfully',
        data: { pickupTaskId: pickupTask._id, reportId: report._id },
        priority: 'medium'
      }
    ];

    // Notify admins
    const admins = await User.find({ role: 'admin', isActive: true });
    admins.forEach(admin => {
      notifications.push({
        userId: admin._id,
        type: 'report_completed',
        title: 'Task Completed',
        message: `Pickup task completed by ${req.user.firstName} ${req.user.lastName}`,
        data: { pickupTaskId: pickupTask._id, reportId: report._id },
        priority: 'low'
      });
    });

    await Notification.insertMany(notifications);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('task_update', {
        pickupTask,
        status: 'completed'
      });
    }

    res.json({
      success: true,
      message: 'Pickup task completed successfully',
      data: { pickupTask }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PATCH /api/pickups/:id/cancel
// @desc    Cancel pickup task
// @access  Private (Admin/Collector)
router.patch('/:id/cancel', [
  authorize('admin', 'collector'),
  body('reason')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Reason is required and cannot exceed 200 characters'),
  validate
], async (req, res) => {
  try {
    const pickupTask = await PickupTask.findById(req.params.id);

    if (!pickupTask) {
      return res.status(404).json({
        success: false,
        message: 'Pickup task not found'
      });
    }

    // Collectors can only cancel their own tasks
    if (req.user.role === 'collector' && pickupTask.collectorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (pickupTask.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed task'
      });
    }

    const { reason } = req.body;

    await pickupTask.cancelTask(reason);

    // Update report status
    await WasteReport.findByIdAndUpdate(pickupTask.reportId, {
      status: 'pending',
      assignedCollectorId: null,
      scheduledPickupDate: null
    });

    // Create notifications
    const report = await WasteReport.findById(pickupTask.reportId);
    await Notification.createNotification(
      report.userId,
      'system_alert',
      'Pickup Cancelled',
      `Your pickup has been cancelled: ${reason}`,
      { pickupTaskId: pickupTask._id },
      'medium'
    );

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('task_update', {
        pickupTask,
        status: 'cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Pickup task cancelled successfully',
      data: { pickupTask }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/pickups/collector/:collectorId/schedule
// @desc    Get collector's schedule for a date range
// @access  Private (Admin/Collector)
router.get('/collector/:collectorId/schedule', [
  authorize('admin', 'collector'),
  query('startDate')
    .isISO8601()
    .withMessage('Start date is required'),
  query('endDate')
    .isISO8601()
    .withMessage('End date is required'),
  validate
], async (req, res) => {
  try {
    const { collectorId } = req.params;
    const { startDate, endDate } = req.query;

    // Collectors can only view their own schedule
    if (req.user.role === 'collector' && collectorId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const pickupTasks = await PickupTask.find({
      collectorId,
      scheduledDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('reportId', 'type description location priority estimatedVolume')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: { pickupTasks }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
