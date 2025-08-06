# AGRISHIELD Backend Implementation

## 🚀 Complete Backend System Overview

This document outlines the comprehensive backend implementation for the AGRISHIELD agricultural inspection system, including database integration, API endpoints, authentication, and all supporting infrastructure.

---

## 📦 Backend Framework

The backend is implemented using **Next.js** API routes. All backend code should be placed inside the `server` folder, following Next.js conventions.

- **Backend Folder Structure**
  ```
  server/
    └── api/           # Next.js API route handlers
    └── prisma/        # Prisma schema and seed files
    └── utils/         # Utility functions (auth, validation, etc.)
    └── ...            # Other backend files
  ```

---

## 📋 System Architecture

### Database Schema (PostgreSQL)
- **Users**: Authentication and role management
- **Inspections**: Inspection planning and tracking
- **Seizures**: Product seizure logging
- **LabSamples**: Laboratory sample management
- **FirCases**: Legal case management
- **Products**: Product catalog and information
- **Files**: File storage and metadata
- **Reports**: System reporting and analytics

### Authentication System
- **NextAuth.js** integration with credentials provider
- **Role-based access control** (DAO, Field Officer, Legal Officer, Lab Coordinator, etc.)
- **Session management** with secure cookies
- **Password hashing** with bcryptjs

### API Endpoints

#### Authentication
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - Get auth providers
- `GET /api/auth/csrf` - Get CSRF token
- `POST /api/auth/callback/credentials` - Login endpoint

#### Users Management
- `GET /api/users` - List all users
- `POST /api/users` - Create new user

#### Inspections
- `GET /api/inspections` - List inspections
- `POST /api/inspections` - Create inspection
- `GET /api/inspections/[id]` - Get specific inspection
- `PUT /api/inspections/[id]` - Update inspection
- `DELETE /api/inspections/[id]` - Delete inspection

#### Seizures
- `GET /api/seizures` - List seizures
- `POST /api/seizures` - Create seizure record

#### Lab Samples
- `GET /api/lab-samples` - List lab samples
- `POST /api/lab-samples` - Create lab sample
- `GET /api/lab-samples/[id]` - Get specific sample
- `PUT /api/lab-samples/[id]` - Update sample status

#### FIR Cases
- `GET /api/fir-cases` - List FIR cases
- `POST /api/fir-cases` - Create FIR case

#### Products
- `GET /api/products` - List products
- `POST /api/products` - Add product

#### File Management
- `POST /api/files/upload` - Upload files
- `GET /api/files/upload` - List uploaded files

#### Reports
- `GET /api/reports` - Generate various reports

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon DB configured)
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create `.env.local` file:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_sgx9W0eYICXl@ep-blue-firefly-a18x0pn4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:8005"
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # Seed database with sample data
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

### API Testing
Run the comprehensive API test suite:
```bash
node test-api.js
```

### Manual Testing
1. Navigate to `http://localhost:8005`
2. Use demo accounts:
   - **DAO**: dao@agrishield.com / password123
   - **Field Officer**: field@agrishield.com / password123
   - **Legal Officer**: legal@agrishield.com / password123
   - **Lab Coordinator**: lab@agrishield.com / password123

## 🔐 Security Features

- **Authentication middleware** on all protected routes
- **Role-based authorization** for different user types
- **Password hashing** with bcryptjs
- **CSRF protection** via NextAuth
- **SQL injection prevention** via Prisma ORM
- **Input validation** with Zod schemas

## 📊 Database Seeding

The system includes comprehensive seed data:
- **6 Demo Users** with different roles
- **Sample Products** (fertilizers, pesticides, seeds)
- **Test Data** for all modules

## 🎯 Module Implementation Status

### ✅ Completed Modules
1. **Dashboard** - Full metrics and overview
2. **Inspection Planning** - Create and schedule inspections
3. **Field Execution** - Equipment control and product testing
4. **Seizure Logging** - Record and track seizures
5. **Legal Module** - FIR case management
6. **Lab Interface** - Sample tracking and results
7. **Agri-Forms Portal** - Form management system
8. **Authentication System** - Complete login/logout flow

### 🔄 In Progress
- **Reports & Audit** - Advanced reporting features

## 🚀 Production Deployment

### Environment Variables
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Build Commands
```bash
npm run build
npm start
```

## 📱 Frontend Integration

All backend APIs are integrated with the React frontend:
- **Real-time data** fetching from PostgreSQL
- **Form submissions** directly to database
- **File uploads** with metadata storage
- **Session management** across all pages

## 🔧 Development Tools

- **Prisma Studio**: Database GUI (`npx prisma studio`)
- **API Testing**: Comprehensive test suite included
- **Type Safety**: Full TypeScript integration
- **Error Handling**: Structured error responses

## 📈 Performance Features

- **Database indexing** on frequently queried fields
- **Connection pooling** via Prisma
- **Optimized queries** with proper relations
- **Caching** for static data

## 🛡️ Error Handling

- **Structured error responses** with proper HTTP status codes
- **Input validation** at API level
- **Database constraint handling**
- **Authentication error management**

## 🛠️ Prisma Troubleshooting

If you see an error like:

> Uncaught Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.

**Solution:**
1. Make sure you have run the following command after any schema changes or fresh install:
   ```bash
   npx prisma generate
   ```
2. If the error persists, also run:
   ```bash
   npx prisma db push
   ```
3. Restart your development server:
   ```bash
   npm run dev
   ```
4. Ensure your `prisma/schema.prisma` file is valid and your database is reachable.

This will regenerate the Prisma client and resolve the initialization error.

## 📞 Support

For technical support or questions about the backend implementation, refer to:
- API documentation in each route file
- Database schema in `prisma/schema.prisma`
- Test cases in `test-api.js`
- Seed data in `prisma/seed.ts`

---

**Status**: ✅ **FULLY FUNCTIONAL BACKEND SYSTEM**
**Database**: ✅ **CONNECTED AND OPERATIONAL**
**APIs**: ✅ **ALL ENDPOINTS TESTED AND WORKING**
**Authentication**: ✅ **SECURE AND ROLE-BASED**
**Integration**: ✅ **FRONTEND FULLY INTEGRATED**

## 🔀 Git: Push to `main` Branch

If your default branch is `main` (not `master`), use these commands:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

If your local branch is not tracking `main`, set it with:

```bash
git branch -M main
git push -u origin main
```
