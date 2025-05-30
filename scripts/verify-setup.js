#!/usr/bin/env node

/**
 * TOCdoc Setup Verification Script
 * Helps customers verify their installation is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TOCdoc Setup Verification\n');

let hasErrors = false;

// Check for required files
const requiredFiles = [
  '.env.local',
  'package.json',
  'prisma/schema.prisma'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
    hasErrors = true;
  }
});

// Check environment variables
if (fs.existsSync('.env.local')) {
  console.log('\n🔐 Checking environment variables...');
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'DATABASE_URL'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar) && !envContent.includes(`${envVar}=YOUR_`)) {
      console.log(`✅ ${envVar} configured`);
    } else if (envContent.includes(envVar)) {
      console.log(`⚠️  ${envVar} found but appears to have placeholder value`);
      hasErrors = true;
    } else {
      console.log(`❌ ${envVar} missing`);
      hasErrors = true;
    }
  });
}

// Check Node modules
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules directory found');
} else {
  console.log('❌ node_modules missing - run: npm install');
  hasErrors = true;
}

// Check Prisma client
if (fs.existsSync('node_modules/.prisma/client')) {
  console.log('✅ Prisma client generated');
} else {
  console.log('❌ Prisma client missing - run: npx prisma generate');
  hasErrors = true;
}

// Summary
console.log('\n📋 Setup Summary:');
if (hasErrors) {
  console.log('❌ Setup incomplete. Please address the issues above.');
  console.log('\n🔧 Quick fixes:');
  console.log('1. Copy env.example to .env.local and fill in your values');
  console.log('2. Run: npm run setup');
  console.log('3. Follow SETUP.md for detailed instructions');
  process.exit(1);
} else {
  console.log('✅ Setup looks good! You should be able to run: npm run dev');
  console.log('\n🚀 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Open http://localhost:3000 in your browser');
  console.log('3. Sign up for your first account');
  console.log('4. Select your role during onboarding');
}

console.log('\n📚 Documentation:');
console.log('- Setup guide: SETUP.md');
console.log('- Customer info: CUSTOMER_DELIVERY.md');
console.log('- Known issues: KNOWN_ISSUES.md'); 