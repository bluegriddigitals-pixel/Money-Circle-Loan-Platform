import { DataSource } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';
import { UserProfile } from '../modules/user/entities/user-profile.entity';
import { Wallet } from '../modules/payment/entities/wallet.entity';
import { LoanProduct } from '../modules/loan/entities/loan-product.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'moneycircle',
    entities: [User, UserProfile, Wallet, LoanProduct],
    synchronize: false,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const profileRepository = dataSource.getRepository(UserProfile);
  const walletRepository = dataSource.getRepository(Wallet);
  const loanProductRepository = dataSource.getRepository(LoanProduct);

  console.log('🌱 Seeding database...');

  // Create test users
  const users = [
    {
      email: 'borrower@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+27821234567',
      role: 'borrower' as const,
      status: 'active' as const,
      kycStatus: 'verified' as const,
    },
    {
      email: 'lender@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+27827654321',
      role: 'lender' as const,
      status: 'active' as const,
      kycStatus: 'verified' as const,
    },
    {
      email: 'auditor@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Mike',
      lastName: 'Johnson',
      phoneNumber: '+27829876543',
      role: 'auditor' as const,
      status: 'active' as const,
      kycStatus: 'verified' as const,
    },
    {
      email: 'admin@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Sarah',
      lastName: 'Williams',
      phoneNumber: '+27823456789',
      role: 'system_admin' as const,
      status: 'active' as const,
      kycStatus: 'verified' as const,
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create({
        ...userData,
        passwordHash: await bcrypt.hash(userData.password, 10),
        isEmailVerified: true,
      });

      await userRepository.save(user);

      // Create profile
      const profile = profileRepository.create({
        userId: user.id,
        employmentStatus: 'employed',
        employerName: 'ABC Company',
        jobTitle: 'Software Developer',
        monthlyIncome: 50000,
        creditScore: 750,
        riskLevel: 'low',
      });

      await profileRepository.save(profile);

      // Create wallet
      const wallet = walletRepository.create({
        userId: user.id,
        availableBalance: user.role === 'lender' ? 100000 : 0,
        lockedBalance: 0,
      });

      await walletRepository.save(wallet);

      console.log(`✅ Created ${user.role}: ${user.email}`);
    }
  }

  // Create loan products
  const loanProducts = [
    {
      name: 'Personal Loan',
      code: 'PL-001',
      description: 'Short-term personal loan for immediate needs',
      minAmount: 5000,
      maxAmount: 50000,
      minTenureMonths: 3,
      maxTenureMonths: 24,
      interestRate: 15.5,
      interestType: 'fixed',
      calculationMethod: 'reducing_balance',
      processingFeePercent: 1.5,
      minCreditScore: 600,
      isActive: true,
    },
    {
      name: 'Business Loan',
      code: 'BL-001',
      description: 'Loan for small business expansion',
      minAmount: 10000,
      maxAmount: 200000,
      minTenureMonths: 6,
      maxTenureMonths: 36,
      interestRate: 12.5,
      interestType: 'fixed',
      calculationMethod: 'reducing_balance',
      processingFeePercent: 2.0,
      minCreditScore: 650,
      isActive: true,
    },
    {
      name: 'Education Loan',
      code: 'EL-001',
      description: 'Loan for education expenses',
      minAmount: 10000,
      maxAmount: 100000,
      minTenureMonths: 12,
      maxTenureMonths: 48,
      interestRate: 10.5,
      interestType: 'fixed',
      calculationMethod: 'reducing_balance',
      processingFeePercent: 1.0,
      minCreditScore: 550,
      isActive: true,
    },
  ];

  for (const productData of loanProducts) {
    const existingProduct = await loanProductRepository.findOne({
      where: { code: productData.code },
    });

    if (!existingProduct) {
      const product = loanProductRepository.create(productData);
      await loanProductRepository.save(product);
      console.log(`✅ Created loan product: ${product.name}`);
    }
  }

  console.log('🎉 Database seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});