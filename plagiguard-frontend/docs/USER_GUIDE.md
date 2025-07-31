# PlagiGuard User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [Using PlagiGuard](#using-plagiguard)
5. [Troubleshooting](#troubleshooting)
6. [FAQs](#faqs)

## Introduction
PlagiGuard is an AI-powered plagiarism detection system that helps identify both AI-generated content and traditional plagiarism. This guide will help you get started with PlagiGuard and make the most of its features.

## System Requirements

### Backend Requirements
- Java 17 or higher
- MySQL 8.0 or higher
- Python 3.8 or higher
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

### Frontend Requirements
- Node.js 16.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 2GB RAM minimum

## Installation Guide

### Backend Setup
1. Clone the repository
2. Install Java 17 and MySQL 8.0
3. Create a MySQL database named 'plagiguard'
4. Configure database credentials in `application.properties`
5. Run `mvn clean install` to build the project
6. Start the backend server with `mvn spring-boot:run`

### Frontend Setup
1. Navigate to the frontend directory
2. Run `npm install` to install dependencies
3. Configure the backend API URL in `.env` file
4. Start the development server with `npm start`

## Using PlagiGuard

### Getting Started
1. Register for an account or login
2. Navigate to the dashboard
3. Upload your document for analysis

### Document Analysis
1. Select a file to analyze (supported formats: PDF, DOCX, TXT)
2. Click "Analyze" to start the process
3. View the detailed analysis report:
   - AI Content Detection Score
   - Text Highlighting (Red: AI-generated, Blue: Human-written)
   - Similarity Analysis
   - Download Report options

### Viewing History
1. Access your analysis history from the History tab
2. Filter results by date or document type
3. Download previous reports

## Troubleshooting

### Common Issues and Solutions

1. Upload Errors
   - Check file size (max 20MB)
   - Ensure file format is supported
   - Verify internet connection

2. Analysis Delays
   - Large documents may take longer to process
   - Check server status in system dashboard
   - Retry analysis if timeout occurs

3. Login Issues
   - Clear browser cache
   - Reset password if needed
   - Contact support for account issues

## FAQs

Q: What file formats are supported?
A: PDF, DOCX, and TXT files are currently supported.

Q: How accurate is the AI detection?
A: The system typically achieves 85-95% accuracy, depending on content type.

Q: Can I analyze multiple files at once?
A: Currently, files must be analyzed individually for optimal accuracy.

Q: How long are reports stored?
A: Reports are stored for 90 days by default.
