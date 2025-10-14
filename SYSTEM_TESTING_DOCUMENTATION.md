# System Testing Documentation

This document provides a comprehensive guide for system testing the ITSO ID Tracker application, covering integration testing, end-to-end testing, and system-level validation across all components.

## Table of Contents
- [System Architecture Overview](#system-architecture-overview)
- [System Components](#system-components)
- [Integration Points](#integration-points)
- [System Testing Strategy](#system-testing-strategy)
- [Test Scenarios](#test-scenarios)
- [Testing Tools and Setup](#testing-tools-and-setup)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Data Flow Testing](#data-flow-testing)
- [Error Handling Testing](#error-handling-testing)

## System Architecture Overview

The ITSO ID Tracker is a full-stack application with three main components:

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │   Expo Mobile   │    │  Node.js API    │
│   (Port 5173)   │    │   (Port 19000)  │    │  (Port 5000)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      MongoDB Database     │
                    │    (User Data, Appts)     │
                    └───────────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     External Services     │
                    │  (Gmail, Google OAuth)    │
                    └───────────────────────────┘
```

### Component Overview

| Component | Technology | Purpose | Port |
|-----------|------------|---------|------|
| **Client (Web)** | React + Vite | Web interface for students | 5173 |
| **Mobile** | Expo + React Native | Mobile app for students | 19000 |
| **Server** | Node.js + Express | REST API backend | 5000 |
| **Database** | MongoDB | Data persistence | 27017 |
| **Email** | Gmail SMTP/OAuth | Email notifications | - |

## System Components

### 1. Client Application (React Web)
**Location:** `client/`
**Key Features:**
- Student dashboard and appointment booking
- Admin dashboard for management
- Authentication and authorization
- Calendar integration
- Announcement system

**Key Files:**
- `src/main.jsx` - Application entry point
- `src/App.jsx` - Main application component
- `src/pages/` - Page components
- `src/components/` - Reusable UI components

### 2. Mobile Application (Expo)
**Location:** `mobi/`
**Key Features:**
- Mobile-optimized student interface
- Authentication and profile management
- Appointment viewing and booking
- Push notifications

**Key Files:**
- `app/_layout.tsx` - Mobile app layout
- `src/config/api.ts` - API configuration
- `contexts/AuthContext.tsx` - Authentication context

### 3. Server Application (Node.js)
**Location:** `server/`
**Key Features:**
- RESTful API endpoints
- Authentication and authorization
- Database operations
- Email service integration
- File upload handling

**Key Files:**
- `src/index.js` - Server entry point
- `src/routes/` - API route handlers
- `src/models/` - Database models
- `src/services/` - Business logic services

## Integration Points

### 1. Client ↔ Server Integration
**Protocol:** HTTP/HTTPS REST API
**Authentication:** JWT Bearer tokens
**Base URL:** `http://localhost:5000/api`

**Key Integration Points:**
```javascript
// Authentication
POST /api/auth/login
POST /api/auth/register
GET /api/auth/user/:id

// Appointments
GET /api/appointments/user/:userId
POST /api/appointments
PATCH /api/appointments/:id/status

// Calendar & Slots
GET /api/slots/available
GET /api/calendar-closures
POST /api/slots

// Announcements
GET /api/announcements
POST /api/announcements (admin)
```

### 2. Mobile ↔ Server Integration
**Protocol:** HTTP/HTTPS REST API
**Authentication:** JWT Bearer tokens stored in AsyncStorage
**Configuration:** `mobi/src/config/api.ts`

**Key Integration Points:**
```typescript
// Same API endpoints as web client
// Additional mobile-specific features:
- AsyncStorage for token persistence
- Offline data caching
- Push notification handling
```

### 3. Server ↔ Database Integration
**Protocol:** MongoDB Native Driver
**Connection:** `server/src/config/db.js`

**Key Integration Points:**
```javascript
// Database Models
- User (authentication, profile data)
- Appointment (booking data)
- Slot (time slot management)
- Announcement (content management)
- IdCard (ID tracking)
```

### 4. Server ↔ External Services
**Email Service:** Gmail SMTP/OAuth2
**Google OAuth:** User authentication
**File Storage:** Local file system

## System Testing Strategy

### Testing Levels

1. **Component Integration Testing**
   - Test individual components with their dependencies
   - Mock external services
   - Validate data flow between components

2. **API Integration Testing**
   - Test complete API workflows
   - Validate request/response handling
   - Test authentication and authorization

3. **End-to-End Testing**
   - Test complete user workflows
   - Cross-platform testing (Web + Mobile)
   - Database integration testing

4. **System Performance Testing**
   - Load testing
   - Stress testing
   - Response time validation

## Test Scenarios

### 1. Authentication System Testing

#### Test Case: User Registration and Login
**Objective:** Verify complete authentication flow
**Steps:**
1. **Registration Flow:**
   ```
   POST /api/auth/register
   → Validate user data
   → Hash password
   → Store in MongoDB
   → Return success response
   ```

2. **Login Flow:**
   ```
   POST /api/auth/login
   → Validate credentials
   → Generate JWT token
   → Return user data + token
   ```

3. **Token Validation:**
   ```
   GET /api/auth/user/:id
   → Verify JWT token
   → Return user profile
   ```

**Expected Results:**
- User successfully registered
- Login returns valid JWT token
- Protected routes accessible with valid token
- Invalid credentials rejected

#### Test Case: Password Reset Flow
**Objective:** Verify password reset functionality
**Steps:**
1. Request password reset
2. Receive reset email
3. Use reset token to change password
4. Verify new password works

### 2. Appointment Booking System Testing

#### Test Case: Complete Booking Workflow
**Objective:** Verify end-to-end appointment booking
**Steps:**
1. **Slot Availability Check:**
   ```
   GET /api/slots/available?date=2024-01-15&purpose=NEW_ID
   → Return available time slots
   ```

2. **Appointment Creation:**
   ```
   POST /api/appointments
   {
     "slotId": "slot123",
     "purpose": "NEW_ID",
     "gmail": "student@gmail.com",
     "notes": "Additional requirements"
   }
   → Create appointment record
   → Send confirmation email
   ```

3. **QR Code Generation:**
   ```
   POST /api/appointments/:id/generate-qr
   → Generate QR code data
   → Return QR payload
   ```

**Expected Results:**
- Available slots displayed correctly
- Appointment created successfully
- Confirmation email sent
- QR code generated for check-in

#### Test Case: Admin Appointment Management
**Objective:** Verify admin can manage appointments
**Steps:**
1. Admin login
2. View all appointments
3. Update appointment status
4. Add admin remarks
5. Scan QR codes for check-in

### 3. Calendar and Scheduling System Testing

#### Test Case: Calendar Integration
**Objective:** Verify calendar functionality
**Steps:**
1. **View Calendar:**
   ```
   GET /api/calendar-closures?start=2024-01-01&end=2024-01-31
   → Return office closures and holidays
   ```

2. **Slot Management:**
   ```
   GET /api/slots/available
   → Return available appointment slots
   → Exclude closed dates
   ```

3. **Admin Slot Creation:**
   ```
   POST /api/slots
   {
     "date": "2024-01-15",
     "start": "09:00",
     "end": "10:00",
     "purpose": "NEW_ID",
     "capacity": 5
   }
   ```

### 4. Announcement System Testing

#### Test Case: Announcement Management
**Objective:** Verify announcement system functionality
**Steps:**
1. **Public Announcements:**
   ```
   GET /api/announcements
   → Return published announcements
   → Support search and filtering
   ```

2. **Admin Announcement Creation:**
   ```
   POST /api/announcements
   {
     "title": "Office Closure Notice",
     "content": "Office will be closed...",
     "tags": ["closure", "urgent"],
     "isPublished": true
   }
   ```

3. **Image Upload:**
   ```
   POST /api/announcements/upload-image
   → Upload and store images
   → Return image URL
   ```

### 5. ID Card Tracking System Testing

#### Test Case: ID Card Lifecycle
**Objective:** Verify complete ID card tracking
**Steps:**
1. **Appointment Completion:**
   - Student completes appointment
   - Admin marks appointment as "CLAIMED"
   - ID card status updated to "PROCESSING"

2. **ID Card Issuance:**
   ```
   POST /api/idcards/issue
   {
     "appointmentId": "appointment123",
     "userId": "user123"
   }
   → Create ID card record
   → Update status to "CLAIMED"
   ```

3. **ID Card Return:**
   ```
   PATCH /api/idcards/:id/return
   → Mark ID card as returned
   → Update return timestamp
   ```

## Testing Tools and Setup

### 1. API Testing Tools

#### Postman Collection
**Setup:**
```bash
# Install Postman
# Import API collection
# Configure environment variables:
- base_url: http://localhost:5000/api
- auth_token: {{jwt_token}}
```

**Test Collection Structure:**
```
ITSO ID Tracker API Tests/
├── Authentication/
│   ├── Register User
│   ├── Login User
│   ├── Get User Profile
│   └── Change Password
├── Appointments/
│   ├── Get Available Slots
│   ├── Create Appointment
│   ├── Get User Appointments
│   ├── Update Appointment Status
│   └── Generate QR Code
├── Admin Functions/
│   ├── Get All Appointments
│   ├── Update Appointment
│   ├── Delete Appointment
│   └── Scan QR Code
└── System Tests/
    ├── Database Connectivity
    ├── Email Service
    └── File Upload
```

#### Automated API Testing with Newman
```bash
# Install Newman
npm install -g newman

# Run API tests
newman run itso-api-tests.postman_collection.json \
  --environment itso-dev.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export test-results.html
```

### 2. End-to-End Testing Tools

#### Cypress (Web Application)
**Setup:**
```bash
cd client
npm install --save-dev cypress
npx cypress open
```

**Test Structure:**
```
cypress/e2e/
├── auth/
│   ├── login.cy.js
│   ├── registration.cy.js
│   └── password-reset.cy.js
├── appointments/
│   ├── booking.cy.js
│   ├── calendar.cy.js
│   └── qr-generation.cy.js
├── admin/
│   ├── dashboard.cy.js
│   ├── appointment-management.cy.js
│   └── user-management.cy.js
└── integration/
    ├── complete-workflow.cy.js
    └── cross-platform.cy.js
```

#### Detox (Mobile Application)
**Setup:**
```bash
cd mobi
npm install --save-dev detox
npx detox init
```

### 3. Database Testing

#### MongoDB Testing Scripts
```javascript
// test-db-connection.js
const mongoose = require('mongoose');

async function testDatabaseConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connection successful');
    
    // Test CRUD operations
    const User = mongoose.model('User', userSchema);
    const testUser = new User({
      name: 'Test User',
      student_id: 'TEST-001',
      personal_email: 'test@example.com',
      password: 'hashedpassword'
    });
    
    await testUser.save();
    console.log('✅ User creation successful');
    
    await User.deleteOne({ student_id: 'TEST-001' });
    console.log('✅ User deletion successful');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}
```

## Performance Testing

### 1. Load Testing with Artillery
**Setup:**
```bash
npm install -g artillery
```

**Load Test Configuration:**
```yaml
# load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "User Authentication"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            student_id: "TEST-001"
            password: "password123"

  - name: "Get Available Slots"
    weight: 40
    flow:
      - get:
          url: "/api/slots/available"

  - name: "Create Appointment"
    weight: 30
    flow:
      - post:
          url: "/api/appointments"
          json:
            slotId: "slot123"
            purpose: "NEW_ID"
            gmail: "test@gmail.com"
```

**Run Load Test:**
```bash
artillery run load-test.yml --output load-test-results.json
artillery report load-test-results.json
```

### 2. Performance Benchmarks

| Endpoint | Expected Response Time | Max Concurrent Users |
|----------|----------------------|---------------------|
| POST /api/auth/login | < 200ms | 100 |
| GET /api/slots/available | < 100ms | 200 |
| POST /api/appointments | < 300ms | 50 |
| GET /api/announcements | < 150ms | 300 |
| POST /api/appointments/:id/generate-qr | < 500ms | 20 |

## Security Testing

### 1. Authentication Security
**Test Cases:**
- JWT token expiration handling
- Invalid token rejection
- Role-based access control
- Password strength validation
- Brute force protection

### 2. Input Validation
**Test Cases:**
- SQL injection prevention
- XSS protection
- File upload security
- Email validation
- Input sanitization

### 3. API Security
**Test Cases:**
- CORS configuration
- Rate limiting
- Request size limits
- HTTPS enforcement
- Error message security

## Data Flow Testing

### 1. User Registration to Appointment Booking
```
1. User Registration
   ↓
2. Email Verification (if required)
   ↓
3. User Login
   ↓
4. View Available Slots
   ↓
5. Book Appointment
   ↓
6. Receive Confirmation Email
   ↓
7. Generate QR Code
   ↓
8. Admin Check-in via QR Scan
   ↓
9. ID Card Processing
   ↓
10. ID Card Ready Notification
    ↓
11. ID Card Pickup
    ↓
12. ID Card Return
```

### 2. Admin Management Workflow
```
1. Admin Login
   ↓
2. View All Appointments
   ↓
3. Update Appointment Status
   ↓
4. Add Admin Remarks
   ↓
5. Scan QR Codes
   ↓
6. Manage User Accounts
   ↓
7. Create Announcements
   ↓
8. Manage Calendar Closures
   ↓
9. Generate Reports
```

## Error Handling Testing

### 1. Network Error Handling
**Test Cases:**
- Server unavailable
- Network timeout
- Connection refused
- DNS resolution failure

### 2. Database Error Handling
**Test Cases:**
- Database connection failure
- Query timeout
- Data validation errors
- Constraint violations

### 3. External Service Error Handling
**Test Cases:**
- Email service failure
- Google OAuth service down
- File upload failures
- Third-party API errors

## System Testing Checklist

### Pre-Testing Setup
- [ ] All services running (Server, Database, Email)
- [ ] Test data prepared
- [ ] Test accounts created
- [ ] Environment variables configured
- [ ] Test tools installed

### Core Functionality Testing
- [ ] User registration and login
- [ ] Appointment booking workflow
- [ ] Admin dashboard functionality
- [ ] Email notification system
- [ ] QR code generation and scanning
- [ ] ID card tracking system
- [ ] Calendar and scheduling
- [ ] Announcement management

### Integration Testing
- [ ] Client-server communication
- [ ] Mobile-server communication
- [ ] Database operations
- [ ] Email service integration
- [ ] File upload/download
- [ ] Cross-platform data sync

### Performance Testing
- [ ] Load testing (50+ concurrent users)
- [ ] Response time validation
- [ ] Memory usage monitoring
- [ ] Database performance
- [ ] Email delivery performance

### Security Testing
- [ ] Authentication security
- [ ] Authorization validation
- [ ] Input validation
- [ ] Data encryption
- [ ] Error message security

### Error Handling Testing
- [ ] Network failure scenarios
- [ ] Database error scenarios
- [ ] External service failures
- [ ] Invalid input handling
- [ ] Graceful degradation

## Test Data Management

### 1. Test User Accounts
```javascript
// Test users for different scenarios
const testUsers = {
  student: {
    name: "Test Student",
    student_id: "2024-12345",
    personal_email: "student@test.com",
    password: "TestPassword123",
    role: "student"
  },
  admin: {
    name: "Test Admin",
    student_id: "ADMIN-001",
    personal_email: "admin@test.com",
    password: "AdminPassword123",
    role: "admin"
  },
  googleUser: {
    name: "Google User",
    personal_email: "google@test.com",
    googleId: "google123",
    isGoogleUser: true
  }
};
```

### 2. Test Appointment Data
```javascript
const testAppointments = {
  newId: {
    purpose: "NEW_ID",
    type: "term-renewal",
    pictureOption: "new-picture",
    gmail: "test@gmail.com",
    notes: "Test appointment for new ID"
  },
  renewal: {
    purpose: "RENEWAL",
    type: "school-year-renewal",
    pictureOption: "retain-picture",
    gmail: "renewal@gmail.com",
    notes: "Test appointment for ID renewal"
  }
};
```

## Continuous Integration Testing

### 1. GitHub Actions Workflow
```yaml
# .github/workflows/system-test.yml
name: System Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  system-test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd server && npm install
        cd ../client && npm install
        cd ../mobi && npm install
    
    - name: Start server
      run: |
        cd server
        npm run dev &
        sleep 10
    
    - name: Run API tests
      run: |
        newman run tests/api-tests.postman_collection.json \
          --environment tests/test-environment.json
    
    - name: Run E2E tests
      run: |
        cd client
        npm run test:e2e
    
    - name: Run load tests
      run: |
        artillery run tests/load-test.yml
```

## Conclusion

This system testing documentation provides a comprehensive framework for testing the ITSO ID Tracker application. The testing strategy covers:

1. **Component Integration** - Testing individual components with their dependencies
2. **API Integration** - Validating complete API workflows
3. **End-to-End Testing** - Testing complete user journeys
4. **Performance Testing** - Load and stress testing
5. **Security Testing** - Authentication and authorization validation
6. **Error Handling** - Graceful failure handling

**Key Testing Priorities:**
1. Authentication and authorization systems
2. Appointment booking and management workflows
3. Admin dashboard functionality
4. Cross-platform compatibility (Web + Mobile)
5. Email notification system
6. Database operations and data integrity
7. Performance under load
8. Security vulnerabilities

**Next Steps:**
1. Set up automated testing pipeline
2. Create comprehensive test data sets
3. Implement continuous integration testing
4. Establish performance benchmarks
5. Conduct security penetration testing
6. Document test results and metrics

This testing framework ensures the ITSO ID Tracker system is robust, secure, and performs reliably under various conditions.
