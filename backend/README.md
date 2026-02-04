# Cinema Seat Reservation System - Backend

A comprehensive Node.js/Express backend implementing advanced cybersecurity concepts including Multi-Factor Authentication, encryption, hashing, digital signatures, and role-based access control.

## Security Features Implemented

### 1. Authentication (NIST SP 800-63-2 Compliant)
- **Single-Factor Authentication**: Username/Password with bcrypt hashing
- **Multi-Factor Authentication**: Email-based OTP verification
- **Account Security**: Login attempt limiting and account lockout
- **Session Management**: JWT-based token authentication

### 2. Authorization - Access Control
- **Access Control Matrix**: 3 subjects (user, manager, admin) × 4 objects (movies, bookings, users, reports)
- **Access Control List (ACL)**: Route-based permission checking
- **Role-Based Access Control**: Granular permission management

### 3. Encryption
- **AES-256-CBC**: Symmetric encryption for sensitive data
- **RSA**: Asymmetric encryption for key exchange (demonstrated)
- **Data Protection**: Booking details encryption

### 4. Hashing
- **bcrypt**: Password hashing with salt (12 rounds)
- **SHA-256**: Data integrity verification
- **SHA-512**: Enhanced security hashing
- **HMAC**: Message authentication codes

### 5. Encoding
- **Base64**: Binary data encoding
- **Hexadecimal**: Alternative data representation
- **URL Encoding**: Safe URL parameter encoding

### 6. Digital Signatures
- **RSA Signatures**: 2048-bit key pair generation
- **Signature Verification**: Booking integrity verification
- **Non-repudiation**: Proof of transaction authenticity

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Gmail account with App Password (for email OTP)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend root:
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/cinema-booking

JWT_SECRET=your_very_strong_jwt_secret_key_here_minimum_32_characters

ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
```

3. Generate secure keys:
```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Setup Gmail App Password:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Go to https://myaccount.google.com/apppasswords
   - Generate an App Password for "Mail"
   - Use the 16-character password in EMAIL_PASSWORD

5. Start MongoDB:
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

6. Seed the database:
```bash
npm run seed
```

7. Start the server:
```bash
npm start
```

Server will run at http://localhost:5000

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login (step 1: credentials)
- `POST /verify-otp` - Verify OTP (step 2: complete login)
- `POST /resend-otp` - Resend OTP
- `GET /me` - Get current user (protected)
- `POST /logout` - Logout (protected)

### Booking Routes (`/api/bookings`)
- `GET /movies` - Get all movies
- `GET /movies/:id` - Get movie by ID
- `POST /` - Create booking (protected)
- `GET /my-bookings` - Get user bookings (protected)
- `GET /:id` - Get booking by ID (protected)
- `PATCH /:id/cancel` - Cancel booking (protected)

### Admin Routes (`/api/admin`)
- `POST /movies` - Create movie (manager/admin)
- `PUT /movies/:id` - Update movie (manager/admin)
- `DELETE /movies/:id` - Delete movie (admin)
- `GET /bookings` - Get all bookings (manager/admin)
- `GET /users` - Get all users (admin)
- `PATCH /users/:id/role` - Update user role (admin)
- `GET /dashboard` - Get dashboard stats (manager/admin)
- `GET /reports` - Generate reports (manager/admin)

### Security Routes (`/api/security`)
- `POST /hash` - Hash data
- `POST /encrypt` - Encrypt data
- `POST /decrypt` - Decrypt data
- `POST /encode` - Encode data
- `POST /sign` - Create digital signature
- `POST /verify-signature` - Verify signature
- `GET /access-control/matrix` - Get access matrix
- `POST /access-control/check` - Check permission

## Database Schema

### User Model
- username (unique, required)
- email (unique, required)
- password (hashed, required)
- role (user/manager/admin)
- isVerified (boolean)
- twoFactorEnabled (boolean)
- loginAttempts (number)
- lockUntil (date)
- lastLogin (date)

