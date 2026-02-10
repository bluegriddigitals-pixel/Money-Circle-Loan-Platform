MoneyCircle - Peer-to-Peer Lending Platform
A secure, compliant P2P lending platform connecting borrowers and lenders in South Africa

https://img.shields.io/badge/license-Proprietary-blue.svg
https://img.shields.io/badge/platform-Web%2520%257C%2520Mobile-green.svg
https://img.shields.io/badge/status-Development-orange.svg

📋 Table of Contents
Overview

Features

Tech Stack

Architecture

Getting Started

Development Setup

Deployment

Project Structure

User Roles

Compliance

API Documentation

Contributing

License

🌟 Overview
MoneyCircle is a sophisticated peer-to-peer lending platform designed specifically for the South African market. The platform facilitates secure transactions between borrowers seeking loans and investors looking for competitive returns, with robust compliance, risk management, and administrative oversight.

Key Highlights
Fully Compliant: Built for South African regulatory requirements (FICA, NCA, POPIA)

Multi-Role System: Five distinct user roles with granular permissions

End-to-End Security: Bank-level encryption and fraud detection

Scalable Architecture: Microservices-ready with cloud-native design

Real-time Processing: Live loan applications, funding, and repayments

🚀 Features
For Borrowers
✅ Easy loan application with dynamic forms

✅ Real-time application status tracking

✅ Flexible repayment schedules

✅ Credit score building

✅ Secure document upload and KYC

For Lenders/Investors
✅ Browse curated loan listings

✅ Portfolio diversification tools

✅ Auto-invest rules and preferences

✅ Real-time ROI tracking

✅ Secure withdrawal system

For Administrators
✅ Multi-level approval workflows

✅ Comprehensive audit trails

✅ Risk scoring and fraud detection

✅ Real-time compliance monitoring

✅ Advanced analytics dashboard

Platform Features
Escrow Management: Secure fund handling with third-party escrow

Payment Processing: Multiple payment methods (card, EFT, bank transfer)

Risk Assessment: AI-powered credit scoring and fraud detection

Document Management: Secure storage with version control

Notifications: Real-time email, SMS, and in-app alerts

🛠 Tech Stack
Backend
Framework: NestJS with TypeScript

Database: PostgreSQL with TypeORM

Cache/Queue: Redis with BullMQ

Authentication: JWT with Passport.js

Validation: Class Validator + Class Transformer

Frontend
Framework: Next.js 14 with TypeScript

UI Library: React 18 with Tailwind CSS

Component Library: shadcn/ui + Radix UI

State Management: Zustand

Form Handling: React Hook Form + Zod

Charts: Recharts

Infrastructure
Containerization: Docker + Docker Compose

Cloud Provider: AWS (EC2, RDS, S3, CloudFront)

CI/CD: GitHub Actions

Monitoring: Sentry + LogRocket

API Documentation: Swagger/OpenAPI

Third-Party Services
KYC Verification: Sumsub/Jumio

Payment Processing: Paystack/Stripe

SMS Notifications: Twilio

Email Service: Resend

File Storage: Cloudinary/S3

🏗 Architecture
text
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│                    https://moneycircle.co.za                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/API Calls
┌──────────────────────────▼──────────────────────────────────┐
│                   Backend API (NestJS)                      │
│                      Load Balancer                          │
├─────────────────────────────────────────────────────────────┤
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │ User MS  │  │ Loan MS  │  │ Payment  │  │ Risk MS  │   │
│   │          │  │          │  │   MS     │  │          │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Data & Cache Layer                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │PostgreSQL│  │  Redis   │  │   S3     │  │   CDN    │   │
│   │ (Primary)│  │ (Cache)  │  │(Storage) │  │ (Assets) │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
🚦 Getting Started
Prerequisites
Node.js 18.x or higher

PostgreSQL 15.x

Redis 7.x

Docker & Docker Compose (optional)

npm or yarn

Quick Start with Docker (Recommended)
Clone and navigate to project

bash
git clone <repository-url>
cd MoneyCircle
Set up environment variables

bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
Start with Docker Compose

bash
cd backend
docker-compose up --build
Access the applications

Frontend: http://localhost:3001

Backend API: http://localhost:3000

PostgreSQL: localhost:5432

Redis: localhost:6379

Manual Setup
Backend Setup
bash
cd backend
npm install

# Set up database
npm run migration:run

# Start development server
npm run start:dev
Frontend Setup
bash
cd frontend
npm install

# Start development server
npm run dev
🏭 Development Setup
Environment Variables
Backend (.env)
env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=moneycircle

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=24h

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
Frontend (.env.local)
env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MoneyCircle
Available Scripts
Backend
bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run start:prod   # Start production server
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Run ESLint
npm run migration:generate  # Generate new migration
npm run migration:run       # Run migrations
Frontend
bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
Database Migrations
bash
# Generate new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
📁 Project Structure
text
MoneyCircle/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── user/          # User management
│   │   │   ├── auth/          # Authentication
│   │   │   ├── loan/          # Loan management
│   │   │   ├── marketplace/   # Loan marketplace
│   │   │   ├── payment/       # Payment processing
│   │   │   ├── risk/          # Risk assessment
│   │   │   ├── audit/         # Audit logs
│   │   │   ├── compliance/    # Compliance checks
│   │   │   ├── notification/  # Notifications
│   │   │   └── admin/         # Admin functions
│   │   ├── shared/            # Shared utilities
│   │   └── config/            # Configuration files
│   └── migrations/            # Database migrations
│
├── frontend/                  # Next.js Frontend
│   ├── app/                   # App router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── borrower/          # Borrower dashboard
│   │   ├── lender/            # Lender dashboard
│   │   ├── auditor/           # Auditor dashboard
│   │   └── admin/             # Admin dashboard
│   ├── components/            # React components
│   ├── lib/                   # Utilities and hooks
│   └── public/                # Static assets
│
├── infrastructure/            # Deployment configurations
│   ├── aws/                   # AWS cloud formation
│   ├── docker/                # Docker configurations
│   └── monitoring/            # Monitoring setup
│
├── documentation/             # Project documentation
│   ├── api/                   # API documentation
│   ├── legal/                 # Legal documents
│   ├── compliance/            # Compliance documents
│   └── operational/           # Operational guides
│
└── scripts/                   # Utility scripts
👥 User Roles
1. Borrower
Permissions: Apply for loans, make repayments, view loan history

