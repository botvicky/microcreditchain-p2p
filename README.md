# ShamwariPay

A peer-to-peer lending platform that connects Borrowers and Lenders through EcoCash/OneMoney, using a FastAPI + PostgreSQL backend and a Python AI/ML service for EcoCash statement analysis.

## 🚀 Features

- **🔐 Authentication**: FastAPI backend with JWT tokens and Google Sign-In (OAuth 2.0)
- **👥 Role-based Access**: Borrower, Lender, and Admin dashboards with secure permissions
- **🤖 AI-Powered Analysis**: Real EcoCash statement analysis for creditworthiness scoring
- **💰 Loan Management**: Create offers, apply for loans, track repayments with automated scheduling
- **🔔 Notifications**: Database-backed notification system with real-time updates
- **💸 Revenue System**: 15% commission on lender profits with automated calculation
- **👨‍💼 Admin Panel**: Comprehensive user management, analytics, and system controls
- **☁️ Cloud-Native**: FastAPI backend (PostgreSQL/SQLite) with AI service that can be deployed to Google Cloud Run or similar
- **🔒 Security**: End-to-end encryption with role-based access control and bcrypt password hashing

## 🛠 Technology Stack

### Frontend
- **React Native 0.81.4** - Cross-platform mobile framework
- **Expo ~54.0.13** - Development platform and tooling
- **TypeScript** - Type-safe JavaScript
- **Zustand** - Lightweight state management
- **Expo Secure Store** - Encrypted local storage
- **Expo Auth Session** - OAuth 2.0 authentication

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL/SQLite** - Database (SQLite for dev, PostgreSQL for production)
- **JWT (PyJWT)** - Token-based authentication
- **Passlib + bcrypt** - Password hashing and encryption
- **Uvicorn** - ASGI server

### AI/ML
- **PyPDF2** - PDF parsing for bank statements
- **pandas** - Data analysis for transaction processing
- **Custom ML Algorithm** - Credit scoring based on transaction history

