# JelpPharm Pharmacy Management System (PMS)

A comprehensive, web-based pharmacy management system designed specifically for pharmacies in Ghana, featuring inventory management, sales tracking, prescription handling, and compliance with Ghana FDA requirements.

## 🏥 System Overview

JelpPharm PMS is a full-stack web application that streamlines pharmacy operations through automation and digital management. The system supports multiple user roles, multi-store management, and provides comprehensive reporting capabilities while ensuring compliance with pharmaceutical regulations.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Multi-role Access Control**: Administrator, Pharmacist, Cashier, Store Manager
- **Secure JWT Authentication**: Token-based security with refresh capabilities
- **Account Security**: Brute-force protection, account lockout, password policies
- **Password Management**: Secure reset via email, account recovery

### 📦 Inventory Management
- **Drug Catalog**: Comprehensive drug information with Ghana FDA compliance
- **Stock Tracking**: Real-time inventory levels, batch management, expiry tracking
- **Reorder Management**: Automated low-stock alerts and reorder suggestions
- **Supplier Management**: Vendor tracking and purchase order management

### 💰 Sales & Transactions
- **Point of Sale**: Streamlined checkout process with receipt generation
- **Payment Processing**: Multiple payment method support
- **Sales Analytics**: Revenue tracking, trend analysis, performance metrics
- **Customer Management**: Patient records and purchase history

### 📋 Prescription Management
- **Digital Prescriptions**: Electronic prescription creation and management
- **Patient Records**: Comprehensive patient information and medical history
- **Compliance Tracking**: Ghana FDA prescription retention requirements
- **Drug Interaction Checks**: Safety validation and contraindication alerts

### 📊 Reporting & Analytics
- **Financial Reports**: Sales, revenue, profit margin analysis
- **Inventory Reports**: Stock levels, expiry alerts, movement tracking
- **Operational Reports**: Staff performance, store efficiency metrics
- **Regulatory Reports**: Ghana FDA compliance documentation

### 🏪 Multi-Store Management
- **Store Operations**: Individual store management and monitoring
- **Centralized Control**: Multi-location oversight and coordination
- **Store-specific Access**: Role-based store access control
- **Performance Comparison**: Cross-store analytics and benchmarking

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
- **Runtime**: Node.js with TypeScript compilation
- **Framework**: Express.js with middleware architecture
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Express-validator with custom validation rules
- **Logging**: Winston for structured logging
- **Email**: Nodemailer for automated notifications

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand for global state
- **Data Fetching**: React Query for server state management
- **Routing**: React Router DOM for navigation
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom pharmacy theme
- **UI Components**: Custom component library with Lucide icons

### Security Features
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Comprehensive request validation and sanitization
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: HTTP security headers and protection
- **Error Handling**: Centralized error management without information leakage

## 🚀 Quick Start

### 🗄️ MongoDB Atlas Setup Guide

Before starting the application, you'll need to set up a MongoDB Atlas database:

#### Step 1: Create MongoDB Atlas Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose the "Free" tier (M0) - perfect for development

#### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

#### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

#### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add only your server's IP address
5. Click "Confirm"

#### Step 5: Get Your Connection String
1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<cluster>` with your actual values

**Example connection string:**
```
mongodb+srv://johndoe:mypassword123@cluster0.abc123.mongodb.net/jelp_pharm_pms?retryWrites=true&w=majority
```

### Prerequisites
- **Node.js**: Version 18 or higher
- **MongoDB Atlas**: Cloud-hosted MongoDB database (free tier available)
- **npm** or **yarn**: Package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jelp-pharm-pms.git
   cd jelp-pharm-pms
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd src/server
   npm install
   
   # Install client dependencies
   cd ../../client
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp env.example .env.local
   
   # Edit environment variables
   nano .env.local
   ```

4. **MongoDB Atlas Setup**
   
   **Option A: Use Free Tier (Recommended for Development)**
   
   a. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
   b. Create a new cluster (choose the FREE tier)
   c. Set up database access:
      - Create a database user with read/write permissions
      - Remember username and password
   d. Set up network access:
      - Add your IP address or use `0.0.0.0/0` for development (allows all IPs)
   e. Get your connection string:
      - Click "Connect" on your cluster
      - Choose "Connect your application"
      - Copy the connection string
   
   **Option B: Use Existing Atlas Cluster**
   
   If you already have a MongoDB Atlas cluster, just get your connection string from the cluster dashboard.

5. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or start separately:
   # Backend: npm run dev:server
   # Frontend: npm run dev:client
   ```

### 🚀 Quick Setup with Atlas Script

For the easiest setup experience, use our automated MongoDB Atlas configuration script:

```bash
# Run the Atlas setup script
npm run setup-atlas

# Follow the prompts to enter your Atlas credentials
# The script will automatically create/update your .env.local file
```

### Environment Variables

Create a `.env.local` file with the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000/api

# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/jelp_pharm_pms?retryWrites=true&w=majority
MONGODB_URI_PROD=mongodb+srv://<cluster>.mongodb.net/jelp_pharm_pms?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
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

# Ghana FDA Compliance
FDA_COMPLIANCE_ENABLED=true
PRESCRIPTION_RETENTION_YEARS=5
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+233201234567",
  "password": "SecurePass123!",
  "role": "Pharmacist",
  "storeId": "store_id_here"
}
```

#### POST `/api/auth/login`
Authenticate user and receive access token
```json
{
  "identifier": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/forgot-password`
