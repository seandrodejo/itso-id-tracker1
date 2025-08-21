# ITSO ID Tracker

A comprehensive web application for managing ID card appointments, tracking, and notifications with Google Calendar integration.

## 🚀 Features

- **User Authentication**: Secure login/register system with JWT tokens
- **Appointment Management**: Book, cancel, and track ID appointments
- **Slot Management**: Admin-controlled appointment slots with capacity limits
- **Real-time Tracking**: Monitor ID status from request to return
- **Google Calendar Integration**: Sync appointments with Google Calendar
- **QR Code Generation**: Generate QR codes for appointment verification
- **Admin Dashboard**: Comprehensive admin panel for managing users and appointments
- **Responsive Design**: Modern, mobile-friendly UI built with React and Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **JWT Decode** - Token handling and authentication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Google APIs** - Calendar integration

## 📁 Project Structure

```
itso-id-tracker/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── api.js             # API configuration
│   │   └── main.jsx           # App entry point
│   ├── package.json
│   └── tailwind.config.js     # Tailwind configuration
├── server/                     # Express backend
│   ├── src/
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Custom middleware
│   │   └── index.js           # Server entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Google Cloud Platform account (for Calendar API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd itso-id-tracker
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/itso-id-tracker
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

6. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```

7. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 🔧 Configuration

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `itso-id-tracker`
3. Update `MONGODB_URI` in your `.env` file

### Google Calendar API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Update your `.env` file with the credentials

### Tailwind CSS
The project includes Tailwind CSS for styling. If you need to install it manually:
```bash
cd client
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 📱 Usage

### For Students
1. **Register/Login**: Create an account or sign in
2. **Book Appointment**: Select available time slots
3. **Track Status**: Monitor your ID request progress
4. **Receive Updates**: Get notifications about your appointment

### For Administrators
1. **Manage Slots**: Create and manage appointment time slots
2. **View Appointments**: See all scheduled appointments
3. **Update Status**: Mark IDs as issued, returned, etc.
4. **Analytics**: View appointment statistics and user activity

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with role-based access control
- CORS configuration for secure cross-origin requests
- Input validation and sanitization

## 🧪 Testing

### Backend API Testing
Use Postman or similar tools to test the API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/slots/available` - Get available slots
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/user/:userId` - Get user appointments

### Frontend Testing
The React app includes basic form validation and error handling. Test the user flows:
1. Registration flow
2. Login/logout
3. Dashboard navigation
4. Form submissions

## 🚧 Development Roadmap

### Phase 1: Core Features ✅
- [x] User authentication system
- [x] Basic appointment management
- [x] Slot management
- [x] Protected routes

### Phase 2: Enhanced Features 🚧
- [ ] Google Calendar integration
- [ ] QR code generation
- [ ] Email notifications
- [ ] Admin dashboard

### Phase 3: Advanced Features 📋
- [ ] Real-time updates
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- MongoDB team for the robust database solution
- Google for the Calendar API integration

---

**Happy coding! 🎉**
