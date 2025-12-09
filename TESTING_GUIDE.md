# Testing Guide - JWT Auth Server

## Running Tests

### Manual Testing with REST Client

#### Option 1: VS Code REST Client Extension
1. Install "REST Client" extension by Huachao Mao
2. Open `api.rest` file in project root
3. Click "Send Request" above each request

#### Option 2: cURL Commands
```bash
# Test each endpoint using cURL
curl -X GET http://localhost:5000/health
```

#### Option 3: Postman
1. Import the endpoints from `api.rest` file
2. Create environment variables for tokens
3. Run requests sequentially

---

## Test Scenarios

### Scenario 1: Full Authentication Flow

#### 1. Register New User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "johndoe@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "johndoe@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "johndoe@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "johndoe@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

**⚠️ IMPORTANT:** Save both tokens for next steps!

#### 3. Get Current User
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <accessToken>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "johndoe@example.com",
    "name": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 4. Refresh Token
```
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "johndoe@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

#### 5. Logout
```
POST http://localhost:5000/api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 6. Verify Logout (Try using refresh token)
```
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Refresh token not found or expired"
}
```

---

### Scenario 2: Error Cases

#### 2.1 Register with Duplicate Email
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "johndoe@example.com",
  "password": "SecurePass123!",
  "name": "Another John"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

#### 2.2 Login with Wrong Password
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "johndoe@example.com",
  "password": "WrongPassword"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 2.3 Access Protected Route Without Token
```
GET http://localhost:5000/api/auth/me
```

**Expected Response (401):**
```json
{
  "message": "Missing or invalid authorization header"
}
```

#### 2.4 Access Protected Route with Invalid Token
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer invalid_token_here
```

**Expected Response (401):**
```json
{
  "message": "Invalid or expired token"
}
```

#### 2.5 Access Admin Endpoint as Regular User
```
GET http://localhost:5000/api/auth/admin/users
Authorization: Bearer <userAccessToken>
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Forbidden: Insufficient permissions"
}
```

---

### Scenario 3: Token Expiration

#### Test Expired Token
1. Wait for access token to expire (default 7 days, but can set to seconds for testing)
2. Try accessing protected route

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <expiredToken>
```

**Expected Response (401):**
```json
{
  "message": "Invalid or expired token"
}
```

#### Use Refresh Token to Get New Access Token
```
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<validRefreshToken>"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Quick Test Checklist

### Authentication
- [ ] Register new user
- [ ] Register with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Register missing fields (should fail)

### Token Management
- [ ] Access protected route with valid token
- [ ] Access protected route without token (should fail)
- [ ] Access protected route with invalid token (should fail)
- [ ] Refresh token successfully
- [ ] Refresh with invalid token (should fail)

### Authorization
- [ ] Access admin endpoint with admin role
- [ ] Access admin endpoint with user role (should fail)
- [ ] Verify role is enforced at middleware level

### Session Management
- [ ] Logout successfully
- [ ] Try to use refresh token after logout (should fail)
- [ ] Verify tokens are invalidated

### Edge Cases
- [ ] Test with missing Authorization header
- [ ] Test with malformed Authorization header
- [ ] Test with empty request body
- [ ] Test with invalid JSON
- [ ] Test concurrent requests

---

## Performance Testing

### Load Test Tool: Apache AB
```bash
# Test registration endpoint
ab -n 100 -c 10 -p payload.json -T application/json http://localhost:5000/api/auth/register

# Test login endpoint
ab -n 100 -c 10 -p payload.json -T application/json http://localhost:5000/api/auth/login
```

### Monitoring Performance
Monitor console output for:
- Database query time
- Token generation time
- Response times

---

## Database Verification

### Check Created User in MongoDB

```javascript
// In MongoDB shell
db.users.find({ email: "johndoe@example.com" })

// Output should show:
{
  "_id": ObjectId("..."),
  "email": "johndoe@example.com",
  "name": "John Doe",
  "role": "user",
  "isActive": true,
  "refreshTokens": ["token1", "token2"],
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Verify Password is Hashed
- Password should start with `$2a$` or `$2b$` (bcrypt hash)
- Should NOT be plaintext
- Should NOT be reversible

---

## Debugging Tips

### 1. Enable Debug Logging
Add to your code:
```typescript
console.log("Request body:", req.body);
console.log("Token payload:", payload);
console.log("User from DB:", user);
```

### 2. Check MongoDB Connection
```typescript
// In src/config/database.ts
console.log("Connecting to:", process.env.MONGODB_URI);
console.log("Connected:", mongoose.connection.readyState);
// readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
```

### 3. Inspect JWT Token
Use https://jwt.io to decode tokens and verify:
- Signature validity
- Payload content
- Expiration time

### 4. Check Environment Variables
```bash
# Print all env vars (be careful with secrets!)
echo $env:MONGODB_URI
echo $env:JWT_SECRET
```

---

## Stress Testing Queries

### Test High Refresh Rate
```javascript
// Send refresh requests rapidly
setInterval(() => {
  fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token })
  });
}, 100);
```

Expected: Should handle gracefully or return appropriate rate limit error

### Test Concurrent Logins
```javascript
// Simulate multiple users logging in
for (let i = 0; i < 100; i++) {
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `user${i}@example.com`,
      password: 'password'
    })
  });
}
```

---

## Final Verification

✅ All endpoints respond with correct status codes
✅ Error messages are descriptive
✅ Passwords are properly hashed
✅ Tokens are properly signed
✅ Authorization is enforced
✅ Refresh tokens are tracked in DB
✅ Logout invalidates tokens
✅ Multiple refresh tokens per user work correctly

---

## Test Data

### Test User 1 (Regular User)
```json
{
  "email": "user@example.com",
  "password": "UserPass123!",
  "name": "Regular User"
}
```

### Test User 2 (Another User)
```json
{
  "email": "another@example.com",
  "password": "AnotherPass123!",
  "name": "Another User"
}
```

### Invalid Inputs
```json
{
  "email": "invalid-email",
  "password": "short",
  "name": ""
}
```

---

Happy Testing! 🧪
