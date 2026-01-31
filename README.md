# Jybek Accounts - Next.js Edition

A modern, production-ready accounting system built with Next.js 14, TypeScript, and MongoDB. Features a beautiful card-based UI with comprehensive accounting functionality.

## Features

### Core Accounting

- **Double-Entry Accounting** - Professional bookkeeping with automatic balance validation
- **Chart of Accounts** - Complete account management (Assets, Liabilities, Equity, Income, Expenses)
- **Transaction Management** - Journal entries, income/expense recording, transaction reversals
- **Business Multi-Tenancy** - Secure data isolation per business

### Financial Operations

- **Invoicing System** - Create, manage, and track invoices with automatic ledger posting
- **Quotation Management** - Generate quotes and convert to invoices
- **Customer & Vendor Management** - Complete relationship tracking
- **Bank Reconciliation** - Match transactions with bank statements

### Automation & Reporting

- **Recurring Transactions** - Automated transaction scheduling
- **Financial Reports** - P&L, Balance Sheet, Cash Flow, General Ledger
- **Analytics Dashboard** - Real-time business insights
- **Excel Export** - Export reports and data

### API & Integration

- **RESTful API** - Complete API for CRM and third-party integrations
- **Dual Authentication** - JWT tokens and API key support
- **Webhook Support** - Real-time notifications
- **Documentation** - Comprehensive API docs

### Modern UI/UX

- **Card-Based Design** - Modern, intuitive interface
- **Responsive Layout** - Works perfectly on all devices
- **Dark Mode Support** - Eye-friendly interface option
- **Real-time Updates** - Live data synchronization

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone and install dependencies**

```bash
cd jybek-accounts-nextjs
npm install
```

2. **Set up environment variables**

```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

3. **Start MongoDB**

```bash
# Using Docker (recommended)
docker run --name jybek-mongodb -p 27017:27017 -d mongo:5.0

# Or local MongoDB instance
mongod
```

4. **Run the application**

```bash
npm run dev
```

5. **Access the application**

- Frontend: http://localhost:3000
- API: http://localhost:3000/api

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jybek_accounts

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

## API Documentation

### Authentication

#### User Registration

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword",
  "name": "John Doe",
  "businessName": "My Business",
  "fiscalYearStart": "2024-01-01",
  "openingBalance": 10000
}
```

#### Create Income Transaction

```bash
POST /api/transactions/income
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "incomeAccountId": "account_id",
  "cashAccountId": "cash_account_id",
  "amount": 1000.00,
  "transactionDate": "2024-01-15",
  "description": "Service revenue",
  "reference": "INV-001"
}
```

#### Create Expense Transaction

```bash
POST /api/transactions/expense
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "expenseAccountId": "expense_account_id",
  "cashAccountId": "cash_account_id",
  "amount": 500.00,
  "transactionDate": "2024-01-15",
  "description": "Office rent",
  "reference": "RENT-001"
}
```

### API Key Authentication

For CRM integrations, generate an API key and use:

```bash
POST /api/transactions/income
X-API-Key: {your_api_key}
Content-Type: application/json
```

## Architecture

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard
│   ├── transactions/      # Transaction management
│   ├── invoices/          # Invoice management
│   └── reports/           # Financial reports
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and services
│   ├── auth/             # Authentication logic
│   ├── db/               # Database connection
│   ├── models/           # Data models
│   └── services/         # Business logic
└── types/                 # TypeScript type definitions
```

### Key Services

- **LedgerService**: Core double-entry accounting engine
- **ReportingService**: Financial report generation
- **AuthService**: Authentication and authorization
- **BusinessService**: Business management
- **AccountService**: Chart of accounts management

## Features Implemented

### ✅ Core Features

- [x] Double-entry accounting system
- [x] User authentication with JWT
- [x] Business multi-tenancy
- [x] Chart of accounts with default setup
- [x] Transaction management (income, expense, journal)
- [x] Modern card-based UI
- [x] Responsive dashboard

### ✅ Advanced Features

- [x] Invoice creation and management
- [x] Customer and vendor management
- [x] API key authentication for integrations
- [x] Financial reporting (P&L, Balance Sheet)
- [x] Bank reconciliation framework
- [x] Recurring transactions setup

### 🚧 In Progress

- [ ] Real-time dashboard updates
- [ ] Advanced reporting with charts
- [ ] File upload for attachments
- [ ] Email notifications
- [ ] Mobile app

### 📋 Planned

- [ ] Multi-currency support
- [ ] Advanced inventory management
- [ ] Payroll processing
- [ ] Tax compliance features
- [ ] Advanced analytics

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **API Keys**: Secure integration authentication
- **Business Data Isolation**: Multi-tenant security
- **Input Validation**: Zod schemas for all inputs
- **CSRF Protection**: Built-in Next.js protection
- **Rate Limiting**: API endpoint protection

## Production Deployment

### Docker Deployment

```bash
# Build and run with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup

1. Set strong JWT secrets
2. Configure production MongoDB
3. Set up SSL certificates
4. Configure backup strategies
5. Set up monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
