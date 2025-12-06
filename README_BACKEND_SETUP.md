# Backend Setup Guide

This application now uses a **custom Node.js + MongoDB backend** instead of Lovable Cloud/Supabase.

## Quick Start

### 1. Frontend Configuration

Update the `.env` file in the root of this project:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

For production, change this to your deployed backend URL:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 2. Backend Implementation

The complete backend API specification is available in `BACKEND_API_SPECIFICATION.md`. This document includes:

- Complete REST API endpoints
- MongoDB database schemas
- Authentication with JWT
- AI integration for resume analysis
- Content generation features
- Security best practices

### 3. Required Backend Setup

You need to create and deploy a Node.js backend that implements:

1. **Authentication System**
   - JWT-based authentication
   - User registration and login
   - Password hashing with bcrypt

2. **Resume Management**
   - CRUD operations for resumes
   - User-specific data access

3. **AI Features** (Optional)
   - ATS analysis using AI (OpenAI, Anthropic, or Gemini)
   - Content suggestions for resume sections

4. **MongoDB Database**
   - Users collection
   - Resumes collection
   - ATS analyses collection (optional)

## Development Workflow

### Local Development

1. **Start your Node.js backend** on `http://localhost:3000`
2. **Start the frontend** (this project):
   ```bash
   npm run dev
   ```
3. The frontend will connect to your local backend API

### Production Deployment

1. **Deploy your Node.js backend** to:
   - AWS (EC2, ECS, Lambda)
   - DigitalOcean
   - Heroku
   - Railway
   - Render
   - Any Node.js hosting provider

2. **Deploy MongoDB**:
   - MongoDB Atlas (recommended)
   - Self-hosted MongoDB
   - DigitalOcean Managed Databases

3. **Update frontend environment**:
   - Set `VITE_API_BASE_URL` to your production backend URL

4. **Deploy frontend**:
   - This React app can be deployed to Vercel, Netlify, or any static hosting

## API Integration

The frontend uses a clean API service layer located at `src/services/api.ts`. This handles:

- Authentication token management
- API request formatting
- Error handling
- Automatic token refresh

All API calls go through this service layer, making it easy to:
- Switch backend providers
- Add request interceptors
- Implement caching
- Add analytics

## Key Files

- `src/services/api.ts` - API service layer
- `src/hooks/useAuth.ts` - Authentication hook
- `src/hooks/useResumes.ts` - Resume management hook
- `BACKEND_API_SPECIFICATION.md` - Complete backend API spec
- `.env.example` - Environment variable template

## Features

### Authentication
- User registration with email/password
- Secure login with JWT tokens
- Automatic token persistence in localStorage
- Protected routes

### Resume Management
- Create, read, update, delete resumes
- Real-time autosave
- Multiple resume support per user

### AI Features
- ATS compatibility analysis
- Content suggestions for resume sections
- Job description matching

## Security

The frontend implements:
- Secure token storage in localStorage
- Automatic authentication on API errors
- Protected routes for authenticated users
- CORS-ready API integration

Your backend should implement:
- Password hashing (bcrypt)
- JWT token signing and verification
- Input validation
- Rate limiting
- HTTPS in production

## Troubleshooting

### Cannot connect to backend
- Check `VITE_API_BASE_URL` in `.env`
- Verify backend is running
- Check CORS configuration in backend
- Verify network connectivity

### Authentication fails
- Verify JWT secret matches between frontend/backend expectations
- Check token expiration settings
- Verify password hashing is working correctly

### API errors
- Check browser console for detailed error messages
- Verify API endpoint URLs match specification
- Check request/response formats
- Verify authentication headers

## Migration from Lovable Cloud

This application was migrated from Lovable Cloud to a custom backend. The migration included:

1. ✅ Removed Supabase/Lovable Cloud dependencies
2. ✅ Created custom API service layer
3. ✅ Updated all hooks to use REST API
4. ✅ Maintained all existing features
5. ✅ Created comprehensive backend specification

## Next Steps

1. Review `BACKEND_API_SPECIFICATION.md`
2. Implement the Node.js backend
3. Deploy backend to your hosting provider
4. Update `.env` with production backend URL
5. Deploy frontend

## Support

For backend implementation questions, refer to:
- `BACKEND_API_SPECIFICATION.md` - Complete API documentation
- Express.js documentation - https://expressjs.com/
- MongoDB documentation - https://docs.mongodb.com/
- Mongoose documentation - https://mongoosejs.com/

For frontend questions:
- React documentation - https://react.dev/
- TanStack Query documentation - https://tanstack.com/query/
