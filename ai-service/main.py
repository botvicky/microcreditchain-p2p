from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import io
import re
from typing import Dict, Any
import logging
import json
from datetime import datetime, timedelta
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MicroCreditChain AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for ML model (in production, load from file)
scaler = StandardScaler()
model = None

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
        """Extract text from PDF content"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            raise HTTPException(status_code=400, detail="Invalid PDF file")
    
    def parse_transactions(self, text: str) -> pd.DataFrame:
        """Parse transactions from EcoCash statement text with enhanced pattern matching"""
        transactions = []
        lines = text.split('\n')
        
        # Enhanced patterns for EcoCash statements
        date_pattern = r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}'
        amount_pattern = r'[\d,]+\.?\d*'
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for transaction patterns with better detection
            if any(keyword in line.lower() for keyword in [
                'ecocash', 'transaction', 'balance', 'deposit', 'withdrawal', 
                'transfer', 'payment', 'received', 'sent', 'cash', 'mobile'
            ]):
                # Extract amount (look for currency patterns)
                amount_matches = re.findall(amount_pattern, line)
                if amount_matches:
                    # Take the largest amount found (likely the transaction amount)
                    amounts = [float(amt.replace(',', '')) for amt in amount_matches]
                    amount = max(amounts) if amounts else 0
                    
                    if amount > 0:  # Only process if we found a valid amount
                        # Determine transaction type with better logic
                        transaction_type = 'outflow'
                        line_lower = line.lower()
                        
                        # Check for inflow patterns
                        if any(pattern in line_lower for pattern in self.transaction_patterns['inflow']):
                            transaction_type = 'inflow'
                        # Check for outflow patterns
                        elif any(pattern in line_lower for pattern in self.transaction_patterns['outflow']):
                            transaction_type = 'outflow'
                        # If no clear pattern, use amount-based logic
                        elif 'balance' in line_lower and amount > 0:
                            transaction_type = 'inflow'  # Balance increases are inflows
                        
                        # Extract date if present
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
        """Calculate financial features from transaction data"""
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
        
        # Calculate average balance (simplified)
        avg_balance = max(0, net_balance / 30) if len(df) > 0 else 0
        
        # Transaction frequency (transactions per day)
        transaction_frequency = len(df) / 30  # Assuming 30-day period
        
        # Calculate creditworthiness score
        score = self.calculate_credit_score(avg_balance, inflows, outflows, transaction_frequency)
        
        # Determine risk level
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
        """Calculate enhanced creditworthiness score (0-100) with multiple factors"""
        score = 0
        
        # Balance factor (25% weight) - Higher balances indicate better financial stability
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
        
        # Income stability (25% weight) - Consistent income is key
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
        
        # Transaction frequency (20% weight) - Active users are more reliable
        if frequency > 20:
            score += 20
        elif frequency > 10:
            score += 15
        elif frequency > 5:
            score += 10
        elif frequency > 2:
            score += 5
        
        # Spending control (15% weight) - Living within means
        if inflows > 0:
            spending_ratio = outflows / inflows
            if spending_ratio < 0.7:  # Spending less than 70% of income
                score += 15
            elif spending_ratio < 0.8:  # Spending less than 80% of income
                score += 12
            elif spending_ratio < 0.9:  # Spending less than 90% of income
                score += 8
            elif spending_ratio < 1.0:  # Spending less than 100% of income
                score += 5
            else:
                score += 0  # Spending more than income
        else:
            score += 0  # No income data
        
        # Balance consistency (15% weight) - Stable balances indicate good money management
        if avg_balance > 0:
            # This would need historical data, for now we'll use current balance as proxy
            if avg_balance > 500:
                score += 15
            elif avg_balance > 200:
                score += 10
            elif avg_balance > 50:
                score += 5
        
        return min(100, max(0, score))

analyzer = EcoCashAnalyzer()

@app.get("/")
async def root():
    return {"message": "MicroCreditChain AI Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-analyzer"}

@app.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    """Analyze EcoCash PDF statement and return creditworthiness assessment"""
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        # Read file content
        content = await file.read()
        
        # Extract text from PDF
        text = analyzer.extract_text_from_pdf(content)
        
        # Parse transactions
        transactions_df = analyzer.parse_transactions(text)
        
        # Calculate features
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
    """Analyze EcoCash statement text directly"""
    try:
        # Parse transactions
        transactions_df = analyzer.parse_transactions(text)
        
        # Calculate features
        features = analyzer.calculate_features(transactions_df)
        
        return {
            "success": True,
            "data": features,
            "transaction_count": len(transactions_df)
        }
        
    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
