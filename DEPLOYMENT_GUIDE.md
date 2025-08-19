# 🚀 JelpPharm Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `production.env` to `.env` and fill in your values
- [ ] Set up MongoDB Atlas production cluster
- [ ] Configure email service (Gmail, SendGrid, etc.)
- [ ] Generate secure JWT secret

### 2. Build the Project
```bash
# Install dependencies
npm install

# Build both server and client
npm run build

# Verify build output
ls dist/
ls client/build/
```

### 3. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (M0 Free tier works for small projects)
3. Set up database access user
4. Configure network access (allow your deployment platform's IP)
5. Get connection string and update `.env`

### 4. Environment Variables to Update
```bash
# Required - Update these values
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jelp_pharm_pms
JWT_SECRET=your-very-long-random-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CORS_ORIGIN=https://your-domain.com
```

## 🌐 Deployment Platforms

### Option 1: Heroku (Recommended for beginners)
```bash
# Install Heroku CLI
# Create new app
heroku create jelp-pharm-pms

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

### Option 2: Vercel (Great for React apps)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Option 3: Railway
1. Connect GitHub repository
2. Set environment variables
3. Automatic deployment

### Option 4: DigitalOcean App Platform
1. Connect GitHub repository
2. Configure environment variables
3. Deploy with one click

## 🔧 Post-Deployment Steps

### 1. Test Your Application
- [ ] Health check endpoint: `https://your-domain.com/health`
- [ ] API endpoints: `https://your-domain.com/api/auth/login`
- [ ] Frontend: `https://your-domain.com`

### 2. Set Up Custom Domain (Optional)
- Configure DNS records
- Set up SSL certificate (automatic on most platforms)
- Update CORS origins

### 3. Monitoring & Logs
- Set up logging service (Winston logs to files)
- Monitor application performance
- Set up error tracking (Sentry, LogRocket)

## 🚨 Security Checklist

- [ ] JWT_SECRET is long and random
- [ ] MongoDB connection uses SSL
- [ ] CORS origins are restricted to your domain
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active
- [ ] Environment variables are not exposed in client code

## 📱 Frontend Deployment

The React app builds to `client/build/` directory. Most platforms will automatically serve this.

### Manual Build Verification
```bash
cd client
npm run build
# Check that build/ directory contains index.html and static files
```

## 🔍 Troubleshooting

### Common Issues:
1. **Build fails**: Check TypeScript errors, missing dependencies
2. **Database connection fails**: Verify MongoDB URI and network access
3. **CORS errors**: Check CORS_ORIGIN in environment variables
4. **JWT errors**: Verify JWT_SECRET is set correctly

### Debug Commands:
```bash
# Check server logs
npm run dev:server

# Check client build
cd client && npm run build

# Test production build locally
npm run build
npm start
```

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Test locally with production environment
4. Check MongoDB Atlas connection status

---

**Happy Deploying! 🎉**
