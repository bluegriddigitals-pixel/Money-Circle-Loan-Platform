export const formatCurrency = (amount: number, currency: string = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  return d.toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPhoneNumber = (phone: string): string => {
  // Format South African phone numbers
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(27|0)?(\d{2})(\d{3})(\d{4})$/);
  
  if (match) {
    const intlCode = match[1] ? '+27' : '0';
    return `${intlCode} ${match[2]} ${match[3]} ${match[4]}`;
  }
  
  return phone;
};

export const formatNationalId = (id: string): string => {
  // Format South African ID number: YYMMDD SSSS C A
  const cleaned = id.replace(/\D/g, '');
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 6)} ${cleaned.slice(6, 10)} ${cleaned.slice(10, 11)} ${cleaned.slice(11)}`;
  }
  return id;
};