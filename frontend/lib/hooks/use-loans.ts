import { useState } from 'react';
import { loansApi } from '../api/loans';
import { Loan, LoanApplication, LoanProduct } from '../types/loan';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyLoans = async () => {
    setIsLoading(true);
    try {
      const data = await loansApi.getMyLoans();
      setLoans(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch loans');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    setIsLoading(true);
    try {
      const data = await loansApi.getMyApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await loansApi.getLoanProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const createApplication = async (data: Partial<LoanApplication>) => {
    setIsLoading(true);
    try {
      const newApplication = await loansApi.createApplication(data);
      setApplications(prev => [...prev, newApplication]);
      return newApplication;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create application');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loans,
    applications,
    products,
    isLoading,
    error,
    fetchMyLoans,
    fetchMyApplications,
    fetchProducts,
    createApplication,
  };
}