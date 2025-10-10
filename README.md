# 🌱 Wastewise - Smart Waste Management Platform

A comprehensive waste management application that connects residents, collectors, and administrators to create a cleaner, more efficient waste collection system.

![Wastewise Logo](https://via.placeholder.com/200x80/2E7D32/FFFFFF?text=Wastewise)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Frontend Guide](#frontend-guide)
- [Backend Guide](#backend-guide)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Wastewise is a modern waste management platform that leverages technology to streamline waste collection processes. The platform enables residents to report waste issues, allows collectors to manage pickup tasks efficiently, and provides administrators with comprehensive analytics and management tools.

### Key Benefits

- **For Residents**: Easy waste reporting, real-time updates, scheduled pickups
- **For Collectors**: Optimized routes, task management, location tracking
- **For Administrators**: Analytics dashboard, user management, system oversight

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-role System**: Admin, Collector, Resident roles with specific permissions
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Profile Management**: Complete user profiles with location data
- **Role-based Access Control**: Granular permissions for different user types

### 📱 Waste Reporting
- **Smart Reporting**: Create detailed waste reports with photos
- **Location Services**: GPS-based location tracking and mapping
- **AI Classification**: Automatic waste type detection using TensorFlow.js
- **Priority System**: Urgent, high, medium, low priority levels
- **Real-time Updates**: Live status updates and notifications

### 🚛 Pickup Management
- **Task Scheduling**: Automated pickup scheduling based on location and capacity
- **Route Optimization**: Efficient route planning for collectors
- **Status Tracking**: Real-time task status updates
- **Time Management**: Duration tracking and completion notes
- **Photo Documentation**: Before/after photos for verification

### 🔔 Notifications & Communication
- **Multi-channel Notifications**: In-app, email, and SMS notifications
- **Real-time Chat**: Direct communication between users
- **Emergency Alerts**: Critical situation reporting
- **Status Updates**: Automated notifications for all stakeholders

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Role-specific dashboards with key metrics
- **Performance Tracking**: Collector efficiency and completion rates
- **Geographic Analysis**: Waste patterns by location
- **Trend Analysis**: Historical data and forecasting

### 🌐 Real-time Features
- **Live Updates**: Socket.io integration for real-time communication
- **Location Tracking**: Real-time collector location updates
- **Chat System**: Instant messaging between users
- **Status Synchronization**: Live status updates across all clients

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation
- **Leaflet** - Interactive maps
- **Chart.js** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image and video management
- **Nodemailer** - Email sending
- **Multer** - File upload handling
- **Express Validator** - Input validation
- **Jest** - Testing framework

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **PM2** - Process manager for Node.js
- **GitHub Actions** - CI/CD pipeline

## 📁 Project Structure

```
Wastewise/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── MapView.tsx
│   │   ├── pages/                  # Page components
│   │   │   ├── auth/               # Authentication pages
│   │   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── collector/          # Collector pages
│   │   │   └── resident/          # Resident pages
│   │   ├── context/               # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── SocketContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── api/                   # API client functions
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── utils/                 # Utility functions
│   │   └── styles/                # Global styles
│   ├── public/                    # Static assets
│   ├── package.json
│   └── vite.config.ts
├── server/                         # Backend Express application
│   ├── src/
│   │   ├── controllers/           # Route controllers
│   │   ├── models/                # Database models
│   │   │   ├── User.js
│   │   │   ├── WasteReport.js
│   │   │   ├── PickupTask.js
│   │   │   └── Notification.js
│   │   ├── routes/                # API routes
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── reports.js
│   │   │   ├── pickups.js
│   │   │   └── notifications.js
│   │   ├── services/              # Business logic services
│   │   │   ├── cloudinaryService.js
│   │   │   ├── socketService.js
│   │   │   └── emailService.js
│   │   ├── middlewares/           # Express middlewares
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── tests/                 # Test files
│   │   └── server.js              # Main server file
│   ├── package.json
│   └── README.md
├── docker-compose.yml             # Docker orchestration
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **pnpm** package manager
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wastewise.git
   cd wastewise
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp client/.env.example client/.env
   ```

4. **Configure Environment Variables**
   
   **Backend (.env)**
   ```env
   MONGODB_URI=mongodb://localhost:27017/wastewise
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   PORT=5000
   NODE_ENV=development
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email (for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@wastewise.com
   
   # Socket.io
   SOCKET_CORS_ORIGIN=http://localhost:3000
   ```
   
   **Frontend (client/.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

6. **Start the applications**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user info | Private |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout user | Private |

### User Management (Admin Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PATCH | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/stats` | Get user statistics | Admin |

### Waste Reports

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/reports` | Create waste report | Private |
| GET | `/api/reports` | List reports | Private |
| GET | `/api/reports/:id` | Get single report | Private |
| PATCH | `/api/reports/:id` | Update report | Admin/Collector |
| DELETE | `/api/reports/:id` | Delete report | Admin |
| GET | `/api/reports/nearby` | Get nearby reports | Private |

### Pickup Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/pickups` | Schedule pickup | Admin |
| GET | `/api/pickups` | List pickup tasks | Private |
| GET | `/api/pickups/:id` | Get pickup task | Private |
| PATCH | `/api/pickups/:id/start` | Start pickup task | Collector |
| PATCH | `/api/pickups/:id/complete` | Complete pickup | Collector |
| PATCH | `/api/pickups/:id/cancel` | Cancel pickup | Admin/Collector |

### Notifications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/notifications` | Get notifications | Private |
| PATCH | `/api/notifications/:id/read` | Mark as read | Private |
| PATCH | `/api/notifications/mark-all-read` | Mark all as read | Private |
| DELETE | `/api/notifications/:id` | Delete notification | Private |
| POST | `/api/notifications/send` | Send notification | Admin |

### Example API Usage

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Create a waste report:**
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "type=household" \
  -F "description=Large pile of household waste" \
  -F "location[address]=123 Main St, City" \
  -F "location[coordinates][lat]=40.7128" \
  -F "location[coordinates][lng]=-74.0060" \
  -F "estimatedVolume=5.5" \
  -F "images=@/path/to/image.jpg"
```

## 🎨 Frontend Guide

### Component Structure

The frontend is built with React and TypeScript, following modern best practices:

- **Components**: Reusable UI components in `/src/components/`
- **Pages**: Route-specific pages in `/src/pages/`
- **Context**: Global state management with React Context
- **Hooks**: Custom hooks for API calls and state management
- **Types**: TypeScript definitions for type safety

### Key Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Socket.io integration for live updates
- **Form Handling**: React Hook Form with validation
- **State Management**: React Query for server state
- **Maps Integration**: Leaflet for interactive maps
- **Image Upload**: Cloudinary integration

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🔧 Backend Guide

### Architecture

The backend follows a clean architecture pattern:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and external service integration
- **Models**: Database schemas and data validation
- **Routes**: API endpoint definitions
- **Middlewares**: Authentication, validation, and error handling

### Key Features

- **RESTful API**: Well-structured API endpoints
- **Real-time Communication**: Socket.io for live updates
- **File Upload**: Cloudinary integration for images
- **Email Service**: Nodemailer for notifications
- **Security**: JWT authentication, rate limiting, CORS
- **Validation**: Comprehensive input validation
- **Error Handling**: Centralized error management

### Development Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🐳 Deployment

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Environment variables for production**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://mongo:27017/wastewise
   JWT_SECRET=your-production-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   EMAIL_USER=your-production-email
   ```

### Manual Deployment

1. **Build frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start backend**
   ```bash
   cd server
   npm start
   ```

3. **Configure reverse proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/client/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🧪 Testing

### Frontend Testing

```bash
cd client
npm run test          # Run tests
npm run test:coverage # Run with coverage
npm run test:ui       # Run with UI
```

### Backend Testing

```bash
cd server
npm test              # Run tests
npm run test:watch    # Run in watch mode
npm run test:coverage # Run with coverage
```

### API Testing

Use the provided test suite or tools like Postman:

```bash
# Run API tests
cd server
npm test src/tests/api.test.js
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation
- Use meaningful commit messages
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Express.js Team** - For the robust backend framework
- **MongoDB Team** - For the flexible database solution
- **Socket.io Team** - For real-time communication capabilities
- **Cloudinary** - For image management services
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/wastewise/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/wastewise/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/wastewise/discussions)
- **Email**: support@wastewise.com

---

**Made with ❤️ by the Wastewise Team**

*Building a cleaner future, one report at a time.* 🌱