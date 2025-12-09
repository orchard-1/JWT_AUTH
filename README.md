# JWT Authentication Server

A production-ready JWT authentication server built with Express, MongoDB, and TypeScript, using Clean Architecture principles. Designed for easy database swapping and scalability.

## Features

- ✅ User Registration with email validation
- ✅ Login with secure password hashing
- ✅ JWT Access Tokens (short-lived)
- ✅ JWT Refresh Tokens (long-lived)
- ✅ Token Expiration Management
- ✅ Role-Based Access Control (Admin, User, Moderator)
- ✅ User Session Management
- ✅ Clean Architecture Pattern
- ✅ Database Abstraction Layer (easily swap MongoDB for DynamoDB, PostgreSQL, etc.)
- ✅ TypeScript Support
- ✅ Error Handling & Validation

## Project Structure

```
src/
├── entities/              # Domain models and interfaces
│   └── User.ts           # User entity and types
├── repositories/          # Data access layer (abstracted)
│   ├── IUserRepository.ts    # Repository interface
│   ├── models/           # Database models
│   │   └── UserModel.ts
│   └── implementations/   # Concrete implementations
│       └── MongoUserRepository.ts
├── usecases/             # Business logic layer
│   ├── RegisterUseCase.ts
│   ├── LoginUseCase.ts
│   ├── RefreshTokenUseCase.ts
│   ├── LogoutUseCase.ts
│   └── GetUserUseCase.ts
├── controllers/          # API layer
│   └── AuthController.ts
├── middleware/           # Express middleware
│   ├── AuthMiddleware.ts (Authentication & Authorization)
│   └── ErrorMiddleware.ts
├── routes/              # API routes
│   └── authRoutes.ts
├── utils/               # Utility functions
│   ├── JwtUtil.ts
│   └── PasswordUtil.ts
├── config/              # Configuration
│   └── database.ts
└── index.ts            # App entry point
```

## Installation

### Prerequisites
- Node.js 16+
- MongoDB 4.0+
- npm or yarn

### Setup

1. Clone and install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/jwt-auth
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
JWT_REFRESH_EXPIRE=30d
PORT=5000
NODE_ENV=development
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

#### 3. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

#### 4. Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 5. Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 6. Admin Only Endpoint (Protected, Requires Admin Role)
```http
GET /api/auth/admin/users
Authorization: Bearer <accessToken>
```

**Response (200) - if user has ADMIN role:**
```json
{
  "success": true,
  "message": "Admin only endpoint - requires ADMIN role"
}
```

**Response (403) - if user doesn't have ADMIN role:**
```json
{
  "success": false,
  "message": "Forbidden: Insufficient permissions"
}
```

## Clean Architecture Benefits

### 1. **Entities Layer** (`src/entities/`)
- Pure business logic models
- No external dependencies
- Easy to test and understand

### 2. **Repositories Layer** (`src/repositories/`)
- Abstract database operations
- Easily swap implementations
- Example: Switch from MongoDB to DynamoDB by creating `DynamoUserRepository.ts`

### 3. **Use Cases Layer** (`src/usecases/`)
- Contains business logic
- Independent of frameworks
- High-level application policies

### 4. **Controllers Layer** (`src/controllers/`)
- HTTP request handling
- Input validation
- Response formatting

## Swapping Databases

To switch from MongoDB to another database (e.g., DynamoDB, PostgreSQL):

1. **Create new repository implementation:**
```typescript
// src/repositories/implementations/DynamoUserRepository.ts
export class DynamoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    // DynamoDB implementation
  }
  // ... implement other methods
}
```

2. **Update the app initialization:**
```typescript
// In src/index.ts
const userRepository = new DynamoUserRepository(); // Change this line
```

The rest of the application remains unchanged!

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/jwt-auth` | MongoDB connection string |
| `JWT_SECRET` | - | Secret key for access tokens (CHANGE THIS!) |
| `JWT_EXPIRE` | `7d` | Access token expiration time |
| `JWT_REFRESH_SECRET` | - | Secret key for refresh tokens (CHANGE THIS!) |
| `JWT_REFRESH_EXPIRE` | `30d` | Refresh token expiration time |
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment (development/production) |

## Security Best Practices

1. ✅ Passwords are hashed with bcrypt (10 rounds)
2. ✅ JWT tokens are signed with secret keys
3. ✅ Refresh tokens are stored server-side (can be revoked)
4. ✅ Access tokens have short expiration (7 days default)
5. ✅ Refresh tokens have long expiration (30 days default)
6. ✅ Environment variables for sensitive data
7. ✅ Role-based access control implemented

## Error Handling

The API returns proper HTTP status codes and error messages:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Internal Server Error

## Token Expiration

### Access Token
- **Duration**: 7 days (configurable)
- **Usage**: Authenticate API requests
- **Stored**: Client-side (localStorage, cookies, etc.)

### Refresh Token
- **Duration**: 30 days (configurable)
- **Usage**: Get new access token
- **Stored**: Server-side (MongoDB) & Client-side

## User Roles

The system supports three built-in roles:

- `user` - Standard user (default)
- `admin` - Administrator access
- `moderator` - Moderator privileges

Add role-based endpoints using middleware:
```typescript
router.get(
  "/admin/endpoint",
  (req, res, next) => AuthMiddleware.authenticate(req, res, next),
  AuthMiddleware.authorize(UserRole.ADMIN),
  handler
);
```

## Development Tips

### Add New Use Case
1. Create `src/usecases/NewUseCase.ts`
2. Implement business logic
3. Use repository interface (stays agnostic to DB)

### Add New Endpoint
1. Add method to `AuthController`
2. Create route in `authRoutes.ts`
3. Use middleware for protection/authorization

### Change Database
1. Implement `IUserRepository` for new DB
2. Update initialization in `src/index.ts`
3. No other changes needed!

## License

ISC

## Contributing

Contributions welcome! Follow clean architecture principles when adding features.
