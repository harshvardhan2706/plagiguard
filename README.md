# PlagiGuard

PlagiGuard is a plagiarism detection platform with an AI-powered backend, secure admin panel, and user-friendly frontend. It supports document uploads, AI-based content analysis, and robust admin/user management.

## Project Architecture

```
plagiguard/
├── PlagiGuard-Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/plagiguard/
│   │   │   │   ├── controller/      # REST controllers (Admin, User, Auth, etc.)
│   │   │   │   ├── entity/          # JPA entities (Admin, User, Upload, etc.)
│   │   │   │   ├── repository/      # Spring Data JPA repositories
│   │   │   │   ├── service/         # Business logic and services
│   │   │   │   ├── config/          # Security and app configuration
│   │   │   │   ├── security/        # JWT and security filters
│   │   ├── resources/
│   │   │   └── application.properties
│   ├── Dockerfile                   # Backend Dockerfile
│   └── pom.xml                      # Maven build file
├── py/
│   └── ai_detector/                 # Python AI microservice (Flask, HuggingFace)
│       ├── app.py                   # Flask app for AI detection
│       └── ...                      # Model files, requirements.txt, etc.
├── plagiguard-frontend/
│   ├── src/
│   │   ├── components/              # React components (admin, user, shared)
│   │   ├── App.js                   # Main React app
│   ├── public/
│   ├── Dockerfile                   # Frontend Dockerfile
│   └── package.json                 # Frontend dependencies
├── docker-compose.yml               # Multi-service orchestration
├── README.md                        # Project documentation
└── ...
```

## Features

- User and admin authentication (JWT-secured)
- Document upload and management (files stored in database, not filesystem)
- AI-powered plagiarism detection (DistilBERT via Python microservice)
- Admin dashboard, analytics, and user management
- Role-based access control
- Dockerized deployment (backend, frontend, AI service)
- MySQL/Amazon RDS support
- Automatic cleanup: uploaded files older than 7 days are deleted

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 21
- Node.js & npm
- Python 3.9+

### Quick Start
1. Clone the repository:
   ```sh
   git clone https://github.com/harshvardhan2706/plagiguard.git
   cd plagiguard
   ```
2. Build and run with Docker Compose:
   ```sh
   docker-compose up --build
   ```
3. Access the app:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8085

### Manual Setup
- See `PlagiGuard-Backend/README.md`, `py/ai_detector/README.md`, and `plagiguard-frontend/README.md` for detailed backend, AI, and frontend instructions.

## Environment Variables
- Configure database and secret keys in `application.properties` and `.env` files as needed.

## License
MIT

---
For more details, see the documentation in the `docs/` folders of each service.
