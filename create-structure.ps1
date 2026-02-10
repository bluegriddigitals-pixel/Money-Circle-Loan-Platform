# MoneyCircle Project Structure Creator - Creates EMPTY Files
# Run this in PowerShell from your target directory

$ErrorActionPreference = "Stop"
$rootDir = "MoneyCircle"

# Create main directories
$directories = @(
    # Backend structure
    "backend\src\modules\user\dto",
    "backend\src\modules\user\interfaces",
    "backend\src\modules\auth",
    "backend\src\modules\loan\dto",
    "backend\src\modules\loan\enums",
    "backend\src\modules\marketplace",
    "backend\src\modules\payment",
    "backend\src\modules\risk",
    "backend\src\modules\audit",
    "backend\src\modules\compliance",
    "backend\src\modules\notification",
    "backend\src\modules\admin",
    "backend\src\shared\database",
    "backend\src\shared\guards",
    "backend\src\shared\interceptors",
    "backend\src\shared\filters",
    "backend\src\shared\pipes",
    "backend\src\shared\decorators",
    "backend\src\shared\constants",
    "backend\src\shared\utils",
    "backend\src\config",
    "backend\test",
    "backend\migrations",
    
    # Frontend structure
    "frontend\app\auth\login",
    "frontend\app\auth\register",
    "frontend\app\auth\verify",
    "frontend\app\borrower\dashboard",
    "frontend\app\borrower\apply",
    "frontend\app\borrower\loans",
    "frontend\app\borrower\payments",
    "frontend\app\borrower\profile",
    "frontend\app\lender\dashboard",
    "frontend\app\lender\marketplace",
    "frontend\app\lender\portfolio",
    "frontend\app\lender\withdrawals",
    "frontend\app\auditor\dashboard",
    "frontend\app\auditor\applications",
    "frontend\app\auditor\compliance",
    "frontend\app\admin\transaction\dashboard",
    "frontend\app\admin\transaction\disbursements",
    "frontend\app\admin\transaction\withdrawals",
    "frontend\app\admin\system\dashboard",
    "frontend\app\admin\system\users",
    "frontend\app\admin\system\settings",
    "frontend\app\api\webhooks\payment",
    "frontend\components\ui",
    "frontend\components\layout",
    "frontend\components\forms",
    "frontend\components\charts",
    "frontend\components\shared",
    "frontend\lib\api",
    "frontend\lib\utils",
    "frontend\lib\hooks",
    "frontend\lib\store",
    "frontend\lib\constants",
    "frontend\public\images",
    "frontend\public\fonts",
    "frontend\public\documents",
    "frontend\styles",
    
    # Infrastructure
    "infrastructure\aws\ecs",
    "infrastructure\aws\rds",
    "infrastructure\aws\s3",
    "infrastructure\aws\vpc",
    "infrastructure\aws\cloudfront",
    "infrastructure\docker\nginx",
    "infrastructure\docker\redis",
    "infrastructure\scripts",
    "infrastructure\monitoring\prometheus",
    "infrastructure\monitoring\grafana",
    "infrastructure\monitoring\alerts",
    
    # Documentation
    "documentation\api",
    "documentation\legal",
    "documentation\compliance",
    "documentation\operational",
    
    # Scripts
    "scripts",
    
    # GitHub
    ".github\workflows"
)

