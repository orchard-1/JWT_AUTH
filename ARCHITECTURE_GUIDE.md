<!-- ARCHITECTURE_GUIDE.md - Visual and Detailed Architecture -->

# Architecture Guide - JWT Auth Server

## 🏗️ Clean Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Layer (Express)                    │
│                         :5000                               │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Express Routes
             ▼
┌─────────────────────────────────────────────────────────────┐
│                 Controllers (HTTP Handlers)                 │
│            - Parse requests (req.body, params)              │
│            - Call use cases                                 │
│            - Format responses                               │
│            - Handle errors                                  │
│                   AuthController.ts                         │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Direct Method Calls
             ▼
┌─────────────────────────────────────────────────────────────┐
│           Use Cases (Business Logic Layer)                  │
│         - RegisterUseCase: Handle signup logic              │
│         - LoginUseCase: Handle login + tokens               │
│         - RefreshTokenUseCase: Refresh tokens               │
│         - LogoutUseCase: Revoke tokens                      │
│         - GetUserUseCase: Fetch user data                   │
│     (Independent of Express, Mongoose, anything!)           │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Repository Interface (Abstraction)
             ▼
┌─────────────────────────────────────────────────────────────┐
│              IUserRepository Interface                       │
│  - findByEmail(email: string)                               │
│  - findById(id: string)                                     │
│  - create(user: IUser)                                      │
│  - update(id: string, user: Partial<IUser>)                │
│  - addRefreshToken(userId: string, token: string)          │
│  - removeRefreshToken(userId: string, token: string)       │
│  - getRefreshTokens(userId: string)                         │
│           (No database specifics here!)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Implementation Selection
             ▼
┌─────────────────────────────────────────────────────────────┐
│           Repository Implementation                         │
│                                                              │
│    ┌──────────────────────┐  ┌──────────────────────┐      │
│    │ MongoUserRepository  │  │ DynamoUserRepository │      │
│    │ (MongoDB)            │  │ (DynamoDB)           │      │
│    └──────────────────────┘  └──────────────────────┘      │
│    Implements IUserRepository                              │
│         (Easy to swap!)                                    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│         MongoDB ← or → DynamoDB ← or → PostgreSQL           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Data Flow Examples

### 1. Registration Flow

```
Client Request
    ↓
POST /api/auth/register
{email, password, name}
    ↓
AuthController.register()
  ├─ Validate input
  ├─ Create RegisterUseCase
  └─ Call useCase.execute()
    ↓
RegisterUseCase.execute()
  ├─ Check email not in use (userRepository.findByEmail)
  ├─ Hash password (PasswordUtil.hashPassword)
  ├─ Create user (userRepository.create)
  └─ Return user data
    ↓
UserRepository.create()
  ├─ Map to MongoDB schema
  ├─ Save to MongoDB
  └─ Return mapped user
    ↓
Response 201
{success, user data}
```

### 2. Login Flow

```
Client Request
    ↓
POST /api/auth/login
{email, password}
    ↓
AuthController.login()
  └─ Call LoginUseCase.execute()
    ↓
LoginUseCase.execute()
  ├─ Find user (userRepository.findByEmail)
  ├─ Compare password (PasswordUtil.comparePasswords)
  ├─ Generate access token (JwtUtil.generateAccessToken)
  ├─ Generate refresh token (JwtUtil.generateRefreshToken)
  ├─ Store refresh token (userRepository.addRefreshToken)
  └─ Return tokens + user
    ↓
Response 200
{accessToken, refreshToken, user}
```

### 3. Protected Request Flow

```
Client Request
    ↓
GET /api/auth/me
Authorization: Bearer {accessToken}
    ↓
AuthMiddleware.authenticate()
  ├─ Extract token from header
  ├─ Verify token (JwtUtil.verifyAccessToken)
  ├─ Extract user info from token
  ├─ Attach user to request (req.user)
  └─ Pass to next middleware
    ↓
Route Handler
  ├─ Access req.user (user ID, email, role)
  └─ Execute logic
    ↓
AuthController.getUser()
  └─ Call GetUserUseCase.execute(req.user.userId)
    ↓
GetUserUseCase.execute()
  └─ userRepository.findById(userId)
    ↓
Response 200
{user data without sensitive info}
```

