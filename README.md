# Dynamic QR Code Generator

A full-stack application that allows users to create dynamic QR codes where the destination URL can be changed without regenerating the QR code.

## Features

- **User Authentication**: Register and login system
- **Dynamic QR Codes**: Create QR codes that redirect through a short URL system
- **URL Management**: Change the destination URL of existing QR codes without changing the QR code itself
- **Click Tracking**: Monitor how many times each QR code has been scanned
- **Profile Management**: Each user has their own profile with their QR codes
- **QR Code Management**:
  - Create new QR codes with custom titles
  - Edit destination URLs
  - Toggle QR codes active/inactive
  - Delete QR codes
  - Download QR codes as PNG images

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- QR Code generation with `qrcode` library
- bcryptjs for password hashing

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Context API for state management

## How It Works

1. User creates a QR code with a title and target URL
2. The system generates a unique short ID for the QR code
3. The QR code contains a redirect URL (e.g., `http://localhost:3000/r/abc12345`)
4. When someone scans the QR code, they're redirected through the system
5. The system tracks the click and redirects to the actual target URL
6. Users can change the target URL anytime without changing the QR code

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/qr-generator
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

### MongoDB Setup

Make sure MongoDB is running on your system. If you're using MongoDB locally, the default connection string `mongodb://localhost:27017/qr-generator` should work.

For MongoDB Atlas, replace the `MONGODB_URI` in your `.env` file with your Atlas connection string.

## Usage

1. **Register/Login**: Create an account or login to an existing one
2. **Create QR Code**: Click "Create New QR Code", enter a title and target URL
3. **Manage QR Codes**: View all your QR codes in the dashboard
4. **Edit URLs**: Click "Edit" on any QR code to change its destination URL
5. **Download**: Download QR codes as PNG images
6. **Toggle Status**: Activate/deactivate QR codes
7. **Track Clicks**: See how many times each QR code has been scanned

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### QR Codes
- `POST /api/qr/create` - Create a new QR code
- `GET /api/qr/my-codes` - Get user's QR codes
- `PUT /api/qr/:id` - Update QR code
- `DELETE /api/qr/:id` - Delete QR code
- `GET /r/:shortId` - Redirect endpoint (public)

## Project Structure

```
qr-generator/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── QRCode.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── qr.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── QRCodeCard.tsx
│   │   │   ├── CreateQRModal.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes
- Input validation
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.