### Movie Model
- title, description, genre, duration, rating, language
- posterUrl
- showtimes (array of showtime objects with seats)
- isActive (boolean)

### Booking Model
- userId (reference to User)
- movieId (reference to Movie)
- movieTitle, showtime, seats
- totalAmount, bookingId
- status (pending/confirmed/cancelled)
- digitalSignature (for verification)
- encryptedData (encrypted booking details)

## Access Control Matrix

| Role    | Movies | Bookings | Users | Reports |
|---------|--------|----------|-------|---------|
| User    | read   | read, create | read_own, update_own | - |
| Manager | read, create, update | read, create, update, delete | read | read, create |
| Admin   | read, create, update, delete | read, create, update, delete | read, create, update, delete | read, create, update, delete |

## Security Implementation Details

### Password Security
- Minimum 8 characters
- bcrypt hashing with 12 salt rounds
- Automatic hashing on user creation
- Secure password comparison

### OTP Security
- 6-digit random OTP
- 5-minute expiration
- Maximum 3 verification attempts
- Temporary in-memory storage (use Redis in production)
- Real email delivery via Nodemailer

### Account Lockout
- 5 failed login attempts trigger lockout
- 15-minute lockout duration
- Automatic lockout reset after expiration

### Token Security
- JWT with 24-hour expiration
- Signed with strong secret key
- Token validation on protected routes
- Automatic logout on token expiration

### Data Encryption
- AES-256-CBC algorithm
- Unique IV for each encryption
- Booking details encrypted before storage
- Secure key management

### Digital Signatures
- RSA-2048 key pair
- SHA-256 hash function
- Signature stored with booking
- Verification on booking retrieval

## Testing the Application

### 1. Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test@123"}'
```

### 2. Test Login (Step 1)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123"}'
```

### 3. Check Email for OTP

### 4. Test OTP Verification (Step 2)
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_FROM_STEP_1","otp":"123456"}'
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cinema
JWT_SECRET=[64-char-random-string]
ENCRYPTION_KEY=[64-char-hex-string]
EMAIL_USER=production-email@domain.com
EMAIL_PASSWORD=[app-password]
```

### Recommendations
1. Use MongoDB Atlas for database
2. Use Redis for OTP storage
3. Use environment-specific secrets
4. Enable HTTPS
5. Implement rate limiting
6. Add request logging
7. Use PM2 for process management
8. Set up monitoring and alerts

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in .env
- Verify network access

### Email Not Sending
- Verify Gmail App Password
- Check EMAIL_USER and EMAIL_PASSWORD
- Enable "Less secure app access" (not recommended)
- Check spam folder

### JWT Errors
- Ensure JWT_SECRET is set
- Check token expiration
- Verify token format

## Project Structure
```
backend/
├── config/
│   └── database.js           # MongoDB connection
├── controllers/
│   ├── auth.controller.js    # Authentication logic
│   ├── booking.controller.js # Booking management
│   └── admin.controller.js   # Admin operations
├── middleware/
│   └── auth.middleware.js    # JWT & access control
├── models/
│   ├── User.model.js         # User schema
│   ├── Movie.model.js        # Movie schema
│   └── Booking.model.js      # Booking schema
├── routes/
│   ├── auth.routes.js        # Auth endpoints
│   ├── booking.routes.js     # Booking endpoints
│   ├── admin.routes.js       # Admin endpoints
│   └── security.routes.js    # Security demo endpoints
├── utils/
│   ├── hashing.util.js       # Hashing functions
│   ├── encryption.util.js    # Encryption functions
│   ├── encoding.util.js      # Encoding functions
│   ├── digitalSignature.util.js # Signature functions
│   ├── accessControl.util.js # Access control logic
│   └── email.util.js         # Email service
├── .env                      # Environment variables
├── package.json              # Dependencies
├── seed.js                   # Database seeder
└── server.js                 # Entry point
```

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email service
- **crypto** (Node.js) - Cryptographic operations

## License

Educational project for Foundations of Cyber Security course.