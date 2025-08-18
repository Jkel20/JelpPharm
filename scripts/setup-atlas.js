#!/usr/bin/env node

/**
 * MongoDB Atlas Setup Script
 * This script helps you configure MongoDB Atlas for JelpPharm PMS
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🏥 JelpPharm PMS - MongoDB Atlas Setup\n');
console.log('This script will help you configure MongoDB Atlas for your application.\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env.local already exists. This script will update the MongoDB URI.\n');
} else {
  console.log('📝 Creating new .env.local file...\n');
}

// Get MongoDB Atlas details
const questions = [
  {
    name: 'username',
    message: 'Enter your MongoDB Atlas username: ',
    validate: (input) => input.trim().length > 0 ? true : 'Username is required'
  },
  {
    name: 'password',
    message: 'Enter your MongoDB Atlas password: ',
    validate: (input) => input.trim().length > 0 ? true : 'Password is required'
  },
  {
    name: 'cluster',
    message: 'Enter your cluster name (e.g., cluster0.abc123): ',
    validate: (input) => input.trim().length > 0 ? true : 'Cluster name is required'
  }
];

let answers = {};

const askQuestion = (index) => {
  if (index >= questions.length) {
    generateEnvFile();
    return;
  }

  const question = questions[index];
  rl.question(question.message, (answer) => {
    const validation = question.validate(answer);
    if (validation === true) {
      answers[question.name] = answer.trim();
      askQuestion(index + 1);
    } else {
      console.log(`❌ ${validation}`);
      askQuestion(index);
    }
  });
};

const generateEnvFile = () => {
  const mongoUri = `mongodb+srv://elormjoseph610:ONge76FuEcyWHlun@jelppharm.gjn7akk.mongodb.net/jelp_pharm_pms?retryWrites=true&w=majority`;
  
  let envContent = '';
  
  if (envExists) {
    // Read existing file and update MongoDB URI
    envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /MONGODB_URI=.*/g,
      `MONGODB_URI=${mongoUri}`
    );
    envContent = envContent.replace(
      /MONGODB_URI_PROD=.*/g,
      `MONGODB_URI_PROD=${mongoUri}`
    );
  } else {
    // Create new .env.local file
    envContent = `# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000/api

# Database Configuration
MONGODB_URI=${mongoUri}
MONGODB_URI_PROD=${mongoUri}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@jelppharm.com

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_ATTEMPTS_LIMIT=5
LOGIN_LOCKOUT_DURATION_MS=900000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Ghana FDA Compliance
FDA_COMPLIANCE_ENABLED=true
PRESCRIPTION_RETENTION_YEARS=5
`;
  }

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Successfully configured MongoDB Atlas!');
    console.log(`📁 Environment file: ${envPath}`);
    console.log(`🔗 MongoDB URI: ${mongoUri.replace(answers.password, '***')}`);
    console.log('\n📋 Next steps:');
    console.log('1. Update other environment variables as needed');
    console.log('2. Run: npm run dev');
    console.log('3. Your app will connect to MongoDB Atlas automatically');
  } catch (error) {
    console.error('\n❌ Error writing environment file:', error.message);
  }

  rl.close();
};

// Start the setup process
askQuestion(0);

rl.on('close', () => {
  console.log('\n👋 Setup complete! Happy coding!');
  process.exit(0);
});
