# Unit Testing Documentation

This document provides a comprehensive overview of the testing setup, frameworks, and practices used in the ITSO ID Tracker project.

## Table of Contents
- [Current Testing Status](#current-testing-status)
- [Testing Infrastructure](#testing-infrastructure)
- [Manual Testing Scripts](#manual-testing-scripts)
- [Testing Recommendations](#testing-recommendations)
- [Testing Setup Guide](#testing-setup-guide)
- [Testing Best Practices](#testing-best-practices)

## Current Testing Status

### ⚠️ **No Formal Unit Testing Framework Implemented**

The ITSO ID Tracker project currently **does not have a formal unit testing framework** implemented. The analysis reveals:

- ❌ No test files (`.test.js`, `.spec.js`, etc.)
- ❌ No testing frameworks (Jest, Vitest, Mocha, etc.)
- ❌ No testing dependencies in package.json files
- ❌ No test scripts in package.json
- ❌ No testing configurations

### Current Testing Approach

The project relies on **manual testing scripts** and **development testing tools**:

1. **Manual Test Scripts** - Utility scripts for testing specific functionality
2. **ESLint** - Code quality and linting
3. **Development Tools** - Vite, Expo, Nodemon for development testing

## Testing Infrastructure

### Available Testing Tools

| Tool | Purpose | Status | Location |
|------|---------|--------|----------|
| ESLint | Code Quality | ✅ Active | All projects |
| Vite | Development Server | ✅ Active | Client |
| Expo | Mobile Development | ✅ Active | Mobile |
| Nodemon | Server Development | ✅ Active | Server |

### Missing Testing Infrastructure

| Tool | Purpose | Status | Recommendation |
|------|---------|--------|----------------|
| Jest/Vitest | Unit Testing | ❌ Missing | Add for React components |
| React Testing Library | Component Testing | ❌ Missing | Add for UI testing |
| Supertest | API Testing | ❌ Missing | Add for server endpoints |
| Cypress/Playwright | E2E Testing | ❌ Missing | Add for full app testing |

## Manual Testing Scripts

The project includes several manual testing scripts for specific functionality:

### 1. Email Service Testing
**File:** `server/test-email.js`
**Purpose:** Tests email configuration and SMTP connectivity

```javascript
// Tests email service configuration
- SMTP connection verification
- Test email sending
- Gmail service integration
```

**Usage:**
```bash
cd server
node test-email.js
```

### 2. Database Testing - Test User Creation
**File:** `server/create-test-user.js`
**Purpose:** Creates test users for manual testing

```javascript
// Creates test users
- Test student user (test@student.com)
- Admin user (admin@nu-dasma.edu.ph)
- Password hashing verification
```

**Usage:**
```bash
cd server
node create-test-user.js
```

### 3. Database Testing - Test Slots Creation
**File:** `server/create-test-slots.js`
**Purpose:** Creates test appointment slots

```javascript
// Creates test appointment slots
- 30 days of test slots
- Different service types (NEW_ID, RENEWAL, LOST_REPLACEMENT)
- Random booking counts for realistic testing
```

**Usage:**
```bash
cd server
node create-test-slots.js
```

### 4. API Connection Testing
**File:** `mobi/test-connection.js`
**Purpose:** Tests API endpoint connectivity

```javascript
// Tests API endpoints
- Basic connectivity
- Authentication endpoints
- Public endpoints (announcements, slots, calendar)
- Error handling verification
```

**Usage:**
```bash
cd mobi
node test-connection.js
```

## Testing Recommendations

### Immediate Actions Required

1. **Add Unit Testing Framework**
   ```bash
   # For React components (Client)
   npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom
   
   # For API testing (Server)
   npm install --save-dev jest supertest
   
   # For Mobile testing (Mobi)
   npm install --save-dev @testing-library/react-native jest-expo
   ```

2. **Configure Test Scripts**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:watch": "vitest --watch",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

### Recommended Testing Structure

```
client/
├── src/
│   ├── components/
│   │   ├── BookingModal.jsx
│   │   └── BookingModal.test.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.test.jsx
│   └── __tests__/
│       └── setup.js

server/
├── src/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── authRoutes.test.js
│   ├── models/
│   │   ├── User.js
│   │   └── User.test.js
│   └── __tests__/
│       └── setup.js

mobi/
├── app/
│   ├── dashboard.tsx
│   └── dashboard.test.tsx
└── __tests__/
    └── setup.ts
```

## Testing Setup Guide

### 1. Client Testing Setup (React + Vite)

**Install Dependencies:**
```bash
cd client
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Create `vite.config.js` with test configuration:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
  },
})
```

**Create test setup file `src/__tests__/setup.js`:**
```javascript
import '@testing-library/jest-dom'
```

**Add test scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 2. Server Testing Setup (Node.js + Jest)

**Install Dependencies:**
```bash
cd server
npm install --save-dev jest supertest @types/jest
```

**Create `jest.config.js`:**
```javascript
export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ]
}
```

**Add test scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 3. Mobile Testing Setup (Expo + Jest)

**Install Dependencies:**
```bash
cd mobi
npm install --save-dev @testing-library/react-native jest-expo
```

**Create `jest.config.js`:**
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testMatch: [
    '**/__tests__/**/*.test.{js,ts,tsx}',
    '**/*.(test|spec).{js,ts,tsx}'
  ]
}
```

**Add test scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Testing Best Practices

### 1. Test Categories

**Unit Tests:**
- Test individual functions and components
- Mock external dependencies
- Fast execution (< 1 second per test)

**Integration Tests:**
- Test component interactions
- Test API endpoint integration
- Test database operations

**End-to-End Tests:**
- Test complete user workflows
- Test cross-browser compatibility
- Test mobile app functionality

### 2. Test File Organization

```
Component Tests:
├── BookingModal.test.jsx
├── LoginModal.test.jsx
└── Toast.test.jsx

Page Tests:
├── Dashboard.test.jsx
├── Calendar.test.jsx
└── AdminDashboard.test.jsx

API Tests:
├── authRoutes.test.js
├── appointmentRoutes.test.js
└── announcementRoutes.test.js
```

### 3. Test Naming Conventions

```javascript
// Component tests
describe('BookingModal', () => {
  it('should render when isOpen is true', () => {})
  it('should call onClose when close button is clicked', () => {})
  it('should validate email format', () => {})
})

// API tests
describe('POST /api/auth/login', () => {
  it('should return token for valid credentials', () => {})
  it('should return 400 for invalid credentials', () => {})
  it('should return 400 for missing fields', () => {})
})
```

### 4. Mock Strategies

**React Component Mocking:**
```javascript
// Mock external dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/test' })
}))
```

**API Mocking:**
```javascript
// Mock API calls
jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>
```

### 5. Test Data Management

**Create test data utilities:**
```javascript
// test-utils/userFactory.js
export const createTestUser = (overrides = {}) => ({
  name: 'Test User',
  student_id: '2024-12345',
  personal_email: 'test@nu-dasma.edu.ph',
  password: 'hashedpassword',
  role: 'student',
  ...overrides
})
```

## Priority Testing Areas

### High Priority (Critical Functionality)

1. **Authentication System**
   - Login/logout functionality
   - Password validation
   - JWT token handling
   - Role-based access control

2. **Appointment Booking**
   - Slot selection
   - Date/time validation
   - Email validation
   - Booking confirmation

3. **Admin Functions**
   - User management
   - Appointment management
   - QR code scanning
   - Analytics generation

### Medium Priority (Important Features)

1. **Calendar System**
   - Date navigation
   - Slot availability
   - Holiday/closure handling

2. **Email System**
   - Email sending
   - Template rendering
   - Error handling

3. **ID Status Tracking**
   - Status updates
   - Progress tracking
   - Notification system

### Low Priority (Nice-to-Have)

1. **UI Components**
   - Modal interactions
   - Form validations
   - Responsive design

2. **Performance**
   - Loading states
   - Error boundaries
   - Memory leaks

## Testing Checklist

### Before Implementing Tests

- [ ] Choose testing framework (Jest/Vitest)
- [ ] Set up test environment
- [ ] Configure test scripts
- [ ] Create test utilities
- [ ] Set up CI/CD testing

### For Each Component/Function

- [ ] Test happy path scenarios
- [ ] Test error conditions
- [ ] Test edge cases
- [ ] Test prop validation
- [ ] Test user interactions

### For Each API Endpoint

- [ ] Test successful responses
- [ ] Test error responses
- [ ] Test input validation
- [ ] Test authentication
- [ ] Test authorization

## Conclusion

The ITSO ID Tracker project currently lacks formal unit testing infrastructure. While manual testing scripts provide some validation, implementing a comprehensive testing strategy is crucial for:

- **Code Quality**: Catch bugs early in development
- **Refactoring Safety**: Ensure changes don't break existing functionality
- **Documentation**: Tests serve as living documentation
- **Confidence**: Deploy with confidence knowing the code works

**Immediate Next Steps:**
1. Set up testing frameworks for each project (Client, Server, Mobile)
2. Write tests for critical authentication functionality
3. Add tests for appointment booking system
4. Implement CI/CD testing pipeline
5. Establish testing best practices and guidelines

**Long-term Goals:**
- Achieve 80%+ code coverage
- Implement automated testing in CI/CD
- Add performance testing
- Implement visual regression testing
- Add accessibility testing
