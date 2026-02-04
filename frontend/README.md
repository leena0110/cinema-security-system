# Cinema Seat Reservation System - Frontend

A secure cinema booking application built with React, featuring comprehensive security implementations including Multi-Factor Authentication, encryption, and role-based access control.

## Features

### Security Features
- **Multi-Factor Authentication (MFA)**: Password + Email OTP verification
- **Real-time Email OTP**: Actual email delivery using Nodemailer
- **Role-Based Access Control (RBAC)**: User, Manager, and Admin roles
- **AES-256 Encryption**: Secure data encryption for sensitive information
- **Digital Signatures**: RSA-based signature verification for bookings
- **Hashing**: SHA-256, SHA-512, and bcrypt implementations
- **Encoding**: Base64, Hex, and URL encoding support

### Application Features
- Movie browsing and selection
- Real-time seat selection with visual seat map
- Dynamic pricing based on seat location
- Booking management and history
- Interactive security dashboard for testing cryptographic operations
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

### `npm start`
Runs the app in development mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner

## Project Structure
```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js              # Login and Registration with OTP
│   │   └── Login.css
│   ├── Booking/
│   │   ├── BookingConfirmation.js # Booking history and details
│   │   └── BookingConfirmation.css
│   └── Movies/
│       ├── MoviesList.js          # Movie browsing and seat selection
│       ├── MoviesList.css
│       ├── Navigation.js          # App navigation bar
│       ├── Navigation.css
│       ├── SecurityDashboard.js   # Security features demonstration
│       └── SecurityDashboard.css
├── services/
│   ├── api.js                     # Axios instance with interceptors
│   ├── auth.service.js            # Authentication API calls
│   ├── booking.service.js         # Booking API calls
│   └── security.service.js        # Security operations API calls
├── utils/
│   ├── AuthContext.js             # Authentication context provider
│   └── securityUtils.js           # Utility functions
├── App.js                         # Main app component with routing
├── App.css
├── index.js                       # App entry point
├── index.css
└── theme.css                      # Global theme styles
```

## User Roles and Permissions

### User Role
- View movies
- Create bookings
- View own bookings
- Cancel own bookings

### Manager Role
- All user permissions
- Create and update movies
- View all bookings
- Generate reports

### Admin Role
- All manager permissions
- Delete movies
- Manage user roles
- Full system access

## Default Test Accounts

After running the seed script on the backend:
```
Admin:
Username: admin
Password: Admin@123

Manager:
Username: manager
Password: Manager@123

User:
Username: john_doe
Password: User@123
```

## Security Dashboard

The Security Dashboard (`/security`) provides interactive demonstrations of:

1. **Hashing**: SHA-256, SHA-512, MD5
2. **Encryption/Decryption**: AES-256-CBC
3. **Encoding**: Base64, Hex, URL encoding
4. **Digital Signatures**: RSA signature creation and verification
5. **Access Control**: View permissions matrix and check specific permissions

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api` with the following endpoints:

- `/auth/*` - Authentication endpoints
- `/bookings/*` - Booking management
- `/admin/*` - Admin operations
- `/security/*` - Security demonstrations

## Technologies Used

- **React** 18.2.0
- **React Router DOM** 6.18.0
- **Axios** 1.6.0
- **CSS3** with custom theming

## Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

### State Management
- Uses React Context API for authentication state
- Local state management with useState hooks

### API Calls
- Centralized API configuration in `services/api.js`
- Automatic token injection via Axios interceptors
- Error handling and token refresh logic

### Styling
- Custom CSS with CSS variables for theming
- No external UI frameworks for better control
- BEM-like naming convention for classes

## Troubleshooting

### CORS Errors
Ensure the backend is running and has CORS enabled for `http://localhost:3000`

### API Connection Issues
Check that `REACT_APP_API_URL` is correctly set and the backend is accessible

### Email OTP Not Received
1. Check backend email configuration in `.env`
2. Verify Gmail App Password is correct
3. Check spam folder
4. Ensure backend console shows "OTP sent successfully"

## Building for Production

1. Build the application:
```bash
npm run build
```

2. The optimized production build will be in the `build/` folder

3. Serve using a static server:
```bash
npx serve -s build
```

## License

This project is part of the Foundations of Cyber Security course at Amrita Vishwa Vidyapeetham.

## Support

For questions about the cybersecurity implementations or the application, refer to the course materials or contact your instructor.