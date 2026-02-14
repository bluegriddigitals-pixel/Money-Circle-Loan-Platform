import apiClient from './client';
import { UserDocument } from '../types/user';

export const documentsApi = {
  getMyDocuments: async (): Promise<UserDocument[]> => {
    const response = await apiClient.get('/documents/my');
    return response.data;
  },

  uploadDocument: async (formData: FormData): Promise<UserDocument> => {
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocument: async (id: string): Promise<UserDocument> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  deleteDocument: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  downloadDocument: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};