# Backend API Specification

This document provides complete specifications for implementing the Node.js + MongoDB backend for the ATS-Friendly Resume Builder application.

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [AI Integration](#ai-integration)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)

## Overview

The backend is a RESTful API built with Node.js and Express, using MongoDB for data storage and JWT for authentication.

**Base URL**: `http://your-domain.com/api`

## Technology Stack

### Required Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "helmet": "^7.0.0",
    "express-validator": "^7.0.0"
  }
}
```

### Optional (for AI features)
```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.9.0"
  }
}
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (required, unique, lowercase, trim),
  password: String (required, hashed with bcrypt),
  fullName: String (required, trim),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}

// Indexes
users.createIndex({ email: 1 }, { unique: true });
```

### Resumes Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: 'User'),
  title: String (required, default: 'Untitled Resume'),
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    website: String,
    jobTitle: String,
    summary: String
  },
  education: [{
    school: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String,
    bullets: [String]
  }],
  skills: [String],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    url: String
  }],
  template: String (default: 'modern'),
  atsScore: Number (nullable),
  lastAnalyzedAt: Date (nullable),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}

// Indexes
resumes.createIndex({ userId: 1 });
resumes.createIndex({ updatedAt: -1 });
```

### ATS Analyses Collection (Optional - for history tracking)
```javascript
{
  _id: ObjectId,
  resumeId: ObjectId (required, ref: 'Resume'),
  userId: ObjectId (required, ref: 'User'),
  score: Number (required),
  analysis: String (required),
  jobDescription: String (nullable),
  missingKeywords: [String],
  suggestions: [String],
  createdAt: Date (default: Date.now)
}

// Indexes
atsAnalyses.createIndex({ resumeId: 1 });
atsAnalyses.createIndex({ userId: 1 });
```

## Authentication

### JWT Token Structure
```javascript
{
  userId: String (MongoDB ObjectId),
  email: String,
  iat: Number (issued at timestamp),
  exp: Number (expiration timestamp - 7 days from issue)
}
```

### Password Hashing
- Use bcrypt with salt rounds of 10
- Never store plain text passwords

### Middleware: Authentication
```javascript
// Protect routes by verifying JWT token
// Extract token from Authorization header: "Bearer <token>"
// Attach user object to request: req.user
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Validation:**
- Email: valid email format, not already registered
- Password: minimum 6 characters
- Full name: required, non-empty

**Response (201):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Validation errors or email already exists
- 500: Server error

---

#### POST /api/auth/signin
Sign in to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 401: Invalid email or password
- 500: Server error

---

#### GET /api/auth/me
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "fullName": "John Doe",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- 401: Invalid or missing token
- 500: Server error

---

### Resume Endpoints

#### GET /api/resumes
Get all resumes for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Software Engineer Resume",
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "jobTitle": "Senior Software Engineer"
    },
    "education": [...],
    "experience": [...],
    "skills": ["JavaScript", "React", "Node.js"],
    "certifications": [...],
    "template": "modern",
    "atsScore": 85,
    "lastAnalyzedAt": "2024-01-15T12:00:00.000Z",
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
]
```

**Query Parameters (optional):**
- `limit`: Number of results (default: 50)
- `skip`: Number of results to skip for pagination
- `sort`: Sort field (default: -updatedAt)

**Error Responses:**
- 401: Unauthorized
- 500: Server error

---

#### GET /api/resumes/:id
Get a specific resume by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "title": "Software Engineer Resume",
  "personalInfo": {...},
  "education": [...],
  "experience": [...],
  "skills": [...],
  "certifications": [...],
  "template": "modern",
  "atsScore": 85,
  "lastAnalyzedAt": "2024-01-15T12:00:00.000Z",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden (not the owner)
- 404: Resume not found
- 500: Server error

---

#### POST /api/resumes
Create a new resume.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My New Resume"
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "title": "My New Resume",
  "personalInfo": {},
  "education": [],
  "experience": [],
  "skills": [],
  "certifications": [],
  "template": "modern",
  "atsScore": null,
  "lastAnalyzedAt": null,
  "createdAt": "2024-01-16T10:30:00.000Z",
  "updatedAt": "2024-01-16T10:30:00.000Z"
}
```

**Error Responses:**
- 400: Validation error
- 401: Unauthorized
- 500: Server error

---

#### PATCH /api/resumes/:id
Update an existing resume.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "personalInfo": {...},
  "education": [...],
  "experience": [...],
  "skills": [...],
  "certifications": [...],
  "template": "minimal",
  "atsScore": 90,
  "lastAnalyzedAt": "2024-01-16T10:30:00.000Z"
}
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "title": "Updated Title",
  "personalInfo": {...},
  "education": [...],
  "experience": [...],
  "skills": [...],
  "certifications": [...],
  "template": "minimal",
  "atsScore": 90,
  "lastAnalyzedAt": "2024-01-16T10:30:00.000Z",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-16T10:35:00.000Z"
}
```

