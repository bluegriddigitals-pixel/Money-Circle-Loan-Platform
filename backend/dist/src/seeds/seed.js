"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../modules/user/entities/user.entity");
const user_profile_entity_1 = require("../modules/user/entities/user-profile.entity");
const bcrypt = require("bcrypt");
async function seed() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'moneycircle',
        entities: [user_entity_1.User, user_profile_entity_1.UserProfile],
        synchronize: false,
    });
    await dataSource.initialize();
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const profileRepository = dataSource.getRepository(user_profile_entity_1.UserProfile);
    console.log('🌱 Seeding database...');
    const usersData = [
        {
            email: 'borrower@moneycircle.co.za',
            password: 'Password123!',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+27821234567',
            role: user_entity_1.UserRole.BORROWER,
            status: user_entity_1.AccountStatus.ACTIVE,
            kycStatus: user_entity_1.KycStatus.VERIFIED,
        },
        {
            email: 'lender@moneycircle.co.za',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNumber: '+27827654321',
            role: user_entity_1.UserRole.LENDER,
            status: user_entity_1.AccountStatus.ACTIVE,
            kycStatus: user_entity_1.KycStatus.VERIFIED,
        },
        {
            email: 'auditor@moneycircle.co.za',
            password: 'Password123!',
            firstName: 'Mike',
            lastName: 'Johnson',
            phoneNumber: '+27829876543',
            role: user_entity_1.UserRole.AUDITOR,
            status: user_entity_1.AccountStatus.ACTIVE,
            kycStatus: user_entity_1.KycStatus.VERIFIED,
        },
        {
            email: 'admin@moneycircle.co.za',
            password: 'Password123!',
            firstName: 'Sarah',
            lastName: 'Williams',
            phoneNumber: '+27823456789',
            role: user_entity_1.UserRole.SYSTEM_ADMIN,
            status: user_entity_1.AccountStatus.ACTIVE,
            kycStatus: user_entity_1.KycStatus.VERIFIED,
        },
    ];
    for (const userData of usersData) {
        const existingUser = await userRepository.findOne({
            where: { email: userData.email },
        });
        if (!existingUser) {
            const user = new user_entity_1.User();
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
            const profile = new user_profile_entity_1.UserProfile();
            profile.userId = user.id;
            profile.employmentStatus = 'employed';
            profile.employerName = 'ABC Company';
            profile.jobTitle = 'Software Developer';
            profile.monthlyIncome = 50000;
            profile.yearsEmployed = 3;
            profile.creditScore = 750;
            profile.riskLevel = user_profile_entity_1.RiskLevel.LOW;
            profile.riskScore = 20;
            profile.totalBorrowed = user.role === user_entity_1.UserRole.BORROWER ? 100000 : 0;
            profile.totalRepaid = user.role === user_entity_1.UserRole.BORROWER ? 60000 : 0;
            profile.totalInvested = user.role === user_entity_1.UserRole.LENDER ? 500000 : 0;
            profile.totalEarned = user.role === user_entity_1.UserRole.LENDER ? 75000 : 0;
            profile.outstandingBalance = user.role === user_entity_1.UserRole.BORROWER ? 40000 : 0;
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
//# sourceMappingURL=seed.js.map