# List of ALL files to create (EMPTY)
$files = @(
    # Backend files
    "backend\package.json",
    "backend\package-lock.json",
    "backend\tsconfig.json",
    "backend\.env",
    "backend\.env.example",
    "backend\.gitignore",
    "backend\.eslintrc.js",
    "backend\.prettierrc",
    "backend\nest-cli.json",
    "backend\docker-compose.yml",
    "backend\Dockerfile",
    
    # Backend source files
    "backend\src\main.ts",
    "backend\src\app.module.ts",
    
    # User module files
    "backend\src\modules\user\user.module.ts",
    "backend\src\modules\user\user.service.ts",
    "backend\src\modules\user\user.controller.ts",
    "backend\src\modules\user\user.entity.ts",
    "backend\src\modules\user\dto\create-user.dto.ts",
    "backend\src\modules\user\dto\update-user.dto.ts",
    "backend\src\modules\user\dto\login.dto.ts",
    "backend\src\modules\user\interfaces\user.interface.ts",
    
    # Auth module files
    "backend\src\modules\auth\auth.module.ts",
    "backend\src\modules\auth\auth.service.ts",
    "backend\src\modules\auth\auth.controller.ts",
    "backend\src\modules\auth\jwt.strategy.ts",
    "backend\src\modules\auth\jwt-auth.guard.ts",
    "backend\src\modules\auth\roles.guard.ts",
    
    # Loan module files
    "backend\src\modules\loan\loan.module.ts",
    "backend\src\modules\loan\loan.service.ts",
    "backend\src\modules\loan\loan.controller.ts",
    "backend\src\modules\loan\loan.entity.ts",
    "backend\src\modules\loan\dto\create-loan.dto.ts",
    "backend\src\modules\loan\dto\update-loan.dto.ts",
    "backend\src\modules\loan\dto\loan-application.dto.ts",
    "backend\src\modules\loan\enums\loan-status.enum.ts",
    
    # Marketplace files
    "backend\src\modules\marketplace\marketplace.module.ts",
    "backend\src\modules\marketplace\marketplace.service.ts",
    "backend\src\modules\marketplace\marketplace.controller.ts",
    "backend\src\modules\marketplace\listing.entity.ts",
    "backend\src\modules\marketplace\investment.entity.ts",
    
    # Payment module files
    "backend\src\modules\payment\payment.module.ts",
    "backend\src\modules\payment\payment.service.ts",
    "backend\src\modules\payment\payment.controller.ts",
    "backend\src\modules\payment\transaction.entity.ts",
    "backend\src\modules\payment\escrow.entity.ts",
    "backend\src\modules\payment\payment-processor.service.ts",
    
    # Risk module files
    "backend\src\modules\risk\risk.module.ts",
    "backend\src\modules\risk\risk.service.ts",
    "backend\src\modules\risk\risk.controller.ts",
    "backend\src\modules\risk\risk-assessment.entity.ts",
    "backend\src\modules\risk\credit-scoring.service.ts",
    
    # Audit module files
    "backend\src\modules\audit\audit.module.ts",
    "backend\src\modules\audit\audit.service.ts",
    "backend\src\modules\audit\audit.controller.ts",
    "backend\src\modules\audit\audit-log.entity.ts",
    
    # Compliance module files
    "backend\src\modules\compliance\compliance.module.ts",
    "backend\src\modules\compliance\compliance.service.ts",
    "backend\src\modules\compliance\compliance.controller.ts",
    "backend\src\modules\compliance\kyc.entity.ts",
    
    # Notification module files
    "backend\src\modules\notification\notification.module.ts",
    "backend\src\modules\notification\notification.service.ts",
    "backend\src\modules\notification\notification.controller.ts",
    "backend\src\modules\notification\notification.entity.ts",
    
    # Admin module files
    "backend\src\modules\admin\admin.module.ts",
    "backend\src\modules\admin\admin.service.ts",
    "backend\src\modules\admin\admin.controller.ts",
    "backend\src\modules\admin\system-config.entity.ts",
    
    # Shared files
    "backend\src\shared\database\database.module.ts",
    "backend\src\shared\guards\throttle.guard.ts",
    "backend\src\shared\interceptors\transform.interceptor.ts",
    "backend\src\shared\interceptors\logging.interceptor.ts",
    "backend\src\shared\filters\http-exception.filter.ts",
    "backend\src\shared\pipes\validation.pipe.ts",
    "backend\src\shared\decorators\roles.decorator.ts",
    "backend\src\shared\decorators\api-response.decorator.ts",
    "backend\src\shared\constants\roles.constants.ts",
    "backend\src\shared\utils\encryption.util.ts",
    "backend\src\shared\utils\date.util.ts",
    "backend\src\shared\utils\validation.util.ts",
    
    # Config files
    "backend\src\config\configuration.ts",
    "backend\src\config\database.config.ts",
    "backend\src\config\jwt.config.ts",
    "backend\src\config\payment.config.ts",
    
    # Test files
    "backend\test\app.e2e-spec.ts",
    "backend\test\jest-e2e.json",
    
    # Migration files
    "backend\migrations\001-initial-schema.sql",
    
    # Frontend files
    "frontend\package.json",
    "frontend\package-lock.json",
    "frontend\tsconfig.json",
    "frontend\next.config.js",
    "frontend\tailwind.config.js",
    "frontend\postcss.config.js",
    "frontend\.env.local",
    "frontend\.env.example",
    "frontend\.gitignore",
    "frontend\Dockerfile",
    
    # Frontend app files
    "frontend\app\layout.tsx",
    "frontend\app\page.tsx",
    "frontend\app\globals.css",
    
    # Auth pages
    "frontend\app\auth\login\page.tsx",
    "frontend\app\auth\register\page.tsx",
    "frontend\app\auth\verify\page.tsx",
    
    # Borrower pages
    "frontend\app\borrower\dashboard\page.tsx",
    "frontend\app\borrower\apply\page.tsx",
    "frontend\app\borrower\loans\page.tsx",
    "frontend\app\borrower\payments\page.tsx",
    "frontend\app\borrower\profile\page.tsx",
    
    # Lender pages
    "frontend\app\lender\dashboard\page.tsx",
    "frontend\app\lender\marketplace\page.tsx",
    "frontend\app\lender\portfolio\page.tsx",
    "frontend\app\lender\withdrawals\page.tsx",
    
    # Auditor pages
    "frontend\app\auditor\dashboard\page.tsx",
    "frontend\app\auditor\applications\page.tsx",
    "frontend\app\auditor\compliance\page.tsx",
    
    # Admin pages
    "frontend\app\admin\transaction\dashboard\page.tsx",
    "frontend\app\admin\transaction\disbursements\page.tsx",
    "frontend\app\admin\transaction\withdrawals\page.tsx",
    "frontend\app\admin\system\dashboard\page.tsx",
    "frontend\app\admin\system\users\page.tsx",
    "frontend\app\admin\system\settings\page.tsx",
    
    # API routes
    "frontend\app\api\webhooks\payment\route.ts",
    
    # UI components
    "frontend\components\ui\button.tsx",
    "frontend\components\ui\input.tsx",
    "frontend\components\ui\card.tsx",
    "frontend\components\ui\table.tsx",
    "frontend\components\ui\modal.tsx",
    "frontend\components\ui\alert.tsx",
    "frontend\components\ui\badge.tsx",
    "frontend\components\ui\progress.tsx",
    "frontend\components\ui\toast.tsx",
    
    # Layout components
    "frontend\components\layout\header.tsx",
    "frontend\components\layout\sidebar.tsx",
    "frontend\components\layout\footer.tsx",
    "frontend\components\layout\dashboard-layout.tsx",
    
    # Form components
    "frontend\components\forms\loan-application-form.tsx",
    "frontend\components\forms\kyc-form.tsx",
    "frontend\components\forms\investment-form.tsx",
    "frontend\components\forms\withdrawal-form.tsx",
    
    # Chart components
    "frontend\components\charts\portfolio-chart.tsx",
    "frontend\components\charts\performance-chart.tsx",
    "frontend\components\charts\risk-chart.tsx",
    
    # Shared components
    "frontend\components\shared\document-upload.tsx",
    "frontend\components\shared\payment-schedule.tsx",
    "frontend\components\shared\loan-card.tsx",
    "frontend\components\shared\investment-card.tsx",
    
    # Lib files
    "frontend\lib\api\client.ts",
    "frontend\lib\api\auth.ts",
    "frontend\lib\api\loans.ts",
    "frontend\lib\api\payments.ts",
    "frontend\lib\api\marketplace.ts",
    
    # Utils files
    "frontend\lib\utils\format.ts",
    "frontend\lib\utils\validation.ts",
    "frontend\lib\utils\security.ts",
    "frontend\lib\utils\calculations.ts",
    
    # Hooks files
    "frontend\lib\hooks\use-auth.ts",
    "frontend\lib\hooks\use-loans.ts",
    "frontend\lib\hooks\use-payments.ts",
    "frontend\lib\hooks\use-portfolio.ts",
    
    # Store files
    "frontend\lib\store\auth.store.ts",
    "frontend\lib\store\user.store.ts",
    "frontend\lib\store\ui.store.ts",
    
    # Constants files
    "frontend\lib\constants\routes.ts",
    "frontend\lib\constants\roles.ts",
    "frontend\lib\constants\loan-terms.ts",
    
    # Public files
    "frontend\public\images\logo.svg",
    "frontend\public\images\favicon.ico",
    "frontend\public\documents\terms-of-service.pdf",
    "frontend\public\documents\privacy-policy.pdf",
    "frontend\public\documents\loan-agreement.pdf",
    
    # Styles files
    "frontend\styles\custom.css",
    
    # Infrastructure files
    "infrastructure\aws\ecs\task-definition.json",
    "infrastructure\aws\ecs\service-definition.json",
    "infrastructure\aws\rds\database.yaml",
    "infrastructure\aws\s3\bucket-policy.json",
    "infrastructure\aws\vpc\network.yaml",
    "infrastructure\aws\cloudfront\distribution.yaml",
    "infrastructure\docker\nginx\nginx.conf",
    "infrastructure\docker\redis\redis.conf",
    "infrastructure\scripts\deploy.sh",
    "infrastructure\scripts\backup.sh",
    "infrastructure\scripts\migrate.sh",
    "infrastructure\monitoring\prometheus\prometheus.yml",
    "infrastructure\monitoring\grafana\dashboard.json",
    "infrastructure\monitoring\alerts\rules.yaml",
    
    # Documentation files
    "documentation\api\swagger.yaml",
    "documentation\api\postman-collection.json",
    "documentation\api\api-reference.md",
    "documentation\legal\terms-of-service.md",
    "documentation\legal\privacy-policy.md",
    "documentation\legal\loan-agreement.md",
    "documentation\legal\kyc-policy.md",
    "documentation\compliance\fica-compliance.md",
    "documentation\compliance\nca-compliance.md",
    "documentation\compliance\popia-compliance.md",
    "documentation\compliance\aml-procedures.md",
    "documentation\operational\deployment-guide.md",
    "documentation\operational\troubleshooting.md",
    "documentation\operational\user-manual.md",
    
    # Script files
    "scripts\seed-database.js",
    "scripts\backup-database.js",
    "scripts\generate-reports.js",
    
    # GitHub files
    ".github\workflows\ci-cd.yml",
    ".github\workflows\security-scan.yml",
    ".github\workflows\deploy-production.yml",
    ".github\dependabot.yml",
    ".github\SECURITY.md",
    
    # Root files
    "README.md"
)

