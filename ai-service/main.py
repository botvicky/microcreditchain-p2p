
# --- NEW BACKEND SETUP ---
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Enum, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel
from typing import Optional, List
import enum
import os
from dotenv import load_dotenv
import requests
from datetime import datetime
import jwt
from passlib.context import CryptContext

# JWT / security
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/microcreditchain")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class RoleEnum(str, enum.Enum):
    borrower = "borrower"
    lender = "lender"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    id_number = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    rating = Column(Integer, default=0)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    loans = relationship("Loan", back_populates="user")

class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    duration = Column(String, nullable=False)
    conditions = Column(String, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="loans")

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    role: RoleEnum
    id_number: Optional[str] = None
    password: Optional[str] = None

class LoanCreate(BaseModel):
    user_id: int
    amount: float
    interest_rate: float
    duration: str
    conditions: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    role: RoleEnum
    id_number: Optional[str]
    rating: int
    status: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class LoanOut(BaseModel):
    id: int
    user_id: int
    amount: float
    interest_rate: float
    duration: str
    conditions: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

app = FastAPI(title="MicroCreditChain Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Google OAuth2 ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "your-google-client-secret")

@app.post("/auth/google")
async def google_auth(request: Request, db: sessionmaker = Depends(get_db)):
    data = await request.json()
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Missing Google token")
    # Verify token with Google
    resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    info = resp.json()
    email = info.get("email")
    name = info.get("name", "")
    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(name=name, email=email, phone="", role=RoleEnum.borrower)
        db.add(user)
        db.commit()
        db.refresh(user)
    # issue JWT
    token = jwt.encode({"sub": str(user.id), "email": user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": UserOut.from_orm(user)}


def create_access_token(data: dict):
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@app.post("/auth/signup")
def auth_signup(user: UserCreate, db: sessionmaker = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    pwd_hash = None
    if user.password:
        pwd_hash = pwd_context.hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        id_number=user.id_number,
        password_hash=pwd_hash,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_access_token({"sub": str(db_user.id), "email": db_user.email})
    return {"access_token": token, "token_type": "bearer", "user": UserOut.from_orm(db_user)}


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/auth/login")
def auth_login(credentials: LoginRequest, db: sessionmaker = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd_context.verify(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": UserOut.from_orm(user)}

# --- User Endpoints ---
@app.post("/users", response_model=UserOut)
def create_user(user: UserCreate, db: sessionmaker = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: sessionmaker = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users", response_model=List[UserOut])
def list_users(db: sessionmaker = Depends(get_db)):
    return db.query(User).all()

# --- Loan Endpoints ---
@app.post("/loans", response_model=LoanOut)
def create_loan(loan: LoanCreate, db: sessionmaker = Depends(get_db)):
    db_loan = Loan(**loan.dict())
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    return db_loan

@app.get("/loans/{loan_id}", response_model=LoanOut)
def get_loan(loan_id: int, db: sessionmaker = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan

@app.get("/loans", response_model=List[LoanOut])
def list_loans(db: sessionmaker = Depends(get_db)):
    return db.query(Loan).all()


# --- Uploads and Notifications ---
from fastapi.responses import FileResponse
from fastapi import UploadFile
import shutil
import uuid
import pathlib


class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    read = Column(String, default='false')
    created_at = Column(DateTime, default=datetime.utcnow)


@app.post('/uploads')
async def upload_file(file: UploadFile = File(...), db: sessionmaker = Depends(get_db)):
    # ensure uploads dir
    uploads_dir = pathlib.Path(__file__).parent / 'uploads'
    uploads_dir.mkdir(parents=True, exist_ok=True)
    # create unique filename
    ext = pathlib.Path(file.filename).suffix
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = uploads_dir / filename
    with dest.open('wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Return a path (development) that the client can call to download; in production use a CDN/S3 URL
    return { 'url': f"/uploads/{filename}" }


@app.get('/uploads/{filename}')
def serve_upload(filename: str):
    uploads_dir = pathlib.Path(__file__).parent / 'uploads'
    file_path = uploads_dir / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail='File not found')
    return FileResponse(path=file_path)


@app.post('/notifications')
def create_notification(payload: dict, db: sessionmaker = Depends(get_db)):
    user_id = payload.get('user_id')
    title = payload.get('title')
    message = payload.get('message')
    if not user_id or not title or not message:
        raise HTTPException(status_code=400, detail='Missing fields')
    n = Notification(user_id=user_id, title=title, message=message, read='false')
    db.add(n)
    db.commit()
    db.refresh(n)
    return { 'id': n.id, 'user_id': n.user_id, 'title': n.title, 'message': n.message, 'read': n.read }


@app.get('/notifications/user/{user_id}')
def list_user_notifications(user_id: int, db: sessionmaker = Depends(get_db)):
    nots = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    return [ { 'id': n.id, 'user_id': n.user_id, 'title': n.title, 'message': n.message, 'read': n.read, 'created_at': n.created_at } for n in nots ]


@app.post('/notifications/{notification_id}/read')
def mark_notification_read(notification_id: int, db: sessionmaker = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail='Notification not found')
    n.read = 'true'
    db.commit()
    return { 'ok': True }


@app.get('/notifications/{user_id}/unread-count')
def get_unread_count(user_id: int, db: sessionmaker = Depends(get_db)):
    cnt = db.query(Notification).filter(Notification.user_id == user_id, Notification.read == 'false').count()
    return { 'count': cnt }

# --- AI Analyzer endpoints (retained) ---
import io
import re
import logging
from typing import Dict, Any
import PyPDF2
import pandas as pd

# Configure logging for analyzer
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EcoCashAnalyzer:
    def __init__(self):
        self.transaction_patterns = {
            'inflow': [
                r'deposit', r'credit', r'received', r'payment', r'income',
                r'salary', r'wage', r'bonus', r'refund', r'cashback'
            ],
            'outflow': [
                r'withdrawal', r'debit', r'sent', r'payment', r'purchase',
                r'bill', r'fee', r'charge', r'transfer'
            ]
        }

    def extract_text_from_pdf(self, pdf_content: bytes) -> str:
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text = ""
            for page in pdf_reader.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            raise HTTPException(status_code=400, detail="Invalid PDF file")

    def parse_transactions(self, text: str) -> pd.DataFrame:
        transactions = []
        lines = text.split('\n')
        date_pattern = r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}'
        amount_pattern = r'[\d,]+\.?\d*'
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if any(keyword in line.lower() for keyword in [
                'ecocash', 'transaction', 'balance', 'deposit', 'withdrawal', 
                'transfer', 'payment', 'received', 'sent', 'cash', 'mobile'
            ]):
                amount_matches = re.findall(amount_pattern, line)
                if amount_matches:
                    amounts = [float(amt.replace(',', '')) for amt in amount_matches]
                    amount = max(amounts) if amounts else 0
                    if amount > 0:
                        transaction_type = 'outflow'
                        line_lower = line.lower()
                        if any(p in line_lower for p in self.transaction_patterns['inflow']):
                            transaction_type = 'inflow'
                        elif any(p in line_lower for p in self.transaction_patterns['outflow']):
                            transaction_type = 'outflow'
                        date_match = re.search(date_pattern, line)
                        transaction_date = date_match.group() if date_match else None
                        transactions.append({
                            'amount': amount,
                            'type': transaction_type,
                            'description': line,
                            'date': transaction_date
                        })
        return pd.DataFrame(transactions)

    def calculate_features(self, df: pd.DataFrame) -> Dict[str, Any]:
        if df.empty:
            return {
                'avg_balance': 0,
                'inflows': 0,
                'outflows': 0,
                'transaction_frequency': 0,
                'score': 0,
                'risk_level': 'High'
            }
        inflows = df[df['type'] == 'inflow']['amount'].sum()
        outflows = df[df['type'] == 'outflow']['amount'].sum()
        net_balance = inflows - outflows
        avg_balance = max(0, net_balance / 30) if len(df) > 0 else 0
        transaction_frequency = len(df) / 30
        score = self.calculate_credit_score(avg_balance, inflows, outflows, transaction_frequency)
        risk_level = 'Low' if score >= 70 else 'Medium' if score >= 50 else 'High'
        return {
            'avg_balance': round(avg_balance, 2),
            'inflows': round(inflows, 2),
            'outflows': round(outflows, 2),
            'transaction_frequency': round(transaction_frequency, 2),
            'score': score,
            'risk_level': risk_level
        }

    def calculate_credit_score(self, avg_balance: float, inflows: float, outflows: float, frequency: float) -> int:
        score = 0
        if avg_balance > 2000:
            score += 25
        elif avg_balance > 1000:
            score += 20
        elif avg_balance > 500:
            score += 15
        elif avg_balance > 100:
            score += 10
        else:
            score += 5
        if inflows > 5000:
            score += 25
        elif inflows > 2000:
            score += 20
        elif inflows > 1000:
            score += 15
        elif inflows > 500:
            score += 10
        else:
            score += 5
        if frequency > 20:
            score += 20
        elif frequency > 10:
            score += 15
        elif frequency > 5:
            score += 10
        elif frequency > 2:
            score += 5
        if inflows > 0:
            spending_ratio = outflows / inflows
            if spending_ratio < 0.7:
                score += 15
            elif spending_ratio < 0.8:
                score += 12
            elif spending_ratio < 0.9:
                score += 8
            elif spending_ratio < 1.0:
                score += 5
            else:
                score += 0
        else:
            score += 0
        if avg_balance > 0:
            if avg_balance > 500:
                score += 15
            elif avg_balance > 200:
                score += 10
            elif avg_balance > 50:
                score += 5
        return min(100, max(0, score))


analyzer = EcoCashAnalyzer()


@app.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        content = await file.read()
        text = analyzer.extract_text_from_pdf(content)
        transactions_df = analyzer.parse_transactions(text)
        features = analyzer.calculate_features(transactions_df)
        logger.info(f"Analysis completed for {file.filename}: Score {features['score']}")
        return {
            "success": True,
            "data": features,
            "filename": file.filename,
            "transaction_count": len(transactions_df)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze-text")
async def analyze_text(text: str):
    try:
        transactions_df = analyzer.parse_transactions(text)
        features = analyzer.calculate_features(transactions_df)
        return {
            "success": True,
            "data": features,
            "transaction_count": len(transactions_df)
        }
    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
