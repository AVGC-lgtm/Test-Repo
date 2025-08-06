# AGRISHIELD API Documentation

## 🌐 Base URL
```
Development: http://localhost:8005
Production: https://your-domain.com
```

## 🔐 Authentication

All protected endpoints require authentication via NextAuth session cookies.

### Authentication Endpoints

#### Get Session
```http
GET /api/auth/session
```
Returns current user session information.

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "FIELD_OFFICER"
  },
  "expires": "2024-01-01T00:00:00.000Z"
}
```

#### Get Providers
```http
GET /api/auth/providers
```
Returns available authentication providers.

#### Get CSRF Token
```http
GET /api/auth/csrf
```
Returns CSRF token for form submissions.

## 👥 Users API

### List Users
```http
GET /api/users
```
**Auth Required:** Yes  
**Roles:** DAO, DISTRICT_ADMIN

**Response:**
```json
{
  "users": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "FIELD_OFFICER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create User
```http
POST /api/users
```
**Auth Required:** Yes  
**Roles:** DAO, DISTRICT_ADMIN

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "password123",
  "role": "FIELD_OFFICER"
}
```

## 🔍 Inspections API

### List Inspections
```http
GET /api/inspections
```
**Auth Required:** Yes

**Query Parameters:**
- `status` - Filter by status (SCHEDULED, IN_PROGRESS, COMPLETED)
- `assignedTo` - Filter by assigned officer ID
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "inspections": [
    {
      "id": "inspection-id",
      "location": "Market Name",
      "targetType": "RETAIL_STORE",
      "status": "SCHEDULED",
      "scheduledDate": "2024-01-01T10:00:00.000Z",
      "assignedOfficer": {
        "id": "officer-id",
        "name": "Officer Name"
      },
      "equipment": ["TruScan Device", "Axon Body Cam"]
    }
  ],
  "total": 10,
  "hasMore": false
}
```

### Create Inspection
```http
POST /api/inspections
```
**Auth Required:** Yes  
**Roles:** DAO, FIELD_OFFICER

**Request Body:**
```json
{
  "location": "Market Name",
  "targetType": "RETAIL_STORE",
  "assignedOfficerId": "officer-id",
  "scheduledDate": "2024-01-01T10:00:00.000Z",
  "equipment": ["TruScan Device", "Axon Body Cam"],
  "notes": "Routine inspection"
}
```

### Get Inspection
```http
GET /api/inspections/[id]
```
**Auth Required:** Yes

### Update Inspection
```http
PUT /api/inspections/[id]
```
**Auth Required:** Yes  
**Roles:** DAO, FIELD_OFFICER (assigned officer)

### Delete Inspection
```http
DELETE /api/inspections/[id]
```
**Auth Required:** Yes  
**Roles:** DAO

## 📦 Seizures API

### List Seizures
```http
GET /api/seizures
```
**Auth Required:** Yes

**Response:**
```json
{
  "seizures": [
    {
      "id": "seizure-id",
      "inspectionId": "inspection-id",
      "productName": "Counterfeit Fertilizer",
      "quantity": 50,
      "unit": "kg",
      "reason": "Suspected counterfeit",
      "location": "Shop Address",
      "status": "SEIZED",
      "seizedBy": {
        "id": "officer-id",
        "name": "Officer Name"
      },
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

### Create Seizure
```http
POST /api/seizures
```
**Auth Required:** Yes  
**Roles:** FIELD_OFFICER

**Request Body:**
```json
{
  "inspectionId": "inspection-id",
  "productName": "Product Name",
  "quantity": 10,
  "unit": "kg",
  "reason": "Violation reason",
  "location": "Seizure location",
  "evidence": ["photo1.jpg", "photo2.jpg"]
}
```

## 🧪 Lab Samples API

### List Lab Samples
```http
GET /api/lab-samples
```
**Auth Required:** Yes

**Response:**
```json
{
  "samples": [
    {
      "id": "sample-id",
      "seizureId": "seizure-id",
      "sampleCode": "LAB-2024-001",
      "productName": "Test Product",
      "status": "PENDING",
      "submittedDate": "2024-01-01T10:00:00.000Z",
      "expectedResults": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Lab Sample
```http
POST /api/lab-samples
```
**Auth Required:** Yes  
**Roles:** FIELD_OFFICER, LAB_COORDINATOR

### Update Lab Sample
```http
PUT /api/lab-samples/[id]
```
**Auth Required:** Yes  
**Roles:** LAB_COORDINATOR

**Request Body:**
```json
{
  "status": "COMPLETED",
  "results": "Sample analysis results",
  "testDate": "2024-01-10T10:00:00.000Z"
}
```

## ⚖️ FIR Cases API

### List FIR Cases
```http
GET /api/fir-cases
```
**Auth Required:** Yes

### Create FIR Case
```http
POST /api/fir-cases
```
**Auth Required:** Yes  
**Roles:** LEGAL_OFFICER

**Request Body:**
```json
{
  "labReportId": "lab-report-id",
  "violationType": "COUNTERFEIT_PRODUCTS",
  "accusedParty": "Shop Owner Name",
  "location": "Offense Location",
  "initialNotes": "Case details"
}
```

## 📦 Products API

### List Products
```http
GET /api/products
```
**Auth Required:** Yes

**Response:**
```json
{
  "products": [
    {
      "id": "product-id",
      "name": "Product Name",
      "category": "FERTILIZER",
      "manufacturer": "Company Name",
      "registrationNumber": "REG-123",
      "status": "ACTIVE"
    }
  ]
}
```

### Create Product
```http
POST /api/products
```
**Auth Required:** Yes  
**Roles:** DAO, DISTRICT_ADMIN

## 📁 Files API

### Upload File
```http
POST /api/files/upload
```
**Auth Required:** Yes  
**Content-Type:** multipart/form-data

**Form Data:**
- `file` - File to upload
- `category` - File category (evidence, report, document)
- `relatedId` - Related record ID (optional)

**Response:**
```json
{
  "file": {
    "id": "file-id",
    "filename": "document.pdf",
    "originalName": "Original Document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "url": "/uploads/document.pdf"
  }
}
```

### List Files
```http
GET /api/files/upload
```
**Auth Required:** Yes

## 📊 Reports API

### Generate Report
```http
GET /api/reports
```
**Auth Required:** Yes

**Query Parameters:**
- `type` - Report type (inspections, seizures, lab-samples, fir-cases)
- `startDate` - Start date filter
- `endDate` - End date filter
- `format` - Response format (json, csv)

**Response:**
```json
{
  "report": {
    "type": "inspections",
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "total": 100,
      "completed": 85,
      "pending": 15
    },
    "data": [...]
  }
}
```

## 🚨 Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Common Error Codes
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Resource already exists

## 🔒 Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authenticated users:** 100 requests per minute
- **File uploads:** 10 requests per minute
- **Report generation:** 5 requests per minute

## 📝 Request/Response Examples

### Creating an Inspection with cURL
```bash
curl -X POST http://localhost:8005/api/inspections \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "location": "Central Market",
    "targetType": "RETAIL_STORE",
    "assignedOfficerId": "officer-123",
    "scheduledDate": "2024-01-15T09:00:00.000Z",
    "equipment": ["TruScan Device"]
  }'
```

### Uploading Evidence File
```bash
curl -X POST http://localhost:8005/api/files/upload \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -F "file=@evidence.jpg" \
  -F "category=evidence" \
  -F "relatedId=seizure-123"
```

## 🧪 Testing

Use the included test script to verify API functionality:
```bash
node test-api.js
```

This will test all endpoints and verify proper authentication and authorization.
