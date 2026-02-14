import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserProfile, Wallet, UserDocument } from '../types/user';
import { usersApi } from '../api/users';

interface UserState {
  // State
  currentUser: User | null;
  profile: UserProfile | null;
  wallet: Wallet | null;
  documents: UserDocument[];
  loading: boolean;
  error: string | null;
  
  // User Actions
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  updateUser: (userId: string, data: Partial<User>) => Promise<User | null>;
  uploadAvatar: (file: File) => Promise<string | null>;
  
  // Wallet Actions
  fetchWallet: () => Promise<void>;
  updateWalletSettings: (settings: Partial<Wallet>) => Promise<Wallet | null>;
  
  // Document Actions
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, type: string, metadata?: any) => Promise<UserDocument | null>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  verifyDocument: (documentId: string, verified: boolean, notes?: string) => Promise<boolean>;
  
  // KYC Actions
  submitKYC: (data: any) => Promise<boolean>;
  getKYCStatus: () => Promise<string>;
  
  // Notification Preferences
  updateNotificationPreferences: (preferences: any) => Promise<boolean>;
  
  // Banking Details
  updateBankingDetails: (details: Partial<User>) => Promise<User | null>;
  
  // Utilities
  clearError: () => void;
  resetState: () => void;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      profile: null,
      wallet: null,
      documents: [],
      loading: false,
      error: null,

      // Set user directly (useful for auth)
      setUser: (user) => {
        set({ currentUser: user });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Reset state
      resetState: () => {
        set({
          currentUser: null,
          profile: null,
          wallet: null,
          documents: [],
          loading: false,
          error: null,
        });
      },

      // Fetch current user data
      fetchCurrentUser: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await usersApi.getCurrentUser();
          set({ 
            currentUser: response.user,
            profile: response.user.profile,
            wallet: response.user.wallet,
            loading: false 
          });
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to fetch user data';
          set({ error: errorMessage, loading: false });
          console.error('Fetch user error:', err);
        }
      },

      // Update user profile
      updateProfile: async (data: Partial<UserProfile>) => {
        set({ loading: true, error: null });
        
        try {
          const updatedProfile = await usersApi.updateProfile(data);
          set({ profile: updatedProfile, loading: false });
          return updatedProfile;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to update profile';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      // Update user (admin only)
      updateUser: async (userId: string, data: Partial<User>) => {
        set({ loading: true, error: null });
        
        try {
          const updatedUser = await usersApi.updateUser(userId, data);
          
          // If updating current user, update state
          const { currentUser } = get();
          if (currentUser && currentUser.id === userId) {
            set({ currentUser: updatedUser, loading: false });
          } else {
            set({ loading: false });
          }
          
          return updatedUser;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to update user';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      // Upload avatar
      uploadAvatar: async (file: File) => {
        set({ loading: true, error: null });
        
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          
          const avatarUrl = await usersApi.uploadAvatar(formData);
          
          // Update current user with new avatar
          const { currentUser } = get();
          if (currentUser) {
            set({ 
              currentUser: { ...currentUser, avatar: avatarUrl },
              loading: false 
            });
          }
          
          return avatarUrl;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to upload avatar';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      // Fetch wallet
      fetchWallet: async () => {
        set({ loading: true, error: null });
        
        try {
          const wallet = await usersApi.getWallet();
          set({ wallet, loading: false });
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to fetch wallet';
          set({ error: errorMessage, loading: false });
        }
      },

      // Update wallet settings
      updateWalletSettings: async (settings: Partial<Wallet>) => {
        set({ loading: true, error: null });
        
        try {
          const updatedWallet = await usersApi.updateWallet(settings);
          set({ wallet: updatedWallet, loading: false });
          return updatedWallet;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to update wallet';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      // Fetch documents
      fetchDocuments: async () => {
        set({ loading: true, error: null });
        
        try {
          const documents = await usersApi.getDocuments();
          set({ documents, loading: false });
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to fetch documents';
          set({ error: errorMessage, loading: false });
        }
      },

      // Upload document
      uploadDocument: async (file: File, type: string, metadata?: any) => {
        set({ loading: true, error: null });
        
        try {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('type', type);
          if (metadata) {
            formData.append('metadata', JSON.stringify(metadata));
          }
          
          const document = await usersApi.uploadDocument(formData);
          set((state) => ({ 
            documents: [...state.documents, document],
            loading: false 
          }));
          
          return document;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to upload document';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },

      // Delete document
      deleteDocument: async (documentId: string) => {
        set({ loading: true, error: null });
        
        try {
          await usersApi.deleteDocument(documentId);
          set((state) => ({ 
            documents: state.documents.filter(doc => doc.id !== documentId),
            loading: false 
          }));
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to delete document';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      // Verify document (admin/auditor only)
      verifyDocument: async (documentId: string, verified: boolean, notes?: string) => {
        set({ loading: true, error: null });
        
        try {
          const updatedDocument = await usersApi.verifyDocument(documentId, verified, notes);
          set((state) => ({
            documents: state.documents.map(doc => 
              doc.id === documentId ? updatedDocument : doc
            ),
            loading: false
          }));
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to verify document';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      // Submit KYC
      submitKYC: async (data: any) => {
        set({ loading: true, error: null });
        
        try {
          const result = await usersApi.submitKYC(data);
          
          // Update user KYC status
          const { currentUser } = get();
          if (currentUser) {
            set({ 
              currentUser: { ...currentUser, kycStatus: 'pending' },
              loading: false 
            });
          }
          
          return result.success;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to submit KYC';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      // Get KYC status
      getKYCStatus: async () => {
        try {
          const status = await usersApi.getKYCStatus();
          return status;
        } catch (err) {
          return 'unknown';
        }
      },

      // Update notification preferences
      updateNotificationPreferences: async (preferences: any) => {
        set({ loading: true, error: null });
        
        try {
          const updatedProfile = await usersApi.updateNotificationPreferences(preferences);
          set({ profile: updatedProfile, loading: false });
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to update preferences';
          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      // Update banking details
      updateBankingDetails: async (details: Partial<User>) => {
        set({ loading: true, error: null });
        
        try {
          const updatedUser = await usersApi.updateBankingDetails(details);
          set({ currentUser: updatedUser, loading: false });
          return updatedUser;
        } catch (err: any) {
          const errorMessage = err.response?.data?.error || 'Failed to update banking details';
          set({ error: errorMessage, loading: false });
          return null;
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        profile: state.profile,
        wallet: state.wallet,
      }),
    }
  )
);

// Selector hooks for specific user data
export const useUser = () => useUserStore((state) => state.currentUser);
export const useUserProfile = () => useUserStore((state) => state.profile);
export const useUserWallet = () => useUserStore((state) => state.wallet);
export const useUserDocuments = () => useUserStore((state) => state.documents);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserError = () => useUserStore((state) => state.error);

// Computed selectors
export const useFullName = () => {
  const user = useUser();
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`;
};

export const useInitials = () => {
  const user = useUser();
  if (!user) return '';
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
};

export const useIsKYCVerified = () => {
  const user = useUser();
  return user?.kycStatus === 'verified';
};

export const useIsEmailVerified = () => {
  const user = useUser();
  return user?.isEmailVerified || false;
};

export const useWalletBalance = () => {
  const wallet = useUserWallet();
  return {
    available: wallet?.availableBalance || 0,
    locked: wallet?.lockedBalance || 0,
    total: (wallet?.availableBalance || 0) + (wallet?.lockedBalance || 0),
  };
};