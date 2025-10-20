# MicroCreditChain P2P

A peer-to-peer lending platform that connects Borrowers and Lenders through EcoCash/OneMoney, integrated with Firebase for backend and AI/ML API for EcoCash statement analysis.

## 🚀 Features

- **🔐 Authentication**: Firebase Auth with email/password and phone verification
- **👥 Role-based Access**: Borrower, Lender, and Admin dashboards with secure permissions
- **🤖 AI-Powered Analysis**: Real EcoCash statement analysis for creditworthiness scoring
- **💰 Loan Management**: Create offers, apply for loans, track repayments with automated scheduling
- **🔔 Notifications**: Push notifications and email alerts with Firebase Cloud Messaging
- **💸 Revenue System**: 15% commission on lender profits with automated calculation
- **👨‍💼 Admin Panel**: Comprehensive user management, analytics, and system controls
- **📱 Mobile-First**: React Native with Expo for iOS and Android
- **☁️ Cloud-Native**: Firebase backend with Google Cloud Run AI service
- **🔒 Security**: End-to-end encryption with role-based access control

## 🛠 Technology Stack

- **Frontend**: React Native (Expo, TypeScript)
- **Backend**: Firebase (Firestore, Auth, Storage, Functions, Cloud Messaging)
- **AI Engine**: Python FastAPI (deployed on Google Cloud Run)
- **Notifications**: Firebase Cloud Messaging + Gmail API
- **UI Design**: Inter + Poppins fonts, Blue & Gold fintech color palette

## 📱 Installation

### Prerequisites

- Node.js 18+
- Expo CLI
- Firebase CLI
- Google Cloud SDK
- Python 3.8+

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
   
   # Install Firebase Functions dependencies
   cd ../firebase-functions
   npm install
   
   # Install AI service dependencies
   cd ../ai-service
   pip install -r requirements.txt
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication, Firestore, Storage, Functions, and Cloud Messaging
   - Update `app/src/config/firebase.ts` with your Firebase config
   - Update `firebase-functions/.env` with your Firebase credentials

4. **Configure AI Service**
   - Update `firebase-functions/src/ai-integration.ts` with your AI service URL
   - Deploy the AI service to Google Cloud Run

5. **Start the development server**
   ```bash
   cd app
   expo start
   ```

## 🚀 Deployment

### Firebase Functions
```bash
cd firebase-functions
firebase deploy --only functions
```

### AI Service
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

- Firebase Security Rules for data access control
- Role-based authentication
- Secure file uploads to Firebase Storage
- Encrypted data transmission

## 📱 UI/UX Design

### Color Palette
- Primary: #0052CC (Blue)
- Secondary: #FFD700 (Gold)
- Accent: #00B894 (Emerald Green)
- Error: #E63946
- Background: #FFFFFF
- Text: #2C2C2C

### Typography
- Headings: Poppins SemiBold
- Body: Inter Regular
- Buttons: Inter Bold

## 🧪 Testing

```bash
# Test Firebase Functions
cd firebase-functions
npm test

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

- Push notifications via Firebase Cloud Messaging
- Email notifications via Gmail API
- Real-time updates for loan status changes
- System-wide announcements

## 📞 Support

For support and questions:
- Email: support@microcreditchain.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

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
