# Agri Shield Pro - Backend Implementation

A comprehensive agricultural product monitoring and enforcement system with complete backend infrastructure.

## 🚀 Features Implemented

### Database & Authentication
- **PostgreSQL Database**: Complete schema with 8+ tables for all modules
- **NextAuth.js**: Secure authentication with role-based access control
- **Prisma ORM**: Type-safe database operations with migrations
- **User Roles**: DAO, Field Officer, Legal Officer, Lab Coordinator, HQ Monitoring, District Admin

### API Endpoints
- **Users API**: User management and authentication
- **Inspections API**: CRUD operations for inspection tasks
- **Seizures API**: Seizure logging and management
- **Lab Samples API**: Laboratory sample tracking
- **FIR Cases API**: Legal case management
- **Products API**: Agricultural product database
- **File Upload API**: Secure file storage with validation
- **Reports API**: Comprehensive reporting system

### Database Schema
- **Users**: Authentication and role management
- **Products**: Agricultural product catalog
- **Inspection Tasks**: Planning and execution tracking
- **Scan Results**: Product authenticity verification
- **Seizures**: Confiscated product logging
- **Lab Samples**: Laboratory testing workflow
- **FIR Cases**: Legal proceedings management
- **Files**: Document and media storage
- **Audit Logs**: Complete activity tracking

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon DB configured)
- npm or yarn package manager

### Installation

1. **Clone and Install Dependencies**
```bash
cd AGRISHIELD--master
npm install
```

2. **Environment Configuration**
The `.env.local` file is already configured with:
```env
DATABASE_URL="postgresql://neondb_owner:npg_sgx9W0eYICXl@ep-blue-firefly-a18x0pn4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:8005"
NEXTAUTH_SECRET="your-nextauth-secret-key-here-change-this-in-production"
```

3. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (already done)
npm run db:push

# Seed database with initial data (already done)
npm run db:seed
```

4. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:8005`

## 🔐 Demo Accounts

The database has been seeded with demo accounts:

| Role | Email | Password |
|------|-------|----------|
| District Agricultural Officer | dao@agrishield.com | password123 |
| Field Officer | field@agrishield.com | password123 |
| Legal Officer | legal@agrishield.com | password123 |
| Lab Coordinator | lab@agrishield.com | password123 |
| HQ Monitoring | hq@agrishield.com | password123 |
| District Admin | admin@agrishield.com | password123 |

## 📊 Database Management

### Available Scripts
```bash
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema changes to database
npm run db:migrate    # Create and run migrations
npm run db:seed       # Seed database with initial data
npm run db:studio     # Open Prisma Studio (database GUI)
```

### Database Studio
Access the database GUI:
```bash
npm run db:studio
```

## 🔌 API Documentation

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user

### Inspections
- `GET /api/inspections` - List inspections (with filters)
- `POST /api/inspections` - Create inspection
- `GET /api/inspections/[id]` - Get specific inspection
- `PUT /api/inspections/[id]` - Update inspection
- `DELETE /api/inspections/[id]` - Delete inspection

### Seizures
- `GET /api/seizures` - List seizures (with filters)
- `POST /api/seizures` - Create seizure

### Lab Samples
- `GET /api/lab-samples` - List lab samples (with filters)
- `POST /api/lab-samples` - Create lab sample
- `GET /api/lab-samples/[id]` - Get specific lab sample
- `PUT /api/lab-samples/[id]` - Update lab sample
- `DELETE /api/lab-samples/[id]` - Delete lab sample

### FIR Cases
- `GET /api/fir-cases` - List FIR cases (with filters)
- `POST /api/fir-cases` - Create FIR case

### Products
- `GET /api/products` - List products (with filters)
- `POST /api/products` - Create product

### File Upload
- `POST /api/files/upload` - Upload file
- `GET /api/files/upload` - List uploaded files

### Reports
- `GET /api/reports?type=dashboard` - Dashboard report
- `GET /api/reports?type=inspections` - Inspections report
- `GET /api/reports?type=seizures` - Seizures report
- `GET /api/reports?type=lab-samples` - Lab samples report
- `GET /api/reports?type=fir-cases` - FIR cases report

## 🏗️ Architecture

### Backend Structure
```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── users/          # User management
│   │   ├── inspections/    # Inspection CRUD
│   │   ├── seizures/       # Seizure logging
│   │   ├── lab-samples/    # Lab sample tracking
│   │   ├── fir-cases/      # Legal case management
│   │   ├── products/       # Product database
│   │   ├── files/          # File upload
│   │   └── reports/        # Reporting system
│   └── auth/
│       └── signin/         # Authentication pages
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Database client
│   └── api.ts             # Frontend API utilities
├── types/
│   └── next-auth.d.ts     # TypeScript definitions
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts           # Database seeding
```

### Key Features
- **Type Safety**: Full TypeScript implementation with Prisma
- **Authentication**: Secure JWT-based authentication with NextAuth
- **Role-Based Access**: Different permissions for different user roles
- **File Upload**: Secure file handling with validation
- **Audit Logging**: Complete activity tracking
- **Error Handling**: Comprehensive error handling and validation
- **API Utilities**: Frontend integration helpers

## 🔧 Development

### Adding New API Endpoints
1. Create route file in `src/app/api/[endpoint]/route.ts`
2. Implement HTTP methods (GET, POST, PUT, DELETE)
3. Add authentication and authorization checks
4. Update API utilities in `src/lib/api.ts`

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update seed file if needed
4. Regenerate Prisma client: `npm run db:generate`

### Testing
- Use Prisma Studio to inspect database: `npm run db:studio`
- Test API endpoints with tools like Postman or curl
- Check authentication flow at `/auth/signin`

## 🚀 Production Deployment

1. **Environment Variables**: Update production environment variables
2. **Database**: Set up production PostgreSQL database
3. **Authentication**: Generate secure NEXTAUTH_SECRET
4. **File Storage**: Configure production file storage
5. **Monitoring**: Set up logging and monitoring

## 📝 Notes

- Database is already configured and seeded with sample data
- All API endpoints include proper authentication and authorization
- File uploads are stored in `public/uploads/` directory
- Audit logs track all database operations
- Role-based access control is implemented throughout

## 🤝 Support

For issues or questions regarding the backend implementation, please refer to the API documentation above or check the database schema in `prisma/schema.prisma`.
