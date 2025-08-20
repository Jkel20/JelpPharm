# 🆕 New Deployment Environment Configuration Template

## 📋 **For Your New Render Deployment**

Since you're doing a **new deployment**, you'll need to update these environment variables with your **new service URLs**.

## 🔧 **Files to Update**

### **1. Server `.env` (Root Directory)**
```bash
# Production Environment Configuration
NODE_ENV=production
PORT=5000
API_URL=https://YOUR-NEW-SERVER-SERVICE.onrender.com/api

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://Elorm:Kwabena_23@jelppharmarcy.cvb0ysk.mongodb.net/jelp_pharm_pms?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=jelppharm-super-secret-key-2025-change-this-immediately
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=kwabenacomics@gmail.com
EMAIL_PASS=comicskwabena610
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

# Production CORS Origins (UPDATE WITH YOUR NEW SERVICE URL)
CORS_ORIGIN=https://YOUR-NEW-SERVER-SERVICE.onrender.com
```

### **2. Client `.env` (Client Directory)**
```bash
# Client Environment Configuration
REACT_APP_API_URL=https://YOUR-NEW-SERVER-SERVICE.onrender.com/api
REACT_APP_SERVER_URL=https://YOUR-NEW-SERVER-SERVICE.onrender.com
```

## 🎯 **What You Need to Replace**

Replace `YOUR-NEW-SERVER-SERVICE` with your **actual new Render service name**:

- **Example**: If your new service is called `jelppharm-v2-server`
- **Update to**: `https://jelppharm-v2-server.onrender.com`

## 📝 **Step-by-Step Process**

### **Step 1: Create New Render Services**
1. Create **new server service** in Render
2. Create **new client service** in Render
3. Note down the **service URLs**

### **Step 2: Update Environment Files**
1. **Manually edit** `.env` file in root directory
2. **Manually edit** `client/.env` file
3. Replace all instances of `jelppharm-5vcm.onrender.com` with your new service URL

### **Step 3: Rebuild Client**
```bash
cd client
npm run build
```

### **Step 4: Commit and Deploy**
```bash
git add .
git commit -m "Update for new deployment with new service URLs"
git push origin main
```

## 🚨 **Important Notes**

1. **Don't use old URLs** - They won't work with new services
2. **Update both files** - Server and client need matching URLs
3. **Rebuild client** - New build files must use new URLs
4. **Test locally first** - Make sure everything works before deploying

## 🔍 **Verification**

After updating, verify:
- ✅ `.env` files have new service URLs
- ✅ Client rebuilds successfully
- ✅ No hardcoded old URLs remain
- ✅ Git shows changes ready to commit

## 📞 **Need Help?**

If you need assistance updating the files or have questions about the new deployment process, let me know!

---

**Status**: Ready for new deployment configuration  
**Last Updated**: August 20, 2025
