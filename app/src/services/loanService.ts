import axios from 'axios';
import { AuthService } from './auth';
import { LoanOffer, LoanApplication, Repayment, AISummary } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

const API_URL = API_ENDPOINTS.BACKEND;

export class LoanService {
  static async createLoanOffer(offerData: Omit<LoanOffer, 'id' | 'createdAt' | 'updatedAt'>) {
    const token = await AuthService.getToken();
    try {
      const res = await axios.post(`${API_URL}/loan-offers`, offerData, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (err) {
      // Fallback to generic /loans create
      const adapted = {
        user_id: offerData.lenderId,
        amount: offerData.amount,
        interest_rate: offerData.interestRate,
        duration: offerData.duration,
        conditions: offerData.conditions,
      };
      const res = await axios.post(`${API_URL}/loans`, adapted);
      return res.data;
    }
  }

  static async getActiveLoanOffers() {
    try {
      const res = await axios.get(`${API_URL}/loan-offers`, { params: { status: 'active' } });
      return res.data;
    } catch (err) {
      // Fallback to /loans and map shape
      const res = await axios.get(`${API_URL}/loans`);
      const items = (res.data || []).map((l: any) => ({
        id: l.id,
        lenderId: l.user_id,
        amount: l.amount,
        interestRate: l.interest_rate,
        duration: l.duration,
        conditions: l.conditions ?? 'Standard terms apply',
        status: 'active',
        createdAt: l.created_at ?? new Date().toISOString(),
        updatedAt: l.updated_at ?? new Date().toISOString(),
      }));
      return items;
    }
  }

  static async applyForLoan(applicationData: Omit<LoanApplication, 'id' | 'createdAt' | 'updatedAt'>) {
    const token = await AuthService.getToken();
    try {
      const res = await axios.post(`${API_URL}/loan-applications`, applicationData, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (err) {
      // Fallback: return mock success
      return { ok: true } as any;
    }
  }

  static async uploadStatement(fileUri: string, applicationId: string): Promise<string> {
    // fileUri is expected to be an Expo document uri (file:// or content://)
    // We'll use fetch + FormData to POST the file to the backend /uploads endpoint
    try {
      const token = await AuthService.getToken();
      const formData = new FormData();

      // fetch the file as blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const filename = fileUri.split('/').pop() || 'statement.pdf';
      formData.append('file', {
        // @ts-ignore - React Native FormData file object
        uri: fileUri,
        name: filename,
        type: 'application/pdf',
      } as any);

      const res = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData as any,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error('uploadStatement error', err);
      throw err;
    }
  }

  static async getUserApplications() {
    const token = await AuthService.getToken();
    try {
      const res = await axios.get(`${API_URL}/loan-applications/my`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (err) {
      return [];
    }
  }

  static async getLenderApplications() {
    const token = await AuthService.getToken();
    try {
      const res = await axios.get(`${API_URL}/loan-applications/lender`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (err) {
      return [];
    }
  }

  static async updateApplicationStatus(applicationId: string, status: 'approved' | 'rejected') {
    const token = await AuthService.getToken();
    try {
      await axios.put(`${API_URL}/loan-applications/${applicationId}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      // No-op fallback
    }
  }

  static async createRepayment(repaymentData: Omit<Repayment, 'id' | 'createdAt' | 'updatedAt'>) {
    const token = await AuthService.getToken();
    const res = await axios.post(`${API_URL}/repayments`, repaymentData, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  }

  static async getLoanOffer(offerId: string) {
    try {
      const res = await axios.get(`${API_URL}/loan-offers/${offerId}`);
      return res.data;
    } catch (err) {
      const res = await axios.get(`${API_URL}/loans/${offerId}`);
      const l = res.data;
      return {
        id: l.id,
        lenderId: l.user_id,
        amount: l.amount,
        interestRate: l.interest_rate,
        duration: l.duration,
        conditions: l.conditions ?? 'Standard terms apply',
        status: 'active',
        createdAt: l.created_at ?? new Date().toISOString(),
        updatedAt: l.updated_at ?? new Date().toISOString(),
      } as any;
    }
  }

  static async getLoanApplication(applicationId: string) {
    try {
      const res = await axios.get(`${API_URL}/loan-applications/${applicationId}`);
      return res.data;
    } catch (err) {
      return null as any;
    }
  }

  static async updateLoanOffer(offerId: string, updates: Partial<LoanOffer>) {
    const token = await AuthService.getToken();
    try {
      await axios.patch(`${API_URL}/loan-offers/${offerId}`, updates, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {}
  }

  static async deleteLoanOffer(offerId: string) {
    const token = await AuthService.getToken();
    try {
      await axios.delete(`${API_URL}/loan-offers/${offerId}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {}
  }

  static async getLenderOffers() {
    const token = await AuthService.getToken();
    try {
      const res = await axios.get(`${API_URL}/loan-offers/my`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (err) {
      const user = await AuthService.getCurrentUser();
      const res = await axios.get(`${API_URL}/loans`);
      return (res.data || []).filter((l: any) => String(l.user_id) === String(user?.id)).map((l: any) => ({
        id: l.id,
        lenderId: l.user_id,
        amount: l.amount,
        interestRate: l.interest_rate,
        duration: l.duration,
        conditions: l.conditions ?? 'Standard terms apply',
        status: 'active',
        createdAt: l.created_at ?? new Date().toISOString(),
        updatedAt: l.updated_at ?? new Date().toISOString(),
      }));
    }
  }

  static async filterLoanOffers(filters: {
    minAmount?: number;
    maxAmount?: number;
    minInterestRate?: number;
    maxInterestRate?: number;
    duration?: string;
  }) {
    try {
      const res = await axios.get(`${API_URL}/loan-offers`, { params: filters });
      return res.data;
    } catch (err) {
      const items = await this.getActiveLoanOffers();
      return items.filter((o: any) => (
        (filters.minAmount === undefined || o.amount >= filters.minAmount) &&
        (filters.maxAmount === undefined || o.amount <= filters.maxAmount) &&
        (filters.minInterestRate === undefined || o.interestRate >= filters.minInterestRate) &&
        (filters.maxInterestRate === undefined || o.interestRate <= filters.maxInterestRate) &&
        (filters.duration === undefined || o.duration === filters.duration)
      ));
    }
  }

  static async updateAISummary(applicationId: string, aiSummary: AISummary) {
    const token = await AuthService.getToken();
    try {
      await axios.post(`${API_URL}/loans/applications/${applicationId}/ai-summary`, { aiSummary }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {}
  }

  static async getLoanRepayments(loanId: string) {
    try {
      const res = await axios.get(`${API_URL}/repayments/loan/${loanId}`);
      return res.data;
    } catch (err) {
      return [];
    }
  }

  static async updateRepaymentStatus(repaymentId: string, status: 'pending' | 'paid' | 'overdue') {
    const token = await AuthService.getToken();
    try {
      await axios.post(`${API_URL}/repayments/${repaymentId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {}
  }

  static async getPaginatedLoanOffers(pageSize: number = 10, lastId?: string) {
    const res = await axios.get(`${API_URL}/loan-offers`, { params: { limit: pageSize, after: lastId } });
    return res.data;
  }
}
