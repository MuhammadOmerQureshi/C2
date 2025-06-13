# C2 - Employee Attendance & Shift Management System

## Overview

C2 is a comprehensive employee attendance and shift management system designed for businesses to efficiently track employee attendance, manage shifts, and generate reports. The application features role-based access with three user types: administrators, employers, and employees, each with specific permissions and capabilities.

## Features

### Authentication & User Management
- **Multi-role System**: Admin, Employer, and Employee roles
- **Secure Authentication**: JWT-based authentication with password hashing
- **User Management**: Create, update, and manage user accounts
- **Profile Management**: Users can update their profile information

### Employer Features
- **Employee Management**: Add, view, and manage employees
- **Shift Scheduling**: Create and manage employee shifts
- **Attendance Monitoring**: Track employee attendance in real-time
- **PDF Reports**: Generate and download attendance reports
- **Data Visualization**: View attendance statistics and charts

### Employee Features
- **Shift Viewing**: See upcoming and past shifts
- **Clock In/Out**: Record attendance with IP validation
- **Attendance History**: View personal attendance records
- **PDF Export**: Download personal attendance reports

### Administrative Features
- **User Administration**: Manage all users in the system
- **Bulk Operations**: Perform actions on multiple users
- **Audit Logging**: Track important system activities
- **Status Management**: Control user account statuses

### Security Features
- **IP Validation**: Verify employee location during clock-in
- **Role-based Access Control**: Restrict access based on user roles
- **Password Security**: Bcrypt hashing for password storage
- **Session Management**: Secure handling of user sessions

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **PDFKit**: PDF generation library
- **Bcrypt**: Password hashing

### Frontend
- **React**: UI library
- **Axios**: HTTP client
- **Chart.js**: Data visualization
- **React Router**: Navigation
- **CSS**: Custom styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

### Backend Setup
1. Clone the repository:
   ```
   git clone <repository-url>
   cd C2
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/c2-attendance
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```
   cd ../frontend
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

4. Access the application at `http://localhost:3000`

## Usage


#Configuration

#Environment Variables

Create a .env file in the project root with the following variables:



# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_URI=mongodb://localhost:27017/database_name

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h

# External Services
API_KEY=your_api_key





### Admin User
1. Log in with admin credentials
2. Create employer accounts
3. Manage users and system settings

### Employer User
1. Log in with employer credentials
2. Add employees to your organization
3. Create shifts for employees
4. Monitor attendance and generate reports

### Employee User
1. Log in with employee credentials
2. View assigned shifts
3. Clock in/out for shifts
4. View attendance history

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Admin Routes
- `POST /api/admin/employers` - Create employer account
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user

### Employer Routes
- `GET /api/employees` - Get employees
- `POST /api/employees` - Create employee
- `DELETE /api/employees/:id` - Delete employee

### Shift Management
- `GET /api/shifts` - Get shifts (for employers)
- `POST /api/shifts` - Create shift
- `DELETE /api/shifts/:id` - Delete shift
- `GET /api/shifts/my` - Get employee's shifts

### Attendance
- `POST /api/attendance/clock-in` - Clock in for shift
- `POST /api/attendance/clock-out` - Clock out from shift
- `GET /api/attendance/my-history` - Get employee's attendance history
- `GET /api/attendance/export/pdf` - Export attendance as PDF

## Database Models

### User
- Core user information and authentication
- Role designation (admin, employer, employee)
- Status tracking (active, inactive, suspended)

### EmployeeProfile
- Links employee user to employer
- Stores employee-specific information

### Shift
- Shift scheduling information
- Status tracking (scheduled, completed, cancelled)

### Attendance
- Clock in/out timestamps
- IP address validation
- Status tracking

### AuditLog
- Action tracking
- User identification

## Known Issues and Solutions

### Authentication Issues
- If experiencing "null user role" errors with PDF export, ensure proper authentication headers are being sent with requests.
- For route handler errors, verify all routes have proper handler functions defined.

### Relationship Issues
- When creating employees, ensure the employerId is properly set to establish the employer-employee relationship.
- Use MongoDB's native `_id` field for relationships rather than custom IDs.

### Frontend Issues
- For PDF exports, use authenticated axios requests instead of window.open() to ensure proper authentication.
- Remove unnecessary query parameters from API calls that the backend doesn't use.

## Best Practices

### Security
- Always use HTTPS in production
- Keep dependencies updated
- Implement proper input validation and sanitization
- Use environment variables for sensitive configuration

### Performance
- Implement pagination for list endpoints
- Use proper caching strategies
- Optimize database queries

### Development
- Follow the established code organization pattern
- Add comprehensive error handling
- Write tests for new features
- Document code with JSDoc comments

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact the project maintainers.
