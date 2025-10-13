const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up TransactRead...');

try {
  console.log('Installing server dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

  console.log('Installing client dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, '../../client'), stdio: 'inherit' });

  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

  console.log('Running database migrations...');
  execSync('npx prisma db push', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

  console.log('Seeding database...');
  execSync('npm run seed', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

  console.log('Setup complete! Run "npm run dev" to start the development server.');
} catch (error) {
  console.error('Setup failed:', error.message);
  process.exit(1);
}