**Error Responses:**
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (not the owner)
- 404: Resume not found
- 500: Server error

---

#### DELETE /api/resumes/:id
Delete a resume.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
No content

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden (not the owner)
- 404: Resume not found
- 500: Server error

---

### AI-Powered Endpoints

#### POST /api/resumes/analyze
Analyze a resume for ATS compatibility.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "resumeData": {
    "personalInfo": {...},
    "education": [...],
    "experience": [...],
    "skills": [...]
  },
  "jobDescription": "Optional job description text for comparison"
}
```

**Response (200):**
```json
{
  "score": 85,
  "analysis": "Detailed analysis text explaining strengths and weaknesses...",
  "timestamp": "2024-01-16T10:30:00.000Z"
}
```

**AI Prompt Template:**
```
You are an ATS (Applicant Tracking System) expert. Analyze the following resume and provide:
1. A compatibility score (0-100)
2. Detailed feedback on formatting, keywords, and structure
3. Specific suggestions for improvement

Resume Data:
{resumeData}

Job Description (if provided):
{jobDescription}

Provide your response in this format:
Score: [number]
Analysis: [detailed feedback]
```

**Error Responses:**
- 400: Invalid request data
- 401: Unauthorized
- 429: Rate limit exceeded (if using external AI API)
- 500: Server error

---

#### POST /api/resumes/suggest
Generate content suggestions for resume sections.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "summary|bullet|skills",
  "context": "Current content or job context",
  "jobTitle": "Optional job title for context"
}
```

**Response (200):**
```json
{
  "suggestions": [
    "Suggested content item 1",
    "Suggested content item 2",
    "Suggested content item 3"
  ]
}
```

**AI Prompt Templates:**

For Summary:
```
Generate a professional resume summary for a {jobTitle}. 
Context: {context}
Provide 2-3 compelling summary options that highlight key achievements and skills.
```

For Bullet Points:
```
Generate professional resume bullet points for this experience:
{context}

Provide 3-5 achievement-focused bullet points using action verbs and quantifiable results.
```

For Skills:
```
Suggest relevant skills for a {jobTitle} position.
Current skills: {context}

Provide 5-10 relevant technical and soft skills that would strengthen this resume.
```

**Error Responses:**
- 400: Invalid request data
- 401: Unauthorized
- 429: Rate limit exceeded
- 500: Server error

---

## AI Integration

### Recommended AI Providers

1. **OpenAI GPT-4/3.5**
   ```javascript
   import OpenAI from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
   });
   
   const completion = await openai.chat.completions.create({
     model: "gpt-4",
     messages: [
       { role: "system", content: "You are an ATS expert..." },
       { role: "user", content: prompt }
     ]
   });
   ```

2. **Anthropic Claude**
   ```javascript
   import Anthropic from '@anthropic-ai/sdk';
   
   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY
   });
   
   const message = await anthropic.messages.create({
     model: 'claude-3-sonnet-20240229',
     messages: [{ role: 'user', content: prompt }]
   });
   ```

3. **Google Gemini**
   ```javascript
   import { GoogleGenerativeAI } from '@google/generative-ai';
   
   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
   
   const result = await model.generateContent(prompt);
   ```

### Rate Limiting
Implement rate limiting for AI endpoints:
- 10 requests per minute per user
- 100 requests per day per user

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Environment Variables

Create a `.env` file in your backend project:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/resume-builder
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resume-builder

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# AI Provider (choose one)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR
GEMINI_API_KEY=...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## Security Considerations

1. **CORS**: Configure allowed origins
2. **Helmet**: Use helmet middleware for security headers
3. **Input Validation**: Validate all user inputs
4. **SQL/NoSQL Injection**: Use parameterized queries
5. **Rate Limiting**: Implement rate limiting on all endpoints
6. **HTTPS**: Always use HTTPS in production
7. **Password Policy**: Enforce strong password requirements
8. **Token Expiration**: Implement JWT token expiration and refresh

## Deployment Checklist

- [ ] Set up MongoDB database (Atlas or self-hosted)
- [ ] Configure environment variables
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for frontend domain
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Set up backup strategy for database
- [ ] Configure AI API keys (if using AI features)
- [ ] Test all endpoints
- [ ] Set up CI/CD pipeline

## Sample Express Server Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   └── ATSAnalysis.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── resumes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── resumeController.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── pdfService.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── validators.js
│   └── index.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Testing

Recommended testing tools:
- **Jest**: Unit testing
- **Supertest**: API endpoint testing
- **MongoDB Memory Server**: Database testing

Example test:
```javascript
describe('POST /api/auth/signup', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123',
        fullName: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

## Support

For questions or issues with the API specification, please refer to the main project documentation or contact the development team.
