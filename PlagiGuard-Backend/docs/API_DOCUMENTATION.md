# PlagiGuard API Documentation

## Overview
This document provides detailed information about the PlagiGuard REST API endpoints, including request/response formats and error codes.

## Base URL
```
http://localhost:8085/api
```

## Authentication
All API endpoints except `/auth/login` and `/auth/register` require JWT authentication.
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Login
```http
POST /auth/login
```

Request Body:
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

Success Response (200):
```json
{
    "token": "jwt_token_here",
    "user": {
        "id": "123",
        "email": "user@example.com",
        "fullName": "John Doe"
    }
}
```

#### Register
```http
POST /auth/register
```

Request Body:
```json
{
    "fullName": "John Doe",
    "email": "user@example.com",
    "password": "password123"
}
```

Success Response (201):
```json
{
    "message": "User registered successfully",
    "userId": "123"
}
```

### Document Analysis

#### Upload Document
```http
POST /documents/upload
Content-Type: multipart/form-data
```

Request Body:
- file: File (PDF, DOCX, or TXT)

Success Response (200):
```json
{
    "documentId": "doc123",
    "fileName": "document.pdf",
    "uploadTime": "2025-05-14T10:30:00Z"
}
```

#### Analyze Document
```http
POST /documents/{documentId}/analyze
```

Success Response (200):
```json
{
    "analysisId": "analysis123",
    "aiScore": 0.85,
    "content": "Document content...",
    "aiParts": [1, 4, 7],
    "timestamp": "2025-05-14T10:35:00Z"
}
```

### User History

#### Get Analysis History
```http
GET /users/{userId}/history
```

Success Response (200):
```json
{
    "history": [
        {
            "analysisId": "analysis123",
            "documentName": "document.pdf",
            "aiScore": 0.85,
            "analysisDate": "2025-05-14T10:35:00Z"
        }
    ]
}
```

## Error Codes

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### Error Response Format
```json
{
    "error": "Error message here",
    "code": "ERROR_CODE",
    "timestamp": "2025-05-14T10:35:00Z"
}
```

### Common Error Codes
- AUTH001: Invalid credentials
- AUTH002: User not found
- AUTH003: Token expired
- DOC001: Invalid file type
- DOC002: File too large
- DOC003: Analysis failed
- USR001: User not found
- SYS001: Internal server error

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per day per user

## Support
For API support, contact:
- Email: api-support@plagiguard.com
- Documentation: https://plagiguard.com/api-docs
