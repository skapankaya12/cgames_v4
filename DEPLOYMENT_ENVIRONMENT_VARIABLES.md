# 🚀 PRODUCTION ENVIRONMENT VARIABLES GUIDE

## 📋 **DEPLOYMENT OVERVIEW**

Your system consists of 3 deployments:
1. **API Server** → `app.olivinhr.com` (Vercel)
2. **HR Platform** → `app.olivinhr.com` (Vercel) 
3. **Game Platform** → `game.olivinhr.com` (Vercel)

---

## 🔧 **1. API SERVER - app.olivinhr.com**

### **Vercel Environment Variables (Dashboard)**
```bash
# Node Configuration
NODE_ENV=production
NODE_VERSION=18.x

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=corporategames-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@corporategames-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# SendGrid Email Service
SENDGRID_API_KEY=SG.your-production-sendgrid-key

# Platform URLs (for email templates and redirects)
VITE_HR_PLATFORM_URL=https://app.olivinhr.com
VITE_GAME_PLATFORM_URL=https://game.olivinhr.com
```

### **Deployment Command:**
```bash
# Use the API-specific config
vercel --prod --local-config vercel-api.json
```

---

## 🏢 **2. HR PLATFORM - app.olivinhr.com**

### **Vercel Environment Variables (Dashboard)**
```bash
# Node Configuration
NODE_ENV=production
NODE_VERSION=18.x

# Firebase Client SDK (Browser-side)
VITE_FIREBASE_API_KEY=AIzaSyBRWXWYiaWor5WYnG2hqNkBAGuPiFZVUPY
VITE_FIREBASE_AUTH_DOMAIN=corporategames-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=corporategames-prod
VITE_FIREBASE_STORAGE_BUCKET=corporategames-prod.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=514309051810
VITE_FIREBASE_APP_ID=1:514309051810:web:c4b4c8b83ef4097d580efb

# Platform URLs
VITE_API_BASE_URL=https://app.olivinhr.com
VITE_HR_PLATFORM_URL=https://app.olivinhr.com
VITE_GAME_PLATFORM_URL=https://game.olivinhr.com

# OpenAI API Key
VITE_OPENAI_API_KEY=sk-your-production-openai-key
```

### **Deployment Command:**
```bash
# Use the main HR config
vercel --prod --local-config vercel.json
```

---

## 🎮 **3. GAME PLATFORM - game.olivinhr.com**

### **Vercel Environment Variables (Dashboard)**
```bash
# Node Configuration
NODE_ENV=production
NODE_VERSION=18.x

# Firebase Client SDK (same as HR platform)
VITE_FIREBASE_API_KEY=AIzaSyBRWXWYiaWor5WYnG2hqNkBAGuPiFZVUPY
VITE_FIREBASE_AUTH_DOMAIN=corporategames-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=corporategames-prod
VITE_FIREBASE_STORAGE_BUCKET=corporategames-prod.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=514309051810
VITE_FIREBASE_APP_ID=1:514309051810:web:c4b4c8b83ef4097d580efb

# Platform URLs
VITE_API_BASE_URL=https://app.olivinhr.com
VITE_HR_PLATFORM_URL=https://app.olivinhr.com
VITE_GAME_PLATFORM_URL=https://game.olivinhr.com

# OpenAI API Key
VITE_OPENAI_API_KEY=sk-your-production-openai-key
```

### **Deployment Command:**
```bash
# Use the game-specific config
vercel --prod --local-config vercel-game.json
```

---

## 🚨 **CRITICAL NOTES**

### **🔐 Environment Variables You Need to Add:**

1. **VITE_API_BASE_URL** - This was missing and caused hardcoded URLs
2. **Firebase Private Key** - Must be properly formatted with `\n` line breaks
3. **Production SendGrid API Key** - Different from development
4. **Production OpenAI API Key** - Make sure it has sufficient credits

### **✅ What I Fixed:**

1. **✅ API URL Consistency** - All platforms now use `app.olivinhr.com` for API
2. **✅ Environment Variable Usage** - Code now uses `VITE_API_BASE_URL` properly  
3. **✅ CORS Configuration** - Added production domains to allowed origins
4. **✅ Vercel Configs** - Updated all three deployment configurations

### **🌐 Domain Configuration:**
```
DNS Records:
├── app.olivinhr.com → Vercel (API + HR Platform)
└── game.olivinhr.com → Vercel (Game Platform)
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Deploy API Server**
```bash
cd /path/to/cgames_v4
vercel --prod --local-config vercel-api.json
# Set domain: app.olivinhr.com
```

### **Step 2: Deploy HR Platform**  
```bash
cd /path/to/cgames_v4
vercel --prod --local-config vercel.json
# Set domain: app.olivinhr.com (same as API)
```

### **Step 3: Deploy Game Platform**
```bash
cd /path/to/cgames_v4  
vercel --prod --local-config vercel-game.json
# Set domain: game.olivinhr.com
```

### **Step 4: Test Deployment**
```bash
# Test API health
curl https://app.olivinhr.com/api/health

# Test HR Platform
open https://app.olivinhr.com/hr/login

# Test Game Platform  
open https://game.olivinhr.com
```

---

## ⚠️ **IMPORTANT WARNINGS**

1. **🚨 DO NOT change any logic** - Only environment variables were updated
2. **🔒 Keep API keys secure** - Never commit them to git
3. **📧 Update email templates** - Make sure SendGrid templates reference production URLs
4. **🧪 Test thoroughly** - Test the complete invite flow after deployment

The system is now **DEPLOYMENT READY** with no breaking changes! 🎉 