### UI Design
- **React Native Paper** - Material Design components
- **Colors**: Navy Blue (#00224d) & Emerald Green (#00bf80)
- **Fonts**: Inter + Poppins

## 📱 Installation

### Prerequisites
- **Backend**: FastAPI + PostgreSQL (replaced Firebase backend)

- Node.js 18+
- Expo CLI
- Python 3.8+
- PostgreSQL server (local or managed)
- (optional) Google Cloud SDK for deploying the AI service

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd microcreditchain-p2p
   ```

2. **Install dependencies**
   ```bash
   # Install app dependencies
   cd app
   npm install
   
   # Install AI service dependencies
   cd ../ai-service
   pip install -r requirements.txt
   ```

3. **Configure Backend & Google OAuth**
   - Start or provision a PostgreSQL database and note the connection URL (e.g. postgresql://user:pass@localhost:5432/microcreditchain)
   - Create a `.env` in `ai-service` (or set environment variables) with:
     - DATABASE_URL (Postgres connection string)
     - SECRET_KEY (JWT secret)
     - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (for Google Sign-In)
   - Update frontend `app` to use Google OAuth client IDs in `SignUp` / `Login` screens (see `SignUpScreen.tsx`)

4. **Configure AI Service**
   - The AI service is in `ai-service/main.py`. Start it locally with the DATABASE_URL and SECRET_KEY set, or deploy to Cloud Run.

5. **Configure the mobile app (Expo)**
   - Copy `app/.env.example` to `app/.env` and set:
     - `EXPO_PUBLIC_BACKEND_URL` (FastAPI base URL)
     - `EXPO_PUBLIC_AI_SERVICE_URL` (AI analyzer base URL)
     - Optional: OAuth client IDs with `EXPO_PUBLIC_*`
   - These map to `API_ENDPOINTS` in `app/src/utils/constants.ts`.

6. **Start the development server**
   ```bash
   cd app
   expo start
   ```

## 🚀 Deployment

### Run AI Service Locally
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### AI Service (deploy)
You can deploy the AI service to Google Cloud Run or any container platform. Example with Cloud Run:
```bash
cd ai-service
gcloud run deploy ai-analyzer --source . --region=us-central1
```

### React Native App
```bash
cd app
expo build:android
expo build:ios
```

Tip: You can also use EAS for modern builds. Ensure your environment variables are set in EAS project settings.

## 📊 Database Schema

### Users
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'borrower' | 'lender' | 'admin';
  idNumber: string;
  signatureUrl?: string;
  rating: number;
  status: 'active' | 'frozen';
  createdAt: Date;
  updatedAt: Date;
}
```

### Loan Offers
```typescript
{
  id: string;
  lenderId: string;
  amount: number;
  interestRate: number;
  duration: string;
  conditions: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### Loan Applications
```typescript
{
  id: string;
  borrowerId: string;
  offerId: string;
  statementUrl: string;
  aiSummary?: AISummary;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🤖 AI Integration

The AI service analyzes EcoCash statements and returns:

- Average balance
- Total inflows/outflows
- Transaction frequency
- Creditworthiness score (0-100)
- Risk level (Low/Medium/High)

## 💰 Revenue Model

- Platform takes 15% commission of lender's profit
- Commission calculated automatically when loan is settled
- Lenders must pay commission before creating new offers

## 🔐 Security

- Do not commit secrets; `.gitignore` prevents common secret files
- Role-based authentication and JWTs
- Validate file uploads and enforce PDF/size limits
- Encrypted data transmission (HTTPS in production)
- Service accounts and keystores are excluded from version control

## 📱 UI/UX Design

### Color Palette
- Primary: #00224d (Navy Blue)
- Secondary: #00bf80 (Emerald Green)
- Accent: #00bf80 (Emerald Green)
- Error: #E63946
- Background: #FFFFFF
- Text: #2C2C2C

### Typography
- Headings: Poppins SemiBold
- Body: Inter Regular
- Buttons: Inter Bold

## 🧪 Testing

### Test Accounts
For development and testing, use these pre-configured accounts:

- **Admin:** `admin@shamwaripay.com` / `admin123`
- **Lender:** `lender@shamwaripay.com` / `lender123`
- **Borrower:** `borrower@shamwaripay.com` / `borrower123`

📝 See [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) for complete details and features.

**Quick Login in Dev Mode:**
Click the **🔧 Dev Login** button on the login screen to auto-fill credentials.

### Running Tests
```bash
# Test AI Service
cd ai-service
python -m pytest

# Test React Native App
cd app
npm test
```

## 📈 Analytics

Admin dashboard provides:
- Total users and active users
- Loan statistics
- Revenue tracking
- Default rates
- System performance metrics

## 🔔 Notifications

- Server-managed notifications stored in PostgreSQL. Push delivery (FCM/APNS) is optional and can be integrated separately.

## 📞 Support

For support and questions:
- Email: support@shamwaripay.com
- Server-managed notifications stored in PostgreSQL. Push delivery (FCM/APNS) can be integrated separately.
- Issues: [GitHub Issues]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🧩 Mobile app status

- Core flows implemented: email/password auth, role-based dashboards, creating offers (lender), browsing/applying for loans (borrower), notifications list and read state.
- AI integration: upload EcoCash PDF and call analyzer endpoints with sensible fallbacks.
- Config: runtime URLs via `EXPO_PUBLIC_*` env vars.

Backend alignment note: The mobile app expects REST endpoints as documented in `API_DOCUMENTATION.md` (e.g., `/loan-offers`, `/loan-applications`, `/notifications`, `/admin/*`). Ensure your FastAPI service implements these paths or add a gateway that maps existing paths.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🗺 Roadmap

- [ ] Mobile app store deployment
- [ ] Advanced AI features
- [ ] Multi-currency support
- [ ] Advanced analytics
- [ ] API documentation
- [ ] Mobile app testing
