# JWT Authentication Server - Setup & Usage Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

**Important:** Change the JWT secrets in production!

### 3. Start MongoDB
Ensure MongoDB is running. For local development:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas - update MONGODB_URI in .env
```

### 4. Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Controllers (HTTP Layer)        │
│     - Handle requests/responses         │
│     - Input validation                  │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│       Use Cases (Business Logic)        │
│     - Independent of frameworks         │
│     - Core business rules               │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│    Repository Interface (Abstraction)   │
│     - Define data contracts             │
│     - No DB specifics                   │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   Repository Implementation (MongoDB)   │
│     - Actual DB operations              │
│     - Easy to swap for DynamoDB, etc    │
└─────────────────────────────────────────┘
```

### File Structure Explained

```
src/
├── entities/                          # Core Domain Models
│   └── User.ts                       # User type definitions & enums
│
├── repositories/                      # Data Access Layer
│   ├── IUserRepository.ts            # Interface (database-agnostic)
│   ├── models/
│   │   └── UserModel.ts              # MongoDB schema
│   └── implementations/
│       └── MongoUserRepository.ts    # MongoDB implementation
│
├── usecases/                          # Business Logic Layer
│   ├── RegisterUseCase.ts            # User registration logic
│   ├── LoginUseCase.ts               # Login logic with token generation
│   ├── RefreshTokenUseCase.ts        # Token refresh logic
│   ├── LogoutUseCase.ts              # Logout logic
│   └── GetUserUseCase.ts             # Fetch user data
│
├── controllers/                       # API Request Handlers
│   └── AuthController.ts             # Auth endpoint handlers
│
├── middleware/                        # Express Middleware
│   ├── AuthMiddleware.ts             # JWT verification & authorization
│   └── ErrorMiddleware.ts            # Error handling
│
├── routes/                            # API Route Definitions
│   └── authRoutes.ts                 # Auth routes
│
├── utils/                             # Utilities
│   ├── JwtUtil.ts                    # JWT token generation/verification
│   └── PasswordUtil.ts               # Password hashing/comparison
│
├── config/                            # Configuration
│   └── database.ts                   # MongoDB connection
│
└── index.ts                           # Application entry point
```

## Key Features Implementation

### 1. **User Registration**
- Email uniqueness validation
- Password hashing with bcrypt
- Default role assignment (USER)

**Flow:**
```
POST /register → Controller → RegisterUseCase → Repository → MongoDB
```

### 2. **Authentication (Login)**
- Email/password validation
- Access token generation
- Refresh token storage
- User data return

**Flow:**
```
POST /login → Controller → LoginUseCase 
  → Password validation → Token generation 
  → Save refresh token → Return tokens + user data
```

### 3. **Token Management**
- **Access Token**: Short-lived (7 days default), used for API authentication
- **Refresh Token**: Long-lived (30 days default), stored server-side for revocation

**Refresh Flow:**
```
POST /refresh → Controller → RefreshTokenUseCase
  → Verify refresh token → Check in DB → Generate new tokens
  → Revoke old refresh token → Return new tokens
```

### 4. **Role-Based Access Control**
Three roles implemented:
- `user` - Standard user
- `admin` - Full access
- `moderator` - Moderate access

**Usage in routes:**
```typescript
router.get(
  "/admin/endpoint",
  authenticate,
  authorize(UserRole.ADMIN),
  handler
);
```

### 5. **Session Logout**
- Remove refresh token from database
- Invalidates both tokens
- User can't refresh after logout

## Swapping Databases

### From MongoDB to DynamoDB

1. **Create new repository:**
```typescript
// src/repositories/implementations/DynamoUserRepository.ts
export class DynamoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    // DynamoDB implementation
  }
  async findById(id: string): Promise<IUser | null> {
    // DynamoDB implementation
  }
  // ... implement other methods
}
```

2. **Update database config:**
```typescript
// src/config/database.ts
export class DatabaseConfig {
  static async connect(): Promise<void> {
    // DynamoDB connection
  }
}
```

3. **Update app initialization:**
```typescript
// src/index.ts
import { DynamoUserRepository } from "./repositories/implementations/DynamoUserRepository.js";

const userRepository = new DynamoUserRepository();
```

**That's it!** The entire application still works because it depends on the `IUserRepository` interface, not the implementation.

## API Testing Examples

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current User (Protected)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Security Considerations

1. **Password Security**
   - Hashed with bcrypt (10 rounds)
   - Never returned in API responses
   - Compare using constant-time function

2. **Token Security**
   - Signed with secret keys
   - Cannot be modified by client
   - Expiration enforced server-side

3. **Refresh Token Security**
   - Stored in MongoDB (can be revoked)
   - One-time use per refresh (old token invalidated)
   - Longer expiration but server-side managed

4. **Environment Variables**
   - Never commit `.env` file
   - Use strong random secrets (minimum 32 characters)
   - Rotate secrets in production

## Extending the System

### Add New Use Case
```typescript
// src/usecases/ChangePasswordUseCase.ts
export class ChangePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}
  
  async execute(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    // ... implement logic
  }
}
```

### Add New Endpoint
```typescript
// In authRoutes.ts
router.post(
  "/change-password",
  authenticate,
  async (req, res) => {
    const useCase = new ChangePasswordUseCase(userRepository);
    // ... handle endpoint
  }
);
```

### Add Authorization Check
```typescript
router.delete(
  "/users/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  handler
);
```

## Troubleshooting

### MongoDB Connection Failed
- Check MongoDB is running: `mongodb://localhost:27017`
- Verify MONGODB_URI in `.env`
- For MongoDB Atlas, use connection string with credentials

### Token Verification Failed
- Ensure JWT_SECRET matches between token generation and verification
- Check token hasn't expired
- Verify Authorization header format: `Bearer <token>`

### CORS Issues (Frontend)
- Add CORS middleware to Express if needed:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## Production Deployment Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Change JWT_REFRESH_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Use managed MongoDB service (MongoDB Atlas)
- [ ] Enable HTTPS
- [ ] Add rate limiting middleware
- [ ] Add request logging
- [ ] Enable CORS properly
- [ ] Add health check endpoint
- [ ] Set up monitoring/alerts
- [ ] Regular backup strategy

## Performance Tips

1. Add database indexes on frequently queried fields
2. Implement caching for user profiles
3. Use connection pooling for MongoDB
4. Monitor token validation performance
5. Consider Redis for refresh token blacklist in high-traffic scenarios

## Next Steps

1. Add email verification on registration
2. Implement password reset flow
3. Add 2FA (Two-Factor Authentication)
4. Add API rate limiting
5. Implement audit logging
6. Add WebSocket support for real-time features
7. Create admin dashboard

---

**Happy Coding!** 🚀
