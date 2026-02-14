export const LOAN_TERMS = {
  MIN_AMOUNT: 1000,
  MAX_AMOUNT: 250000,
  MIN_TENURE_MONTHS: 1,
  MAX_TENURE_MONTHS: 60,
  MIN_INTEREST_RATE: 5,
  MAX_INTEREST_RATE: 30,
  
  INTEREST_TYPES: {
    FIXED: 'fixed',
    REDUCING: 'reducing',
  } as const,
  
  CALCULATION_METHODS: {
    FLAT: 'flat',
    AMORTIZED: 'amortized',
  } as const,
  
  DEFAULT_PROCESSING_FEE_PERCENT: 1.5,
  DEFAULT_LATE_FEE_PERCENT: 2,
  DEFAULT_LATE_FEE_FIXED: 100,
} as const;

export const LOAN_PURPOSES = [
  { value: 'debt_consolidation', label: 'Debt Consolidation' },
  { value: 'home_improvement', label: 'Home Improvement' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical Expenses' },
  { value: 'business', label: 'Business' },
  { value: 'vehicle', label: 'Vehicle Purchase' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'other', label: 'Other' },
] as const;