Responsibilities: Complete KYC, provide accurate information, repay on time

Access: Personal dashboard, loan applications, payment schedule

2. Lender
Permissions: Browse loans, invest funds, withdraw earnings

Responsibilities: Perform due diligence, diversify investments

Access: Marketplace, portfolio, investment analytics

3. Auditor
Permissions: Verify KYC, approve/reject loans, monitor compliance

Responsibilities: Risk assessment, fraud detection, regulatory compliance

Access: Audit dashboard, document verification, compliance reports

4. Transaction Administrator
Permissions: Process payments, manage escrow, handle withdrawals

Responsibilities: Fund movement, transaction reconciliation, payment issues

Access: Transaction dashboard, escrow management, financial reports

5. System Administrator
Permissions: Full system access, user management, platform configuration

Responsibilities: System health, user support, platform maintenance

Access: Admin dashboard, system settings, analytics

📊 Compliance
South African Regulations
FICA: Financial Intelligence Centre Act compliance

NCA: National Credit Act compliance

POPIA: Protection of Personal Information Act

FSCA: Financial Sector Conduct Authority requirements

Security Measures
Data Encryption: AES-256 at rest, TLS 1.3 in transit

Access Control: RBAC with MFA and session management

Audit Trails: Complete logging of all system activities

Regular Audits: Internal and external security audits

Risk Management
Credit scoring algorithms

Fraud detection systems

Provision fund for lender protection

Portfolio diversification requirements

📚 API Documentation
Base URL
text
http://localhost:3000/api
Authentication
All endpoints (except login/register) require JWT authentication.

http
Authorization: Bearer {token}
Key Endpoints
Authentication
POST /auth/register - User registration

POST /auth/login - User login

POST /auth/refresh - Refresh token

POST /auth/logout - User logout

Users
GET /users/profile - Get user profile

PUT /users/profile - Update user profile

POST /users/kyc - Submit KYC documents

GET /users/dashboard - Get user dashboard

Loans
POST /loans/apply - Apply for a loan

GET /loans - Get user loans

GET /loans/{id} - Get loan details

POST /loans/{id}/repay - Make repayment

Marketplace
GET /marketplace/loans - Browse available loans

POST /marketplace/loans/{id}/invest - Invest in a loan

GET /marketplace/portfolio - Get investment portfolio

Payments
POST /payments/deposit - Deposit funds

POST /payments/withdraw - Withdraw funds

GET /payments/transactions - Get transaction history

API Documentation Access
bash
# After starting the backend
# Swagger UI: http://localhost:3000/api/docs
# OpenAPI JSON: http://localhost:3000/api/docs-json
🚢 Deployment
Production Deployment Checklist
Environment Setup

Set production environment variables

Configure SSL certificates

Set up monitoring and alerts

Configure backup strategy

Database Setup

Production PostgreSQL instance

Read replicas for scaling

Automated backups enabled

Connection pooling configured

Infrastructure

Load balancer configured

CDN for static assets

Auto-scaling groups

Disaster recovery plan

Deployment Methods
Docker (Recommended)
bash
# Build and push Docker images
docker build -t moneycircle-backend:latest ./backend
docker build -t moneycircle-frontend:latest ./frontend

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
Manual Deployment
bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start services
npm run start:prod
AWS Deployment
bash
# Use infrastructure templates
cd infrastructure/aws
./deploy.sh
🤝 Contributing
Development Workflow
Fork the repository

Create a feature branch

bash
git checkout -b feature/amazing-feature
Commit your changes

bash
git commit -m 'Add amazing feature'
Push to the branch

bash
git push origin feature/amazing-feature
Open a Pull Request

Code Standards
TypeScript: Strict mode enabled

ESLint: Airbnb style guide with custom rules

Prettier: Code formatting

Commit Messages: Conventional commits

Testing: 80%+ test coverage required

Pull Request Process
Update documentation if needed

Add tests for new functionality

Ensure all tests pass

Update CHANGELOG.md

Get code review from 2+ developers

📄 License
This project is proprietary software. All rights reserved.

Usage Restrictions
Not for commercial use without permission

No redistribution allowed

No modification of license headers

Confidentiality agreement required for contributors

Third-Party Licenses
See LICENSE-THIRD-PARTY.md for details on third-party licenses.

📞 Support
Documentation
User Guide

API Reference

Deployment Guide

Troubleshooting

Contact
Technical Issues: GitHub Issues

Security Issues: security@moneycircle.co.za

Business Inquiries: contact@moneycircle.co.za

Status
Service Status

Uptime History

Incident Reports

🎯 Quick Links
🔗 Live Demo (If available)

📚 API Docs

🐛 Issue Tracker

📦 Releases

🔄 Changelog


MoneyCircle © 2024. Peer-to-Peer Lending Platform for South Africa.