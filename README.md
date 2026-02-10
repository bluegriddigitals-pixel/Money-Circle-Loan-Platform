Here's a clean, simplified version of your MoneyCircle documentation:

# MoneyCircle - P2P Lending Platform

A secure platform connecting borrowers and lenders in South Africa with full regulatory compliance.

![Status](https://img.shields.io/badge/status-Development-orange.svg)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile-green.svg)

## 📋 Quick Start

### With Docker (Easiest):
```bash
git clone <repository-url>
cd MoneyCircle
cd backend
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

### Manual Setup:
```bash
# Backend
cd backend
npm install
npm run migration:run
npm run start:dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## 🎯 What MoneyCircle Does

**For Borrowers:**
- Apply for loans easily
- Track application status in real-time
- Build credit scores
- Flexible repayments

**For Lenders/Investors:**
- Browse loan listings
- Auto-invest with custom rules
- Track ROI in real-time
- Portfolio management tools

## 🏗️ Tech Stack

**Backend:**
- NestJS (TypeScript)
- PostgreSQL database
- Redis for caching
- JWT authentication

**Frontend:**
- Next.js 14 (TypeScript)
- React 18 + Tailwind CSS
- shadcn/ui components

**Infrastructure:**
- Docker & AWS
- GitHub Actions for CI/CD
- Multiple security layers

## 📁 Project Structure
```
MoneyCircle/
├── backend/          # API server (NestJS)
├── frontend/         # Web app (Next.js)
├── infrastructure/   # Deployment configs
└── documentation/    # All project docs
```

## 👥 User Roles
1. **Borrower** - Apply for loans, make repayments
2. **Lender** - Invest in loans, manage portfolio
3. **Auditor** - Verify KYC, approve loans
4. **Transaction Admin** - Handle payments
5. **System Admin** - Full platform access

## 🔒 Compliance & Security
- Fully compliant with South African regulations (FICA, NCA, POPIA)
- Bank-level encryption (AES-256)
- Complete audit trails
- Regular security audits

## 📚 API Access
After starting backend:
- API Base: `http://localhost:3000/api`
- Docs: `http://localhost:3000/api/docs`
- Authentication: JWT Bearer token required

**Example API calls:**
```bash
# Login
POST /auth/login

# Apply for loan
POST /loans/apply

# Browse loans
GET /marketplace/loans
```

## 🚀 Deployment

**Production checklist:**
- Set production environment variables
- Configure SSL certificates
- Enable automated backups
- Set up monitoring (Sentry, LogRocket)

**Deploy with Docker:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Submit a pull request
5. Get 2+ code reviews

## ⚠️ License
- Proprietary software
- All rights reserved
- Contact for commercial use

## 📞 Support
- **Documentation:** Check `/documentation/` folder
- **Issues:** GitHub Issues page
- **Security:** security@moneycircle.co.za
- **Business:** contact@moneycircle.co.za

---

**MoneyCircle © 2024** | Peer-to-Peer Lending Platform for South Africa