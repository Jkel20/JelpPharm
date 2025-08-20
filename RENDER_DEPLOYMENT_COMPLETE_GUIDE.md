# 🚀 Complete Render Deployment Guide for JelpPharm

## 📋 **What This Guide Covers**

This guide will help you deploy your JelpPharm Pharmacy Management System as a **single web service** on Render that serves both your Node.js API and React frontend.

## 🎯 **Deployment Strategy**

- **Single Service**: One Render web service that handles both backend API and frontend
- **Monorepo Approach**: Server serves the built React app as static files
- **Automatic Builds**: Render automatically builds and deploys on every git push

## 🔧 **Step 1: Prepare Your Project**

### **1.1 Verify Build Commands**
Your project is already configured with the correct build commands:
- **Server Build**: `npm run build:server` (TypeScript compilation)
- **Client Build**: `npm run build:client` (React production build)
- **Combined Build**: `npm run build` (both server and client)

### **1.2 Check File Structure**
Ensure your project has:
- ✅ `src/server/` - Backend source code
- ✅ `client/` - React frontend
- ✅ `package.json` - Root package with all dependencies
- ✅ `tsconfig.server.json` - Server TypeScript config
- ✅ `render.yaml` - Render deployment config (created)

## 🌐 **Step 2: Create Render Account & Service**

### **2.1 Sign Up for Render**
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email address

### **2.2 Connect Your Repository**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Jkel20/JelpPharm`
3. Select the repository and main branch

### **2.3 Configure Your Service**
Use these exact settings:

**Basic Settings:**
- **Name**: `jelppharm-pms` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (root of repo)

**Build & Deploy:**
- **Build Command**: `npm ci && npm run build:server && npm run build:client`
- **Start Command**: `npm start`
- **Auto-Deploy**: ✅ Enabled

## 🔐 **Step 3: Set Environment Variables**

### **3.1 Required Environment Variables**
Set these in your Render dashboard:

**Database Configuration:**
```
MONGODB_URI=mongodb+srv://Elorm:Kwabena_23@jelppharmarcy.cvb0ysk.mongodb.net/jelp_pharm_pms?retryWrites=true&w=majority
```

**JWT Security:**
```
JWT_SECRET=jelppharm-super-secret-key-2025-change-this-immediately
```

**Email Configuration:**
```
EMAIL_USER=kwabenacomics@gmail.com
EMAIL_PASS=comicskwabena610
```

**API Configuration:**
```
API_URL=https://jelppharm-pms.onrender.com/api
CORS_ORIGIN=https://jelppharm-pms.onrender.com
```

### **3.2 Optional Environment Variables**
These are already set in `render.yaml` but you can customize:
```
NODE_ENV=production
PORT=5000
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_ATTEMPTS_LIMIT=5
LOGIN_LOCKOUT_DURATION_MS=900000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
LOG_LEVEL=info
FDA_COMPLIANCE_ENABLED=true
PRESCRIPTION_RETENTION_YEARS=5
```

## 🚀 **Step 4: Deploy**

### **4.1 Initial Deployment**
1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your server and client
   - Start the service

### **4.2 Monitor Build Process**
Watch the build logs for:
- ✅ Dependencies installed
- ✅ Server TypeScript compilation
- ✅ React production build
- ✅ Service started successfully

## 🔍 **Step 5: Verify Deployment**

### **5.1 Health Check**
Visit: `https://jelppharm-pms.onrender.com/health`
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-XX...",
  "uptime": 123.45,
  "environment": "production"
}
```

### **5.2 Frontend Access**
Visit: `https://jelppharm-pms.onrender.com`
Should show your React app

### **5.3 API Endpoints**
Test: `https://jelppharm-pms.onrender.com/api/auth/login`

## 📝 **Step 6: Update Client Configuration**

### **6.1 Update API URLs**
After deployment, update your client environment:

**Create `client/.env.production`:**
```bash
REACT_APP_API_URL=https://jelppharm-pms.onrender.com/api
REACT_APP_SERVER_URL=https://jelppharm-pms.onrender.com
```

### **6.2 Rebuild and Deploy**
```bash
cd client
npm run build
cd ..
git add .
git commit -m "Update client for production deployment"
git push origin main
```

## 🔄 **Step 7: Continuous Deployment**

### **7.1 Automatic Updates**
- Every push to `main` branch triggers automatic rebuild
- Render detects changes and redeploys
- No manual intervention needed

### **7.2 Manual Deployments**
If needed, you can manually trigger deployments from the Render dashboard

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. Build Fails**
- Check build logs for TypeScript errors
- Verify all dependencies are in `package.json`
- Ensure `tsconfig.server.json` is correct

**2. Service Won't Start**
- Check start command: `npm start`
- Verify `dist/server/index.js` exists after build
- Check environment variables are set

**3. Frontend Not Loading**
- Verify React build completed successfully
- Check `client/build/` directory exists
- Ensure static file serving is configured

**4. Database Connection Issues**
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Ensure database user has correct permissions

### **Debug Commands:**
```bash
# Check server build
npm run build:server

# Check client build
cd client && npm run build

# Test production build locally
npm run build
npm start
```

## 📊 **Monitoring & Maintenance**

### **8.1 Render Dashboard Features**
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response time
- **Deployments**: Build and deployment history
- **Environment**: Variable management

### **8.2 Health Monitoring**
- Set up uptime monitoring
- Monitor API response times
- Track error rates and logs

## 🎉 **Success!**

Your JelpPharm application is now deployed as a web service on Render with:
- ✅ Full-stack application (Node.js + React)
- ✅ Automatic deployments on git push
- ✅ Production-ready environment
- ✅ Scalable infrastructure
- ✅ SSL certificates (automatic)
- ✅ Global CDN

## 🔗 **Useful Links**

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

---

**Need Help?** Check the build logs in Render dashboard or refer to this guide!
