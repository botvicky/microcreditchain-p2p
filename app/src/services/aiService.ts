import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

const AI_SERVICE_URL = API_ENDPOINTS.AI_SERVICE; // Configurable via EXPO_PUBLIC_AI_SERVICE_URL

export interface AIAnalysisResult {
  avg_balance: number;
  inflows: number;
  outflows: number;
  transaction_frequency: number;
  score: number;
  risk_level: 'Low' | 'Medium' | 'High';
}

export class AIService {
  // Web-only method. Prefer analyzeStatementFromUri for React Native.
  static async analyzeStatement(file: File): Promise<AIAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${AI_SERVICE_URL}/analyze-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
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
        risk_level: 'High',
      };
    }
  }

  // React Native-friendly method using a local file URI
  static async analyzeStatementFromUri(fileUri: string): Promise<AIAnalysisResult> {
    try {
      const formData = new FormData();
      const filename = fileUri.split('/').pop() || 'statement.pdf';
      formData.append('file', {
        // @ts-ignore React Native FormData file shape
        uri: fileUri,
        name: filename,
        type: 'application/pdf',
      } as any);

      const response = await axios.post(`${AI_SERVICE_URL}/analyze-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('AI analysis failed');
    } catch (error) {
      console.error('Error calling AI service:', error);
      return {
        avg_balance: 0,
        inflows: 0,
        outflows: 0,
        transaction_frequency: 0,
        score: 0,
        risk_level: 'High',
      };
    }
  }

  static async analyzeText(text: string): Promise<AIAnalysisResult> {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/analyze-text`, {
        text,
      }, {
        timeout: 30000,
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
        risk_level: 'High',
      };
    }
  }

  static getRiskColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'Low':
        return '#00B894';
      case 'Medium':
        return '#FFD700';
      case 'High':
        return '#E63946';
      default:
        return '#666';
    }
  }

  static getScoreColor(score: number): string {
    if (score >= 70) return '#00B894';
    if (score >= 50) return '#FFD700';
    return '#E63946';
  }
}