Request password reset email
```json
{
  "email": "john@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password using reset token
```json
{
  "token": "reset_token_here",
  "password": "NewSecurePass123!"
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

#### GET `/api/auth/me`
Get current user profile

#### POST `/api/auth/logout`
Logout user (invalidate token)

### User Management

#### GET `/api/users`
Get all users (Admin only)

#### POST `/api/users`
Create new user (Admin only)

#### PUT `/api/users/:id`
Update user information

#### DELETE `/api/users/:id`
Delete user (Admin only)

### Inventory Management

#### GET `/api/drugs`
Get all drugs with filtering and pagination

#### POST `/api/drugs`
Add new drug to catalog

#### GET `/api/inventory`
Get inventory levels across stores

#### POST `/api/inventory/adjust`
Adjust stock levels

### Sales & Transactions

#### POST `/api/sales`
Create new sale transaction

#### GET `/api/sales`
Get sales history with filtering

#### GET `/api/sales/reports`
Get sales analytics and reports

## 🎨 UI Components

### Available Components
- **Button**: Multiple variants (primary, secondary, outline, danger)
- **Input**: Form inputs with validation states
- **Modal**: Overlay dialogs for forms and confirmations
- **Table**: Data tables with sorting and pagination
- **Card**: Content containers with headers and actions
- **Alert**: Notification components for success, warning, and error states

### Custom Theme
The system uses a custom Tailwind CSS theme with pharmacy-specific colors:
- **Primary**: Blue tones for main actions
- **Pharmacy**: Custom blue palette for branding
- **Success**: Green for positive actions
- **Warning**: Yellow for caution states
- **Danger**: Red for destructive actions

## 🔒 Security & Compliance

### Ghana FDA Compliance
- **Prescription Retention**: 5-year retention as per regulations
- **Controlled Substances**: Special handling and tracking
- **Drug Information**: Comprehensive safety and interaction data
- **Audit Trails**: Complete transaction and modification logging

### Data Protection
- **Encryption**: Passwords hashed with bcrypt
- **Access Control**: Role-based permissions and store isolation
- **Audit Logging**: Comprehensive activity tracking
- **Data Backup**: Automated backup and recovery procedures

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
```

### Frontend Testing
```bash
# Run component tests
npm run test:components

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Build
```bash
# Build both server and client
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t jelp-pharm-pms .

# Run container
docker run -p 5000:5000 -p 3000:3000 jelp-pharm-pms
```

### Environment Considerations
- **Database**: Use production MongoDB instance
- **Email**: Configure production SMTP settings
- **Security**: Update JWT secrets and security settings
- **Monitoring**: Implement logging and monitoring solutions
- **Backup**: Set up automated database backups

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Reference**: Comprehensive endpoint documentation
- **User Guide**: Step-by-step system usage instructions
- **Admin Guide**: System administration and configuration
- **Developer Guide**: Code architecture and contribution guidelines

### Contact Information
- **Technical Support**: tech-support@jelppharm.com
- **Feature Requests**: features@jelppharm.com
- **Bug Reports**: bugs@jelppharm.com

### Community
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community support and Q&A
- **Wiki**: Additional documentation and guides

## 🛠️ Troubleshooting

### Common MongoDB Atlas Issues

#### Connection Timeout
- **Problem**: Connection takes too long or fails
- **Solution**: Check your IP address is whitelisted in Atlas Network Access
- **Solution**: Verify username/password are correct
- **Solution**: Ensure cluster is running (not paused)

#### Authentication Failed
- **Problem**: "Authentication failed" error
- **Solution**: Verify database user has correct permissions
- **Solution**: Check username/password in connection string
- **Solution**: Ensure user is not locked

#### Network Access Issues
- **Problem**: "Network access denied" error
- **Solution**: Add your IP to Atlas Network Access whitelist
- **Solution**: For development, use `0.0.0.0/0` (allows all IPs)
- **Solution**: For production, add only your server's IP

#### Cluster Not Found
- **Problem**: "Cluster not found" error
- **Solution**: Verify cluster name in connection string
- **Solution**: Check if cluster is paused (free tier pauses after inactivity)
- **Solution**: Ensure cluster is in the correct project

### Getting Help

If you encounter issues:
1. Check the [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/)
2. Verify your connection string format
3. Test connection with MongoDB Compass
4. Check Atlas cluster status and logs

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core authentication and user management
- ✅ Basic inventory management
- ✅ Sales transaction processing
- ✅ Prescription management
- ✅ Basic reporting

### Phase 2 (Next)
- 🔄 Advanced analytics and dashboards
- 🔄 Mobile application development
- 🔄 Integration with Ghana FDA systems
- 🔄 Advanced inventory optimization
- 🔄 Customer relationship management

### Phase 3 (Future)
- 📋 AI-powered drug interaction checking
- 📋 Predictive inventory management
- 📋 Advanced compliance monitoring
- 📋 Multi-language support
- 📋 Advanced security features

## 🙏 Acknowledgments

- **Ghana FDA**: Regulatory compliance guidance
- **Pharmacy Community**: Feature requirements and feedback
- **Open Source Contributors**: Libraries and tools used
- **Development Team**: System architecture and implementation

---

**JelpPharm PMS** - Empowering pharmacies in Ghana with modern, compliant, and efficient management solutions.

*Built with ❤️ for the Ghana pharmaceutical community*
