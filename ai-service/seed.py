"""
Seed script for ShamwariPay test accounts
Creates admin, lender, and borrower accounts for testing
"""

import sys
import os
from sqlalchemy.orm import Session

# Add parent directory to path to import from main.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import User, Loan, SessionLocal, Base, engine, RoleEnum, pwd_context

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def create_test_accounts(db: Session):
    """Create test accounts for development"""
    
    # Check if users already exist
    existing_admin = db.query(User).filter(User.email == "admin@shamwaripay.com").first()
    if existing_admin:
        print("⚠️  Test accounts already exist. Skipping creation.")
        return
    
    print("🌱 Seeding test accounts...")
    
    # Admin Account
    admin = User(
        name="Admin User",
        email="admin@shamwaripay.com",
        phone="+263771234567",
        role=RoleEnum.admin,
        id_number="ADM001",
        password_hash=hash_password("admin123"),
        rating=100,
        status="active"
    )
    db.add(admin)
    print("✅ Created admin account: admin@shamwaripay.com / admin123")
    
    # Lender Account
    lender = User(
        name="John Lender",
        email="lender@shamwaripay.com",
        phone="+263771234568",
        role=RoleEnum.lender,
        id_number="LND001",
        password_hash=hash_password("lender123"),
        rating=85,
        status="active"
    )
    db.add(lender)
    print("✅ Created lender account: lender@shamwaripay.com / lender123")
    
    # Borrower Account
    borrower = User(
        name="Jane Borrower",
        email="borrower@shamwaripay.com",
        phone="+263771234569",
        role=RoleEnum.borrower,
        id_number="BRW001",
        password_hash=hash_password("borrower123"),
        rating=75,
        status="active"
    )
    db.add(borrower)
    print("✅ Created borrower account: borrower@shamwaripay.com / borrower123")
    
    # Commit all users
    db.commit()
    db.refresh(admin)
    db.refresh(lender)
    db.refresh(borrower)
    
    print("\n📊 Creating sample loan offers...")
    
    # Sample Loan Offers
    loan_offers = [
        Loan(
            user_id=lender.id,
            amount=5000,
            interest_rate=15.0,
            duration="3 months",
            conditions="Weekly repayment schedule. Good credit score required.",
            status="active"
        ),
        Loan(
            user_id=lender.id,
            amount=10000,
            interest_rate=12.0,
            duration="6 months",
            conditions="Monthly repayment. Collateral required for amounts above $5000.",
            status="active"
        ),
        Loan(
            user_id=lender.id,
            amount=3000,
            interest_rate=18.0,
            duration="1 month",
            conditions="Short-term loan. Weekly payments. No collateral needed.",
            status="active"
        ),
        Loan(
            user_id=lender.id,
            amount=15000,
            interest_rate=10.0,
            duration="12 months",
            conditions="Long-term loan. Monthly repayment. Business plan required.",
            status="active"
        ),
    ]
    
    for loan in loan_offers:
        db.add(loan)
    
    db.commit()
    print(f"✅ Created {len(loan_offers)} sample loan offers")
    
    print("\n" + "="*60)
    print("✨ SEEDING COMPLETE!")
    print("="*60)
    print("\n📝 Test Accounts:")
    print("-" * 60)
    print("Admin:    admin@shamwaripay.com    | Password: admin123")
    print("Lender:   lender@shamwaripay.com   | Password: lender123")
    print("Borrower: borrower@shamwaripay.com | Password: borrower123")
    print("-" * 60)
    print("\n🚀 You can now use these accounts to login to the mobile app!")
    print("="*60 + "\n")

def main():
    """Main seed function"""
    print("\n" + "="*60)
    print("🌱 ShamwariPay Database Seeding")
    print("="*60 + "\n")
    
    # Create tables if they don't exist
    print("📦 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created/verified\n")
    
    # Create database session
    db = SessionLocal()
    
    try:
        create_test_accounts(db)
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
