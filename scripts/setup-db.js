#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Tenchi S&OP Database Setup\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please create one based on .env.example');
  process.exit(1);
}

// Check if DATABASE_URL is set
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('DATABASE_URL=')) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

console.log('✅ Environment file found\n');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');

  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Run migrations
  console.log('🗄️  Running database migrations...');
  try {
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  } catch (e) {
    // Migration might already exist
    console.log('⚠️  Migration may already exist, continuing...');
  }
  console.log('✅ Database migrations completed\n');

  // Seed the database
  console.log('🌱 Seeding database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('✅ Database seeded\n');

  console.log('🎉 Setup complete! You can now run:');
  console.log('   npm run dev');
  console.log('\n📊 Default login:');
  console.log('   Email: admin@tenchi.com');
  console.log('   Password: admin123');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
