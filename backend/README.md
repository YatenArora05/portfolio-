# Portfolio Backend API

A Node.js backend API for handling contact form submissions with MongoDB Atlas integration and email notifications.

## 🚀 Features

- **Contact Form API**: Handle form submissions with validation
- **MongoDB Atlas**: Store contact messages in the cloud
- **Email Notifications**: Send emails to admin and auto-reply to users
- **Rate Limiting**: Prevent spam and abuse
- **Security**: Helmet.js for security headers
- **Validation**: Input validation with express-validator
- **Error Handling**: Comprehensive error handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Gmail account for email sending

## 🛠 Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```

3. **Configure your `.env` file:**
   ```env
   # MongoDB Atlas Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # CORS Configuration
   CLIENT_URL=http://localhost:5173
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=5
   ```

## 📧 Email Setup (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

## 🗄 MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. **Create a new cluster**
3. **Create a database user** with read/write permissions
4. **Whitelist your IP address** (or use 0.0.0.0/0 for development)
5. **Get your connection string** and update `MONGODB_URI`

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Contact Form
- **POST** `/api/contact/submit` - Submit contact form
- **GET** `/api/contact/admin/contacts` - Get all contacts (admin)
- **PATCH** `/api/contact/admin/contacts/:id/status` - Update contact status (admin)

### Health Check
- **GET** `/api/health` - Server health status

## 🔧 API Usage

### Submit Contact Form
```javascript
const response = await fetch('http://localhost:5000/api/contact/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello, I would like to work with you!'
  })
});

const result = await response.json();
```

### Response Format
```json
{
  "success": true,
  "message": "Message sent successfully!",
  "data": {
    "id": "contact_id",
    "emailSent": true,
    "autoReplySent": true
  }
}
```

## 🛡 Security Features

- **Rate Limiting**: 5 requests per 15 minutes for contact form
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for specific origins
- **Helmet.js**: Security headers
- **IP Tracking**: Track submission sources
- **Duplicate Prevention**: Prevent spam submissions

## 📊 Database Schema

### Contact Collection
```javascript
{
  name: String (required, max 100 chars),
  email: String (required, valid email),
  message: String (required, max 1000 chars),
  status: String (enum: 'new', 'read', 'replied', 'archived'),
  ipAddress: String (required),
  userAgent: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_app_password
CLIENT_URL=https://your-frontend-domain.com
```

### Recommended Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Simple Node.js deployment
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Lambda deployment

## 📝 Logs

The server logs important events:
- MongoDB connection status
- Email sending results
- API requests and errors
- Rate limiting events

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your connection string
   - Verify IP whitelist
   - Check database user permissions

2. **Email Not Sending**
   - Verify Gmail app password
   - Check 2FA is enabled
   - Verify EMAIL_USER and EMAIL_PASS

3. **CORS Errors**
   - Update CLIENT_URL in .env
   - Check frontend URL matches

4. **Rate Limiting**
   - Adjust RATE_LIMIT_MAX_REQUESTS
   - Check RATE_LIMIT_WINDOW_MS

## 📞 Support

For issues or questions, please check the logs and verify your environment configuration.
