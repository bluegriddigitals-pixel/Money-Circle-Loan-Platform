export interface LoanCalculationParams {
  principal: number;
  interestRate: number;
  tenureMonths: number;
  interestType: 'fixed' | 'reducing';
  calculationMethod: 'flat' | 'amortized';
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export const calculateLoan = ({
  principal,
  interestRate,
  tenureMonths,
  calculationMethod,
}: LoanCalculationParams): LoanCalculationResult => {
  const monthlyRate = interestRate / 100 / 12;

  if (calculationMethod === 'flat') {
    const totalInterest = principal * (interestRate / 100) * (tenureMonths / 12);
    const totalAmount = principal + totalInterest;
    const monthlyPayment = totalAmount / tenureMonths;

    const schedule = Array.from({ length: tenureMonths }, (_, i) => ({
      month: i + 1,
      payment: monthlyPayment,
      principal: principal / tenureMonths,
      interest: totalInterest / tenureMonths,
      balance: principal - (principal / tenureMonths) * (i + 1),
    }));

    return {
      monthlyPayment,
      totalInterest,
      totalAmount,
      schedule,
    };
  } else {
    // Amortized calculation
    const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    let balance = principal;
    const schedule = [];
    let totalInterest = 0;

    for (let i = 0; i < tenureMonths; i++) {
      const interest = balance * monthlyRate;
      const principalPaid = monthlyPayment - interest;
      balance -= principalPaid;
      totalInterest += interest;

      schedule.push({
        month: i + 1,
        payment: monthlyPayment,
        principal: principalPaid,
        interest,
        balance: Math.max(0, balance),
      });
    }

    return {
      monthlyPayment,
      totalInterest,
      totalAmount: principal + totalInterest,
      schedule,
    };
  }
};

export const calculateInvestmentReturn = (
  amount: number,
  interestRate: number,
  tenureMonths: number
): number => {
  return amount * (interestRate / 100) * (tenureMonths / 12);
};

export const calculateLateFee = (
  amount: number,
  daysOverdue: number,
  lateFeePercent: number,
  lateFeeFixed: number
): number => {
  const percentFee = amount * (lateFeePercent / 100);
  return Math.max(percentFee, lateFeeFixed) * Math.ceil(daysOverdue / 30);
};