Write-Host "Creating MoneyCircle Project Structure..." -ForegroundColor Green
Write-Host "This will create $($directories.Count) directories and $($files.Count) empty files" -ForegroundColor Yellow

# Create directories
Write-Host "`nCreating directories..." -ForegroundColor Cyan
$dirCount = 0
foreach ($dir in $directories) {
    $fullPath = Join-Path $rootDir $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        $dirCount++
    }
}
Write-Host "Created $dirCount directories" -ForegroundColor Green

# Create empty files
Write-Host "`nCreating empty files..." -ForegroundColor Cyan
$fileCount = 0
foreach ($file in $files) {
    $fullPath = Join-Path $rootDir $file
    if (-not (Test-Path $fullPath)) {
        # Create parent directory if it doesn't exist
        $parentDir = Split-Path $fullPath -Parent
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }
        
        # Create empty file
        New-Item -ItemType File -Path $fullPath -Force | Out-Null
        $fileCount++
        
        # Show progress for every 10 files
        if ($fileCount % 10 -eq 0) {
            Write-Host "  Created $fileCount files..." -ForegroundColor Gray
        }
    }
}

Write-Host "`n✅ COMPLETED!" -ForegroundColor Green
Write-Host "📁 Directories created: $dirCount" -ForegroundColor Cyan
Write-Host "📄 Empty files created: $fileCount" -ForegroundColor Cyan
Write-Host "`nLocation: $(Resolve-Path $rootDir)" -ForegroundColor Yellow