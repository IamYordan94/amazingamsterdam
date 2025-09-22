#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Location Gaming Platform for deployment...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local template...');
  const envTemplate = `# Environment Variables for Local Development
# Copy these to Vercel environment variables for production

# OpenAI API Key for AI-generated challenges
OPENAI_API_KEY=your_openai_api_key_here

# Mapbox Access Token for enhanced maps (optional)
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# Database: SQLite (automatically created)
# No database setup required!

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Photo Storage Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local template');
} else {
  console.log('✅ .env.local already exists');
}

// Check if git is initialized
const gitPath = path.join(process.cwd(), '.git');
if (!fs.existsSync(gitPath)) {
  console.log('\n📦 Git repository not initialized.');
  console.log('Run the following commands to set up git:');
  console.log('  git init');
  console.log('  git add .');
  console.log('  git commit -m "Initial commit: Location Gaming Platform"');
} else {
  console.log('✅ Git repository initialized');
}

console.log('\n🎯 Next steps for deployment:');
console.log('1. Set up your GitHub repository');
console.log('2. Push your code to GitHub');
console.log('3. Connect to Vercel');
console.log('4. Add environment variables in Vercel dashboard');
console.log('5. Deploy!');
console.log('\n📖 See DEPLOYMENT.md for detailed instructions');

console.log('\n🔑 Required environment variables for Vercel:');
console.log('- OPENAI_API_KEY (required)');
console.log('- NEXTAUTH_URL (auto-set by Vercel)');
console.log('- NEXTAUTH_SECRET (generate a random string)');
console.log('- MAPBOX_ACCESS_TOKEN (optional)');
console.log('');
console.log('💾 Database: SQLite (automatically created, no setup needed!)');

console.log('\n✨ Setup complete! Your project is ready for deployment.');
