<!-- PROJECT_ROOT/.github/README.md - Project Overview -->

# 🔐 JWT Authentication Server

> A production-ready, scalable JWT authentication server built with **Express**, **MongoDB**, and **TypeScript** using **Clean Architecture** principles.

## 🌟 Key Features

- ✅ User registration & login with secure password hashing
- ✅ JWT access tokens (configurable expiration)
- ✅ Refresh tokens with server-side management
- ✅ Role-based access control (Admin, User, Moderator)
- ✅ Protected endpoints with authorization middleware
- ✅ Token expiration & refresh mechanism
- ✅ User logout with token revocation
- ✅ **Database-agnostic design** (swap MongoDB for DynamoDB, PostgreSQL, etc.)
- ✅ Full TypeScript support with strict mode
- ✅ Clean Architecture for maintainability

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.0+ (local or MongoDB Atlas)
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env

# 3. Start MongoDB (if local)
mongod

# 4. Run development server
npm run dev
```

Server starts on `http://localhost:5000`

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **README.md** | Complete API documentation and features |
| **PROJECT_SUMMARY.md** | Project overview and architecture |
| **SETUP_GUIDE.md** | Detailed setup and extension guide |
| **TESTING_GUIDE.md** | Comprehensive testing scenarios |
| **api.rest** | REST client test file with examples |

---

## 🎯 Project Structure

```
src/
├── entities/           # Domain models (User, roles, types)
├── repositories/       # Data access abstraction layer
├── usecases/          # Business logic (framework-independent)
├── controllers/       # API request handlers
├── middleware/        # Express middleware (Auth, Error)
├── routes/            # Route definitions
├── utils/             # Utility functions (JWT, Password)
├── config/            # Configuration (Database)
└── index.ts          # Application entry point
```

---

## 📖 API Endpoints

### Public Routes
```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login & get tokens
POST   /api/auth/refresh      # Get new access token
```

### Protected Routes
```
GET    /api/auth/me           # Get current user
POST   /api/auth/logout       # Logout & revoke tokens
GET    /api/auth/admin/users  # Admin only endpoint
```

---

## 🔄 Database Swapping

The architecture makes swapping databases trivial:

**MongoDB → DynamoDB:**
1. Create `DynamoUserRepository.ts` implementing `IUserRepository`
2. Update initialization in `src/index.ts`
3. Done! Rest of code unchanged

See **SETUP_GUIDE.md** for detailed instructions.

---

## 🛠️ Scripts

```bash
npm run dev        # Development with auto-reload
npm run build      # Compile TypeScript to JavaScript
npm start          # Production server
npm test           # Run tests (when configured)
```

---

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens signed with secret keys
- ✅ Refresh tokens stored server-side (revocable)
- ✅ Access tokens with short expiration (7 days)
- ✅ Role-based authorization at middleware level
- ✅ Environment-based configuration
- ✅ Error messages without sensitive data

---

## 📊 Architecture Layers

```
HTTP Request
    ↓
Controllers (req/res handling)
    ↓
Use Cases (business logic)
    ↓
Repository Interface (DB abstraction)
    ↓
Repository Implementation (MongoDB)
    ↓
Database
```

**Benefits:**
- Easy to test (mock repositories)
- Easy to swap databases
- Easy to extend (add use cases)
- Clear separation of concerns

---

## 🧪 Testing

### Option 1: VS Code REST Client
1. Install "REST Client" extension
2. Open `api.rest` file
3. Click "Send Request" on any endpoint

### Option 2: cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Option 3: Postman
Import endpoints from `api.rest` file

See **TESTING_GUIDE.md** for comprehensive test scenarios.

---

## 🎓 What You Learn

This project demonstrates:
- ✅ Clean Architecture principles
- ✅ Repository pattern for data abstraction
- ✅ JWT authentication & authorization
- ✅ TypeScript best practices
- ✅ Express middleware patterns
- ✅ MongoDB with Mongoose
- ✅ Bcrypt password hashing
- ✅ Layered application design

---

## 📝 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/jwt-auth
JWT_SECRET=change_this_to_random_string
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=change_this_to_random_string
JWT_REFRESH_EXPIRE=30d
PORT=5000
NODE_ENV=development
```

**⚠️ Security:** Change all secrets in production!

---

## 🚀 Deployment Checklist

- [ ] Update JWT secrets to strong random values
- [ ] Set NODE_ENV=production
- [ ] Use managed MongoDB service (MongoDB Atlas)
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Add request logging
- [ ] Set up monitoring
- [ ] Configure backups

---

## 📦 Dependencies

```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "jsonwebtoken": "JWT token management",
  "bcryptjs": "Password hashing",
  "dotenv": "Environment variables",
  "typescript": "Type safety"
}
```

---

## 🤝 Next Steps

### Easy Extensions
1. Add email verification
2. Add password reset flow
3. Add 2FA (Two-Factor Authentication)
4. Add API rate limiting
5. Add audit logging

### Database Alternatives
- Switch to PostgreSQL (create `PostgresUserRepository`)
- Switch to DynamoDB (create `DynamoUserRepository`)
- Switch to Redis (create `RedisUserRepository`)

### Scaling
- Add Redis for session caching
- Add request/response logging
- Add performance monitoring
- Add CI/CD pipeline
- Add comprehensive test suite

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection refused | Ensure MongoDB running on port 27017 or update MONGODB_URI |
| Token verification failed | Check JWT_SECRET is correct; verify token hasn't expired |
| Port already in use | Change PORT in .env file |
| Module not found | Run `npm install` then `npm run build` |

See **SETUP_GUIDE.md** for more troubleshooting.

---

## 📄 License

ISC

---

## ✨ Summary

This is a **complete, production-ready authentication system** that proves:

> **With proper architecture, you can build scalable, maintainable systems that are easy to test, extend, and adapt.**

Whether you're building a small API or scaling to enterprise, this foundation will serve you well.

**Start building! 🚀**

---

**For detailed documentation, see README.md**
