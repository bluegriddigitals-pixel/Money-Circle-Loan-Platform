import { DataSource } from 'typeorm';
import { User, UserRole, AccountStatus, KycStatus, VerificationStatus } from '../modules/user/entities/user.entity';
import { UserProfile, RiskLevel } from '../modules/user/entities/user-profile.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'moneycircle',
    entities: [User, UserProfile],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('📦 Database connected');

  const userRepository = dataSource.getRepository(User);
  const profileRepository = dataSource.getRepository(UserProfile);

  console.log('🌱 Seeding database...');

  const usersData = [
    {
      email: 'borrower@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+27821234567',
      role: UserRole.BORROWER,
      accountStatus: AccountStatus.ACTIVE,
      kycStatus: KycStatus.VERIFIED,
      verificationStatus: VerificationStatus.FULLY_VERIFIED,
    },
    {
      email: 'lender@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+27827654321',
      role: UserRole.LENDER,
      accountStatus: AccountStatus.ACTIVE,
      kycStatus: KycStatus.VERIFIED,
      verificationStatus: VerificationStatus.FULLY_VERIFIED,
    },
    {
      email: 'auditor@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Mike',
      lastName: 'Johnson',
      phoneNumber: '+27829876543',
      role: UserRole.AUDITOR,
      accountStatus: AccountStatus.ACTIVE,
      kycStatus: KycStatus.VERIFIED,
      verificationStatus: VerificationStatus.FULLY_VERIFIED,
    },
    {
      email: 'admin@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Sarah',
      lastName: 'Williams',
      phoneNumber: '+27823456789',
      role: UserRole.SYSTEM_ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      kycStatus: KycStatus.VERIFIED,
      verificationStatus: VerificationStatus.FULLY_VERIFIED,
    },
  ];

  for (const userData of usersData) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create({
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        accountStatus: userData.accountStatus,
        kycStatus: userData.kycStatus,
        verificationStatus: userData.verificationStatus,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
        phoneVerificationCode: null,
        phoneVerificationCodeExpiry: null,
        acceptedTermsVersion: '1.0.0',
        acceptedPrivacyVersion: '1.0.0',
        marketingConsent: true,
        dataProcessingConsent: true,
        lastPasswordChangeAt: new Date(),
        passwordHistory: [],
      });

      const savedUser = await userRepository.save(user);

      const profile = new UserProfile();
      profile.user = savedUser;
      profile.riskLevel = RiskLevel.LOW;
      profile.creditScore = 750;
      profile.totalBorrowed = userData.role === UserRole.BORROWER ? 100000 : 0;
      profile.totalRepaid = userData.role === UserRole.BORROWER ? 60000 : 0;
      profile.outstandingBalance = userData.role === UserRole.BORROWER ? 40000 : 0;
      profile.totalInvested = userData.role === UserRole.LENDER ? 500000 : 0;
      profile.totalEarned = userData.role === UserRole.LENDER ? 75000 : 0;
      profile.employmentStatus = 'employed';
      profile.employerName = 'ABC Company';
      profile.jobTitle = 'Software Developer';
      profile.monthlyIncome = 50000;
      profile.yearsEmployed = 3;
      profile.language = 'en';
      profile.currency = 'ZAR';
      profile.notificationPreferences = { email: true, sms: true, push: true, marketing: true };
      profile.privacySettings = { profileVisibility: 'PUBLIC', activityVisibility: 'PUBLIC', searchVisibility: true };
      profile.securitySettings = { twoFactorEnabled: false, biometricEnabled: false, sessionTimeout: 30, loginAlerts: true, unusualActivityAlerts: true };

      await profileRepository.save(profile);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    } else {
      console.log(`⏭️  Skipped ${userData.email} (already exists)`);
    }
  }

  console.log('🎉 Database seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});