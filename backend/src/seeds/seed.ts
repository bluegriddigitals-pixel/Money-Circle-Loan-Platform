import { DataSource } from 'typeorm';
import { User, UserRole, AccountStatus, KycStatus } from '../modules/user/entities/user.entity';
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

  const userRepository = dataSource.getRepository(User);
  const profileRepository = dataSource.getRepository(UserProfile);

  console.log('🌱 Seeding database...');

  // Create test users
  const usersData = [
    {
      email: 'borrower@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+27821234567',
      role: UserRole.BORROWER,
      status: AccountStatus.ACTIVE,
      kycStatus: KycStatus.VERIFIED,
    },
    {
      email: 'lender@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+27827654321',
      role: UserRole.LENDER,
      status: AccountStatus.ACTIVE,
      kycStatus: KycStatus.VERIFIED,
    },
    {
      email: 'auditor@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Mike',
      lastName: 'Johnson',
      phoneNumber: '+27829876543',
      role: UserRole.AUDITOR,
      status: AccountStatus.ACTIVE,
      kycStatus: KycStatus.VERIFIED,
    },
    {
      email: 'admin@moneycircle.co.za',
      password: 'Password123!',
      firstName: 'Sarah',
      lastName: 'Williams',
      phoneNumber: '+27823456789',
      role: UserRole.SYSTEM_ADMIN,
      status: AccountStatus.ACTIVE,
      kycStatus: KycStatus.VERIFIED,
    },
  ];

  for (const userData of usersData) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      // Create user
      const user = new User();
      user.email = userData.email;
      user.passwordHash = await bcrypt.hash(userData.password, 10);
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.phoneNumber = userData.phoneNumber;
      user.role = userData.role;
      user.status = userData.status;
      user.kycStatus = userData.kycStatus;
      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      user.country = 'South Africa';

      await userRepository.save(user);

      // Create profile
      const profile = new UserProfile();
      profile.userId = user.id;
      profile.employmentStatus = 'employed';
      profile.employerName = 'ABC Company';
      profile.jobTitle = 'Software Developer';
      profile.monthlyIncome = 50000;
      profile.yearsEmployed = 3;
      profile.creditScore = 750;
      profile.riskLevel = RiskLevel.LOW;
      profile.riskScore = 20;
      profile.totalBorrowed = user.role === UserRole.BORROWER ? 100000 : 0;
      profile.totalRepaid = user.role === UserRole.BORROWER ? 60000 : 0;
      profile.totalInvested = user.role === UserRole.LENDER ? 500000 : 0;
      profile.totalEarned = user.role === UserRole.LENDER ? 75000 : 0;
      profile.outstandingBalance = user.role === UserRole.BORROWER ? 40000 : 0;
      profile.language = 'en';
      profile.currency = 'ZAR';
      profile.notificationPreferences = { email: true, sms: false, push: true };

      await profileRepository.save(profile);

      console.log(`✅ Created ${user.role}: ${user.email}`);
    }
  }

  console.log('🎉 Database seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});