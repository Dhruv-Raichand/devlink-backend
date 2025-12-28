# ⚡ DevLink - Backend API

A robust RESTful API for a professional networking and dating platform, built with Node.js, Express, and MongoDB. Features real-time chat, advanced authentication, email notifications, and automated scheduling.

**🌐 Live API:** [linkdev.online](https://linkdev.online)

---

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication & Authorization** - Secure token-based auth with cookie management
- 👤 **User Management** - Complete CRUD operations with profile customization
- 🤝 **Connection System** - Send, accept, reject connection requests
- 💬 **Real-time Chat** - Instant messaging using Socket.io
- 📧 **Email Notifications** - Automated emails via AWS SES
- ⏰ **Scheduled Tasks** - Cron jobs for daily connection digests
- 🔍 **Advanced Queries** - Complex MongoDB aggregations and filtering

### Technical Highlights
- Password hashing with bcrypt
- Data validation with Mongoose and validator.js
- Custom middleware for authentication and error handling
- MongoDB indexing for optimized queries
- RESTful API design with proper HTTP methods
- Comprehensive error handling and logging

---

## 🛠️ Tech Stack

### Backend Framework
- Node.js
- Express.js

### Database
- MongoDB (MongoDB Atlas)
- Mongoose ODM

### Authentication & Security
- JWT (jsonwebtoken)
- bcrypt
- cookie-parser
- validator

### Real-time Features
- Socket.io

### Cloud Services
- AWS SES (Simple Email Service)
- AWS SDK v3

### Task Scheduling
- node-cron
- date-fns

### Development Tools
- Nodemon
- Postman (API testing)

---

## 📚 API Endpoints

### Authentication Routes
```
POST   /signup              - Register new user
POST   /login               - User login
POST   /logout              - User logout
```

### Profile Routes
```
GET    /profile             - Get logged-in user profile
PATCH  /profile/edit        - Update profile details
PATCH  /profile/password    - Change password
```

### Connection Request Routes
```
POST   /request/send/:status/:userId           - Send connection request
POST   /request/review/:status/:requestId      - Accept/reject request
GET    /user/requests/received                 - Get pending requests
GET    /user/connections                       - Get all connections
```

### Feed Routes
```
GET    /feed?page=1&limit=10                   - Get user feed with pagination
```

### User Routes
```
GET    /user/:id            - Get user by ID
GET    /user/email/:email   - Get user by email
DELETE /user/:id            - Delete user
PATCH  /user/:id            - Update user
```

---

## 🗄️ Database Schema

### User Schema
- firstName, lastName (required, min: 4, max: 50)
- emailId (required, unique, lowercase, validated)
- password (required, min: 8, validated)
- age (min: 18)
- gender (custom validation)
- photoUrl (validated URL)
- about (max: 200)
- skills (array, max: 10 skills)
- timestamps (createdAt, updatedAt)

### Connection Request Schema
- fromUserId (ref: User)
- toUserId (ref: User)
- status (interested, ignored, accepted, rejected)
- timestamps
- Compound index on fromUserId + toUserId

---

## 🚀 Deployment

### Hosting
- **Platform:** AWS EC2 (Ubuntu)
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **Domain:** linkdev.online
- **SSL:** Enabled via Cloudflare

### Deployment Architecture
```
Frontend (React)     →  Nginx (Port 80)  →  linkdev.online
Backend (Node.js)    →  PM2 (Port 7777)  →  linkdev.online/api
Database (MongoDB)   →  MongoDB Atlas    →  Cloud hosted
```

### Nginx Configuration
```nginx
location /api/ {
    proxy_pass http://localhost:7777/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16.17.0 or higher)
- MongoDB Atlas account
- AWS account (for SES)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Dhruv-Raichand/devlink-backend.git
cd devlink-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
SENDER_EMAIL=your_verified_ses_email

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=7777
COOKIE_DOMAIN=localhost
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
SENDER_EMAIL=noreply@linkdev.online
```

---

## 🔧 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (if configured)
```

---

## 📡 PM2 Deployment Commands

```bash
# Start application
pm2 start npm --name "devlink-backend" -- start

# View logs
pm2 logs devlink-backend

# Monitor
pm2 monit

# Restart
pm2 restart devlink-backend

# Stop
pm2 stop devlink-backend

# Delete
pm2 delete devlink-backend
```

---

## 🔐 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiry
- HTTP-only cookies for token storage
- Input validation and sanitization
- MongoDB injection prevention
- Rate limiting ready
- CORS configuration with credentials

---

## 🎯 Key Learning Implementations

### Middleware Chain
- Authentication middleware
- Error handling middleware
- Request validation middleware

### MongoDB Optimizations
- Compound indexes for frequent queries
- Pre-save hooks for password hashing
- Population for related documents
- Query operators ($or, $and, $nin, $ne)

### Advanced Features
- Pagination logic: `skip = (page - 1) * limit`
- JWT token generation and verification
- Socket.io for real-time communication
- Cron jobs for scheduled tasks
- AWS SES integration for emails

---

## 🔗 Related Repository

**Frontend Repository:** [DevLink Frontend](https://github.com/Dhruv-Raichand/devlink-frontend)

---

## 📝 API Testing

Import the Postman collection for testing all endpoints:
- Authentication flows
- CRUD operations
- Connection request handling
- Feed pagination
- Real-time chat

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Dhruv Raichand**

- GitHub: [@Dhruv-Raichand](https://github.com/Dhruv-Raichand)
- Website: [linkdev.online](https://linkdev.online)

---

## 🙏 Acknowledgments

- MongoDB for excellent documentation
- AWS for reliable cloud services
- Socket.io for real-time capabilities
- Express.js community

---

**Built with 💻 and ☕ by Dhruv Raichand**
