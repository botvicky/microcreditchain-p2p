import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://ml.microcreditchain.ai';

export async function analyzeStatement(fileBuffer: Buffer): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), 'statement.pdf');
    
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('AI analysis failed');
    }
  } catch (error) {
    console.error('Error calling AI service:', error);
    
    // Return default analysis if AI service fails
    return {
      avg_balance: 0,
      inflows: 0,
      outflows: 0,
      transaction_frequency: 0,
      score: 0,
      risk_level: 'High'
    };
  }
}

export async function analyzeText(text: string): Promise<any> {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-text`, {
      text
    }, {
      timeout: 30000
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('AI analysis failed');
    }
  } catch (error) {
    console.error('Error calling AI service:', error);
    
    // Return default analysis if AI service fails
    return {
      avg_balance: 0,
      inflows: 0,
      outflows: 0,
      transaction_frequency: 0,
      score: 0,
      risk_level: 'High'
    };
  }
}
