# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 📋 **OVERVIEW**

Your system consists of 3 main components:
1. **API Server** - Handles invites, validation, results
2. **Game Platform** - Where candidates take assessments  
3. **HR Platform** - Where HR users manage projects and view results

## 🌐 **RECOMMENDED PRODUCTION ARCHITECTURE**

```
Production URLs:
├── 🏢 https://olivinhr.com (HR Platform)
├── 🎮 https://game.olivinhr.com (Game Platform) 
└── 🔧 https://api.olivinhr.com (API Server)
```

## 🔧 **STEP 1: PREPARE ENVIRONMENT VARIABLES**

### **Create Production .env Files**

**Root `.env` (for API):**
```bash
# Environment
NODE_ENV=production

# Firebase Admin SDK
FIREBASE_PROJECT_ID=corporategames-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@corporategames-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# SendGrid
SENDGRID_API_KEY=SG.your-production-sendgrid-key

# Production URLs
VITE_API_BASE_URL=https://api.olivinhr.com
VITE_HR_PLATFORM_URL=https://olivinhr.com
VITE_GAME_PLATFORM_URL=https://game.olivinhr.com
```

**apps/hr-platform/.env.local:**
```bash
# Firebase Client
VITE_FIREBASE_API_KEY=AIzaSyBRWXWYiaWor5WYnG2hqNkBAGuPiFZVUPY
VITE_FIREBASE_AUTH_DOMAIN=corporategames-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=corporategames-prod
VITE_FIREBASE_STORAGE_BUCKET=corporategames-prod.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=514309051810
VITE_FIREBASE_APP_ID=1:514309051810:web:c4b4c8b83ef4097d580efb

# API Configuration
VITE_API_BASE_URL=https://api.olivinhr.com

# OpenAI API Key
VITE_OPENAI_API_KEY=sk-your-production-openai-key
```

**apps/game-platform/.env.local:**
```bash
# Firebase Client (same as HR platform)
VITE_FIREBASE_API_KEY=AIzaSyBRWXWYiaWor5WYnG2hqNkBAGuPiFZVUPY
VITE_FIREBASE_AUTH_DOMAIN=corporategames-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=corporategames-prod
VITE_FIREBASE_STORAGE_BUCKET=corporategames-prod.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=514309051810
VITE_FIREBASE_APP_ID=1:514309051810:web:c4b4c8b83ef4097d580efb

# API Configuration
VITE_API_BASE_URL=https://api.olivinhr.com

# OpenAI API Key
VITE_OPENAI_API_KEY=sk-your-production-openai-key
```

## 🚀 **STEP 2: DEPLOY TO VERCEL**

### **2.1 Deploy API Server**
```bash
# From project root
vercel --prod

# Set environment variables in Vercel dashboard:
# - NODE_ENV=production
# - FIREBASE_PROJECT_ID=corporategames-prod
# - FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@...
# - FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
# - SENDGRID_API_KEY=SG.your-key
# - VITE_GAME_PLATFORM_URL=https://game.olivinhr.com
# - VITE_HR_PLATFORM_URL=https://olivinhr.com
```

### **2.2 Deploy HR Platform**
```bash
cd apps/hr-platform
vercel --prod

# Custom domain: olivinhr.com
# Environment variables in Vercel dashboard (from .env.local above)
```

### **2.3 Deploy Game Platform**
```bash
cd apps/game-platform
vercel --prod

# Custom domain: game.olivinhr.com
# Environment variables in Vercel dashboard (from .env.local above)
```

## 🌐 **STEP 3: CONFIGURE DOMAINS**

### **3.1 DNS Configuration**
```
A Record: olivinhr.com → Vercel IP
CNAME: game.olivinhr.com → cname.vercel-dns.com
CNAME: api.olivinhr.com → cname.vercel-dns.com
```

### **3.2 Vercel Domain Settings**
- **API Project**: Add domain `api.olivinhr.com`
- **HR Platform**: Add domain `olivinhr.com`  
- **Game Platform**: Add domain `game.olivinhr.com`

## ✅ **STEP 4: PRODUCTION VERIFICATION**

### **4.1 Test API Endpoints**
```bash
# Health check
curl https://api.olivinhr.com/api/health-check

# Validate invite (use a real token)
curl "https://api.olivinhr.com/api/validate-invite?token=YOUR_TOKEN"
```

### **4.2 Test Complete Flow**
1. **HR Login**: https://olivinhr.com/hr/login
2. **Create Project**: Select "Space Mission" game
3. **Send Invite**: Invite should use `https://game.olivinhr.com?token=...`
4. **Candidate Flow**: Token should work on game platform
5. **Results**: Should appear in HR dashboard

## 🔒 **STEP 5: SECURITY CONSIDERATIONS**

### **5.1 Environment Variables**
- ✅ All sensitive data in Vercel environment variables
- ✅ No hardcoded URLs (all use environment variables)
- ✅ API keys properly secured

### **5.2 CORS Configuration**
Your API already handles CORS properly for production domains.

### **5.3 Firebase Security Rules**
```javascript
// Ensure Firestore rules allow production domains
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Your existing rules here
  }
}
```

## 🔧 **STEP 6: MONITORING & TROUBLESHOOTING**

### **6.1 Vercel Function Logs**
- Check Vercel dashboard for API function logs
- Monitor error rates and performance

### **6.2 Common Issues & Solutions**

**Issue**: "Invalid Invitation" in production
**Solution**: Verify API_BASE_URL environment variables

**Issue**: CORS errors
**Solution**: Check API CORS headers include production domains

**Issue**: Firebase auth errors  
**Solution**: Verify Firebase private key format (with \n characters)

## 📊 **STEP 7: FINAL CHECKLIST**

Before going live:
- [ ] All environment variables set in Vercel
- [ ] Domains configured and SSL certificates active
- [ ] Test complete invite flow end-to-end
- [ ] Verify candidate results appear in HR dashboard
- [ ] Test with multiple game types
- [ ] Check email delivery (SendGrid production limits)
- [ ] Monitor API function performance
- [ ] Test on mobile devices

## 🆘 **EMERGENCY ROLLBACK**

If issues occur:
1. **Revert to staging**: Use staging subdomains
2. **Check logs**: Vercel dashboard → Functions → Logs
3. **Verify environment**: Compare staging vs production vars
4. **Test locally**: Reproduce issues in development

---

## 💡 **IMPORTANT NOTES**

1. **Token System**: Works identically in production - no changes needed
2. **URL Generation**: Automatically uses production URLs based on environment
3. **Database**: Same Firebase project, so all data is preserved
4. **Email Links**: Will automatically point to production game platform

Your local development setup will continue working unchanged! 🎉 