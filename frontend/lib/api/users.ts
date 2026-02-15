import apiClient from './client';
import { User, UserProfile, Wallet, UserDocument } from '../types/user';

export const usersApi = {
    getCurrentUser: async (): Promise<{ user: User }> => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await apiClient.patch('/users/me/profile', data);
        return response.data;
    },

    updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
        const response = await apiClient.patch(`/users/${userId}`, data);
        return response.data;
    },

    uploadAvatar: async (formData: FormData): Promise<string> => {
        const response = await apiClient.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.url;
    },

    getWallet: async (): Promise<Wallet> => {
        const response = await apiClient.get('/users/me/wallet');
        return response.data;
    },

    updateWallet: async (settings: Partial<Wallet>): Promise<Wallet> => {
        const response = await apiClient.patch('/users/me/wallet', settings);
        return response.data;
    },

    getDocuments: async (): Promise<UserDocument[]> => {
        const response = await apiClient.get('/users/me/documents');
        return response.data;
    },

    uploadDocument: async (formData: FormData): Promise<UserDocument> => {
        const response = await apiClient.post('/users/me/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteDocument: async (documentId: string): Promise<void> => {
        await apiClient.delete(`/users/me/documents/${documentId}`);
    },

    verifyDocument: async (documentId: string, verified: boolean, notes?: string): Promise<UserDocument> => {
        const response = await apiClient.post(`/admin/documents/${documentId}/verify`, { verified, notes });
        return response.data;
    },

    submitKYC: async (data: any): Promise<{ success: boolean }> => {
        const response = await apiClient.post('/users/me/kyc', data);
        return response.data;
    },

    getKYCStatus: async (): Promise<string> => {
        const response = await apiClient.get('/users/me/kyc/status');
        return response.data.status;
    },

    updateNotificationPreferences: async (preferences: any): Promise<UserProfile> => {
        const response = await apiClient.patch('/users/me/notifications', preferences);
        return response.data;
    },

    updateBankingDetails: async (details: Partial<User>): Promise<User> => {
        const response = await apiClient.patch('/users/me/banking', details);
        return response.data;
    },
};