### 4. Token Refresh Flow

```
Client Request
    ↓
POST /api/auth/refresh
{refreshToken}
    ↓
AuthController.refreshToken()
  └─ Call RefreshTokenUseCase.execute()
    ↓
RefreshTokenUseCase.execute()
  ├─ Verify refresh token (JwtUtil.verifyRefreshToken)
  ├─ Get user (userRepository.findById)
  ├─ Check token in DB (userRepository.getRefreshTokens)
  ├─ Remove old token (userRepository.removeRefreshToken)
  ├─ Generate new tokens
  ├─ Store new token (userRepository.addRefreshToken)
  └─ Return new tokens
    ↓
Response 200
{accessToken, refreshToken}
```

---

## 🎯 Dependency Injection Pattern

```typescript
// In src/index.ts

// 1. Create repository (data layer)
const userRepository = new MongoUserRepository();

// 2. Pass repository to controller
const authController = new AuthController(userRepository);

// 3. Controller creates use cases with repository
// (See AuthController constructor)

// 4. Use cases use repository without knowing implementation
class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}
  // userRepository could be MongoDB, DynamoDB, etc.
  // Use case doesn't care!
}
```

**Why this matters:**
- Use cases are completely decoupled from database
- Easy to test (mock repository)
- Easy to swap (different repository implementation)
- Single Responsibility Principle (each layer has one job)

---

## 🔄 Swapping Database - Architecture Perspective

### Current Setup
```
AuthController
    ↓
UseCase (depends on IUserRepository)
    ↓
IUserRepository (interface)
    ↓
MongoUserRepository (implements interface)
    ↓
MongoDB
```

### Switch to DynamoDB
```
AuthController
    ↓
UseCase (still depends on IUserRepository)
    ↓
IUserRepository (interface - unchanged)
    ↓
DynamoUserRepository (implements interface)
    ↓
DynamoDB
```

**Key insight:** UseCase layer doesn't change at all!

---

## 📊 Type System

```
Request Type Flow:
  (HTTP Request)
    ↓
  { email, password, name }
    ↓
  IUser { email, password, name, role, isActive, refreshTokens }
    ↓
  UserDocument (MongoDB)
    ↓
  IUser (returned to UseCase)
    ↓
  Response { id, email, name, role }
```

---

## 🛡️ Security Architecture

```
Request Entry
    ↓
1. Express Middleware Chain
   ├─ JSON parsing
   ├─ URL encoding
   └─ CORS (if configured)
    ↓
2. Routes
   ├─ Public routes (/register, /login, /refresh)
   └─ Protected routes (require AuthMiddleware)
    ↓
3. AuthMiddleware.authenticate() [for protected routes]
   ├─ Extract Authorization header
   ├─ Verify JWT signature
   ├─ Check expiration
   └─ Extract user info
    ↓
4. AuthMiddleware.authorize() [for role-based routes]
   ├─ Check req.user.role
   ├─ Compare with required roles
   └─ Allow or deny
    ↓
5. Controller
   ├─ Input validation
   └─ Business logic
    ↓
6. Database
   ├─ Permissions check
   └─ CRUD operations
```

---

## 🧩 Layer Responsibilities

### Entities Layer
- **Responsibility:** Define domain models
- **File:** `src/entities/User.ts`
- **Contains:** User interface, UserRole enum, IAuthPayload, IAuthResponse
- **Dependencies:** None (pure types)
- **Example:** No business logic, just types and interfaces

### Repository Layer
- **Responsibility:** Abstract data access
- **Files:** 
  - `src/repositories/IUserRepository.ts` (interface)
  - `src/repositories/implementations/MongoUserRepository.ts` (implementation)
- **Contains:** CRUD operations, database operations
- **Dependencies:** Entities, database driver (MongoDB)
- **Why separate:** Different DB = different implementation, same interface

