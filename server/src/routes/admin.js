const express = require('express');
const User = require('../models/User');
const WasteReport = require('../models/WasteReport');
const PickupTask = require('../models/PickupTask');
const Notification = require('../models/Notification');
const { authMiddleware, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { body, query } = require('express-validator');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/admin/dashboard/stats
// @desc    Get admin dashboard statistics
// @access  Private (admin only)
router.get('/dashboard/stats', [
  authorize('admin'),
  validate
], async (req, res) => {
  try {
    const [
      totalReports,
      pendingReports,
      completedReports,
      inProgressReports,
      totalCollectors,
      activeCollectors,
      totalResidents,
      activeResidents,
      totalPickups,
      completedPickups,
      pendingPickups,
      reportsThisMonth,
      reportsLastMonth
    ] = await Promise.all([
      WasteReport.countDocuments(),
      WasteReport.countDocuments({ status: 'pending' }),
      WasteReport.countDocuments({ status: 'completed' }),
      WasteReport.countDocuments({ status: 'in_progress' }),
      User.countDocuments({ role: 'collector' }),
      User.countDocuments({ role: 'collector', isActive: true }),
      User.countDocuments({ role: 'resident' }),
      User.countDocuments({ role: 'resident', isActive: true }),
      PickupTask.countDocuments(),
      PickupTask.countDocuments({ status: 'completed' }),
      PickupTask.countDocuments({ status: 'scheduled' }),
      WasteReport.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      WasteReport.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);

    const completionRate = totalReports > 0 ? (completedReports / totalReports) * 100 : 0;
    const reportsGrowth = reportsLastMonth > 0 
      ? ((reportsThisMonth - reportsLastMonth) / reportsLastMonth) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        completedReports,
        inProgressReports,
        totalCollectors,
        activeCollectors,
        totalResidents,
        activeResidents,
        totalPickups,
        completedPickups,
        pendingPickups,
        reportsThisMonth,
        reportsLastMonth,
        completionRate: Math.round(completionRate * 100) / 100,
        reportsGrowth: Math.round(reportsGrowth * 100) / 100
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/analytics/reports
// @desc    Get report analytics
// @access  Private (admin only)
router.get('/analytics/reports', [
  authorize('admin'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validate
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    }

    const [
      reportsByType,
      reportsByStatus,
      reportsByPriority,
      reportsByMonth,
      averageCompletionTime,
      topCollectors
    ] = await Promise.all([
      WasteReport.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      WasteReport.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      WasteReport.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      WasteReport.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      PickupTask.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        {
          $addFields: {
            duration: { $subtract: ['$actualEndTime', '$actualStartTime'] }
          }
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' }
          }
        }
      ]),
      PickupTask.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$collectorId',
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'collector'
          }
        },
        { $unwind: '$collector' },
        { $sort: { completedTasks: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        reportsByType: reportsByType.map(item => ({
          type: item._id,
          count: item.count
        })),
        reportsByStatus: reportsByStatus.map(item => ({
          status: item._id,
          count: item.count
        })),
        reportsByPriority: reportsByPriority.map(item => ({
          priority: item._id,
          count: item.count
        })),
        reportsByMonth: reportsByMonth.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          count: item.count
        })),
        averageCompletionTime: averageCompletionTime[0]?.avgDuration || 0,
        topCollectors: topCollectors.map(item => ({
          collectorId: item._id,
          name: `${item.collector.firstName} ${item.collector.lastName}`,
          completedTasks: item.completedTasks
        }))
      }
    });
  } catch (error) {
    console.error('Report analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/analytics/users
// @desc    Get user analytics
// @access  Private (admin only)
router.get('/analytics/users', [
  authorize('admin'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validate
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    }

    const [
      usersByRole,
      usersByMonth,
      activeUsers,
      inactiveUsers
    ] = await Promise.all([
      User.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      User.countDocuments({ isActive: true, ...dateFilter }),
      User.countDocuments({ isActive: false, ...dateFilter })
    ]);

    res.json({
      success: true,
      data: {
        usersByRole: usersByRole.map(item => ({
          role: item._id,
          count: item.count
        })),
        usersByMonth: usersByMonth.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          count: item.count
        })),
        activeUsers,
        inactiveUsers
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reports with filtering and pagination
// @access  Private (admin only)
router.get('/reports', [
  authorize('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('type').optional().isIn(['organic', 'recyclable', 'hazardous', 'electronic', 'other']).withMessage('Invalid type'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('search').optional().custom((value) => {
    if (value && value.length > 0 && value.length > 100) {
      throw new Error('Search term must be between 1 and 100 characters');
    }
    return true;
  }),
  validate
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    const [reports, total] = await Promise.all([
      WasteReport.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('assignedCollectorId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      WasteReport.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (admin only)
router.get('/users', [
  authorize('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'collector', 'resident']).withMessage('Invalid role'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  query('search').optional().custom((value) => {
    if (value && value.length > 0 && value.length > 100) {
      throw new Error('Search term must be between 1 and 100 characters');
    }
    return true;
  }),
  validate
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PATCH /api/admin/reports/:id/status
// @desc    Update report status
// @access  Private (admin only)
router.patch('/reports/:id/status', [
  authorize('admin'),
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const report = await WasteReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    if (notes) report.adminNotes = notes;
    report.updatedAt = new Date();

    await report.save();

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PATCH /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (admin only)
router.patch('/users/:id/status', [
  authorize('admin'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (id === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    user.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/export/reports
// @desc    Export reports data
// @access  Private (admin only)
router.get('/export/reports', [
  authorize('admin'),
  query('format').isIn(['csv', 'excel']).withMessage('Invalid format'),
  validate
], async (req, res) => {
  try {
    const { format } = req.query;
    const { status, type, priority, search } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await WasteReport.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('assignedCollectorId', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'ID,Type,Description,Status,Priority,User,Email,Assigned Collector,Address,Latitude,Longitude,Created At,Updated At\n';
      const csvData = reports.map(report => {
        const user = report.userId ? `${report.userId.firstName} ${report.userId.lastName}` : 'N/A';
        const email = report.userId ? report.userId.email : 'N/A';
        const collector = report.assignedCollectorId ? `${report.assignedCollectorId.firstName} ${report.assignedCollectorId.lastName}` : 'Unassigned';
        const address = report.location ? report.location.address : 'N/A';
        const lat = report.location ? report.location.coordinates[1] : 'N/A';
        const lng = report.location ? report.location.coordinates[0] : 'N/A';
        
        return [
          report._id,
          report.type,
          `"${report.description.replace(/"/g, '""')}"`,
          report.status,
          report.priority,
          `"${user}"`,
          email,
          `"${collector}"`,
          `"${address}"`,
          lat,
          lng,
          new Date(report.createdAt).toISOString(),
          new Date(report.updatedAt).toISOString()
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reports-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvHeader + csvData);
    } else {
      // For Excel, we'll return JSON for now (would need xlsx library for proper Excel export)
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=reports-${new Date().toISOString().split('T')[0]}.json`);
      res.json(reports);
    }
  } catch (error) {
    console.error('Export reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/export/users
// @desc    Export users data
// @access  Private (admin only)
router.get('/export/users', [
  authorize('admin'),
  query('format').isIn(['csv', 'excel']).withMessage('Invalid format'),
  validate
], async (req, res) => {
  try {
    const { format } = req.query;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'ID,First Name,Last Name,Email,Role,Status,Phone,Created At,Updated At\n';
      const csvData = users.map(user => {
        return [
          user._id,
          `"${user.firstName}"`,
          `"${user.lastName}"`,
          user.email,
          user.role,
          user.isActive ? 'Active' : 'Inactive',
          user.phone || 'N/A',
          new Date(user.createdAt).toISOString(),
          new Date(user.updatedAt).toISOString()
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvHeader + csvData);
    } else {
      // For Excel, we'll return JSON for now (would need xlsx library for proper Excel export)
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=users-${new Date().toISOString().split('T')[0]}.json`);
      res.json(users);
    }
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
