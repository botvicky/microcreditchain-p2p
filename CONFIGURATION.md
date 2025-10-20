# MicroCreditChain P2P - Configuration Guide

## 🔧 Firebase Configuration

### 1. Firebase Project Setup

1. **Create Firebase Project**
   ```bash
   firebase login
   firebase init
   ```

2. **Enable Services**
   - Authentication (Email/Password, Phone)
   - Firestore Database
   - Cloud Storage
   - Cloud Functions
   - Cloud Messaging

3. **Update Firebase Config**
   ```typescript
   // app/src/config/firebase.ts
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

### 2. Environment Variables

Create `.env` files in the following locations:

**firebase-functions/.env**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
AI_SERVICE_URL=https://ml.microcreditchain.ai
VAPID_KEY=your-vapid-key
```

### 3. Gmail API Setup

1. **Enable Gmail API**
   - Go to Google Cloud Console
   - Enable Gmail API
   - Create OAuth 2.0 credentials

2. **Generate App Password**
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate app-specific password

### 4. AI Service Configuration

1. **Deploy AI Service**
   ```bash
   cd ai-service
   gcloud run deploy ai-analyzer --source . --region=us-central1
   ```

2. **Update AI Service URL**
   - Update `AI_SERVICE_URL` in Firebase Functions
   - Update `AI_SERVICE_URL` in React Native app

### 5. Push Notifications Setup

1. **Generate VAPID Keys**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Configure FCM**
   - Add FCM server key to Firebase Functions
   - Configure VAPID keys in React Native app

### 6. Database Security Rules

The following security rules are already configured:

- **Users**: Can read/write their own data, admins can read all
- **Loan Offers**: Readable by all, writable by lenders and admins
- **Loan Applications**: Accessible by borrower, lender, and admins
- **Notifications**: Users can only access their own notifications
- **Storage**: Statements accessible by authenticated users

### 7. Deployment Configuration

1. **Firebase Functions**
   ```bash
   cd firebase-functions
   npm run build
   firebase deploy --only functions
   ```

2. **Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Storage Rules**
   ```bash
   firebase deploy --only storage
   ```

4. **React Native App**
   ```bash
   cd app
   expo build:android
   expo build:ios
   ```

### 8. Testing Configuration

1. **Run Tests**
   ```bash
   chmod +x test.sh
   ./test.sh
   ```

2. **Firebase Emulators**
   ```bash
   firebase emulators:start
   ```

### 9. Production Checklist

- [ ] Firebase project configured
- [ ] Environment variables set
- [ ] Gmail API configured
- [ ] AI service deployed
- [ ] Push notifications configured
- [ ] Security rules deployed
- [ ] Functions deployed
- [ ] App built and tested
- [ ] Monitoring configured

### 10. Monitoring and Analytics

1. **Firebase Analytics**
   - Enable in Firebase Console
   - Configure custom events

2. **Error Tracking**
   - Firebase Crashlytics
   - Sentry integration

3. **Performance Monitoring**
   - Firebase Performance
   - Custom metrics

## 🚨 Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Database Rules**: Regularly review and update security rules
3. **User Data**: Implement proper data encryption
4. **Authentication**: Use strong password policies
5. **File Uploads**: Validate and sanitize uploaded files

## 📞 Support

For configuration issues:
- Check Firebase Console for errors
- Review Cloud Functions logs
- Test with Firebase Emulators
- Contact support: support@microcreditchain.com
