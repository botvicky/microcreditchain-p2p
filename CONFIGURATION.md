# MicroCreditChain P2P - Configuration Guide

This project was migrated from Firebase to a FastAPI + PostgreSQL backend. The following steps explain how to configure the new stack for local development and deployment.

## 🔧 Backend Configuration (FastAPI + PostgreSQL)

### 1. Database

1. Provision a PostgreSQL instance (local or managed). Example local URL:
   ```text
   postgresql://postgres:password@localhost:5432/microcreditchain
   ```

2. Create the database and user if necessary.

### 2. Environment Variables

Create a `.env` file in the `ai-service` folder or export these variables in your environment:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/microcreditchain
SECRET_KEY=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. AI Service

The AI analyzer and backend API live in `ai-service/main.py`. To run locally:

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will create database tables automatically using SQLAlchemy's `Base.metadata.create_all` on startup. For production use, add Alembic for migrations.

### 4. Google OAuth (Google Sign-In)

1. Create OAuth 2.0 credentials in Google Cloud Console and obtain a `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
2. Configure these values in the `ai-service` environment variables.
3. Configure the Expo app to use the same client IDs in `SignUpScreen.tsx` (expo-auth-session). Also register redirect URIs in Google Cloud Console for your Expo development URLs.

### 5. Uploads and Storage

Uploaded statements are stored in `ai-service/uploads` by default (development). For production, integrate S3/GCS and update the upload endpoint to return stable URLs.

### 6. Notifications

Notifications are stored in the PostgreSQL `notifications` table. The backend exposes endpoints to create, list, mark-as-read, and query unread counts. Push delivery (FCM/APNS) can be integrated separately.

### 7. Testing

Run unit tests for the AI service:

```bash
cd ai-service
python -m pytest
```

Frontend tests (if any) can be run in the `app` folder:

```bash
cd app
npm test
```

### 8. Deployment

You can deploy the FastAPI/AI service to any container platform. For Cloud Run, build a container and deploy. Make sure the `DATABASE_URL` environment variable points to a production database.

### 9. Security Considerations

- Do not commit secrets to version control. Use environment variables or secret managers.
- Validate and sanitize uploaded files.
- Ensure JWT secrets are sufficiently strong and rotated periodically.

## Support

Contact: support@microcreditchain.com