### Use Case Layer
- **Responsibility:** Business logic
- **Files:** `src/usecases/*.ts`
- **Contains:** Authentication logic, validation, token generation
- **Dependencies:** Repository interface, utils (JWT, Password)
- **Why separate:** Tests run without database; logic is framework-independent

### Controller Layer
- **Responsibility:** HTTP request handling
- **File:** `src/controllers/AuthController.ts`
- **Contains:** Request parsing, use case invocation, response formatting
- **Dependencies:** Use cases, Express types
- **Why separate:** Easy to swap for GraphQL, WebSocket, etc.

### Middleware Layer
- **Responsibility:** Cross-cutting concerns
- **Files:** `src/middleware/*.ts`
- **Contains:** Authentication, authorization, error handling
- **Dependencies:** Express, JWT util
- **Why separate:** Reusable, composable, testable

### Route Layer
- **Responsibility:** Map HTTP paths to handlers
- **File:** `src/routes/authRoutes.ts`
- **Contains:** Route definitions, middleware application
- **Dependencies:** Controllers, middleware
- **Why separate:** Centralized route management

---

## 📈 Scalability Points

### 1. Multiple Repository Implementations
```
IUserRepository
├─ MongoUserRepository
├─ DynamoUserRepository
├─ PostgresUserRepository
├─ RedisUserRepository
└─ ... any database
```

### 2. Multiple Use Cases
```
RegisterUseCase
LoginUseCase
RefreshTokenUseCase
LogoutUseCase
GetUserUseCase
ChangePasswordUseCase    ← Add new
ResetPasswordUseCase     ← Add new
EnableTwoFactorUseCase   ← Add new
```

### 3. Multiple Middleware
```
AuthMiddleware
ErrorMiddleware
RateLimitMiddleware      ← Add new
LoggingMiddleware        ← Add new
CacheMiddleware          ← Add new
```

### 4. Controller Expansion
```
AuthController (current)
UserController           ← Add new
AdminController          ← Add new
```

---

## 🧪 Testing Architecture

### Unit Testing Use Cases
```typescript
// Test without database
describe('LoginUseCase', () => {
  const mockRepository = {
    findByEmail: jest.fn(),
    // ... other mocks
  };
  
  it('should login successfully', async () => {
    mockRepository.findByEmail.mockResolvedValue(user);
    const result = await useCase.execute(email, password);
    expect(result.accessToken).toBeDefined();
  });
});
```

### Integration Testing
```typescript
// Test with real database
describe('Login Integration', () => {
  it('should login real user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
  });
});
```

---

## 🚀 Performance Considerations

### 1. Token Caching
```
First token verification → Parse and verify → Cache result
Next token verification → Check cache → Faster response
```

### 2. Database Indexing
```
Find by email → Index email field (faster queries)
Find by ID → Index _id (MongoDB does by default)
```

### 3. Refresh Token Rotation
```
Each refresh:
1. Invalidate old token (remove from DB)
2. Issue new token (add to DB)
Benefits: Detect token reuse, prevent replay attacks
```

### 4. User Session Tracking
```
Each user can have multiple refresh tokens
(Multiple devices/sessions)
MongoDB tracks all: user.refreshTokens: [token1, token2, ...]
```

---

## 🎓 Learning Path

1. **Start Here:** Understand HTTP request flow (see flow diagrams above)
2. **Then:** Trace a request through each layer (e.g., login request)
3. **Next:** Understand why each layer exists (see layer responsibilities)
4. **Practice:** Add a new use case (e.g., ChangePasswordUseCase)
5. **Challenge:** Implement a new repository (e.g., PostgresUserRepository)
6. **Master:** Understand why this architecture enables change

---

## 🔗 Related Files

- See `SETUP_GUIDE.md` for implementation details
- See `TESTING_GUIDE.md` for testing examples
- See `README.md` for API documentation
- See code in `src/` for implementation

---

**Happy Learning! 🚀**
