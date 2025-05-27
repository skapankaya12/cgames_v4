# 🚀 Free AI API Setup Guide for Personalized Recommendations

This guide will help you get free API keys for AI-powered personalized recommendations in your behavioral analytics service.

## 🎯 Recommended Option: AI/ML API (aimlapi.com)

### Why AI/ML API?
- ✅ **200+ AI models** including ChatGPT, Claude, Gemini, Llama
- ✅ **Generous free tier** with high usage limits
- ✅ **Easy integration** - already configured in your code
- ✅ **Multiple model fallback** - if one fails, tries another
- ✅ **No credit card required** for free tier

### Step-by-Step Setup:

1. **Visit AI/ML API Website**
   ```
   https://aimlapi.com/
   ```

2. **Sign Up for Free Account**
   - Click "Sign Up" or "Get API Key"
   - Use your email to create account
   - Verify your email address

3. **Get Your API Key**
   - Go to your dashboard
   - Find "API Keys" section
   - Copy your free API key

4. **Add to Your Project**
   
   **Option A: Environment Variable (Recommended)**
   ```bash
   # Create .env file in your project root
   echo "AIML_API_KEY=your_actual_api_key_here" >> .env
   ```
   
   **Option B: Direct Replacement**
   ```typescript
   // In src/services/BehavioralAnalyticsService.ts
   this.aiApiKey = 'your_actual_api_key_here';
   ```

5. **Test Your Setup**
   ```bash
   npm run dev
   # Complete a quiz and check if AI recommendations work
   ```

## 🔄 Alternative Free APIs

### 1. Google AI Studio (Gemini)
```
Website: https://aistudio.google.com/
Free Tier: Generous limits for Gemini models
Setup: Get API key → Update aiApiUrl to Google's endpoint
```

### 2. Hugging Face Inference API
```
Website: https://huggingface.co/inference-api
Free Tier: Rate-limited but free
Setup: Get token → Use HF inference endpoints
```

### 3. Anthropic Claude (Limited Free)
```
Website: https://console.anthropic.com/
Free Tier: $5 credit for new users
Setup: Get API key → Update to Claude endpoints
```

## 🛠️ Configuration Examples

### For Google AI Studio (Gemini):
```typescript
// Update in BehavioralAnalyticsService.ts
this.aiApiKey = 'your_google_ai_studio_key';
this.aiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
```

### For Hugging Face:
```typescript
// Update in BehavioralAnalyticsService.ts
this.aiApiKey = 'your_huggingface_token';
this.aiApiUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
```

## 🔧 Environment Variables Setup

Create a `.env` file in your project root:

```env
# AI/ML API (Recommended)
AIML_API_KEY=your_aiml_api_key_here

# Alternative APIs (choose one)
GOOGLE_AI_KEY=your_google_ai_key_here
HUGGINGFACE_TOKEN=your_hf_token_here
ANTHROPIC_API_KEY=your_claude_key_here
```

## 🚨 Troubleshooting

### Common Issues:

1. **"API request failed: 401"**
   - Check if your API key is correct
   - Ensure no extra spaces in the key
   - Verify the key hasn't expired

2. **"API request failed: 429"**
   - You've hit rate limits
   - The service will automatically try other models
   - Wait a few minutes and try again

3. **"All AI models failed"**
   - Check your internet connection
   - Verify API key is valid
   - The system will fall back to simulated recommendations

### Debug Mode:
```typescript
// Enable detailed logging
console.log('API Key:', this.aiApiKey.substring(0, 10) + '...');
console.log('API URL:', this.aiApiUrl);
```

## 📊 Usage Limits & Costs

| Provider | Free Tier | Rate Limits | Upgrade Cost |
|----------|-----------|-------------|--------------|
| AI/ML API | Very generous | High | $0.50/1M tokens |
| Google AI Studio | 15 requests/min | 1500 requests/day | Pay-per-use |
| Hugging Face | 1000 requests/month | 10 requests/min | $9/month |
| Anthropic Claude | $5 credit | Standard | $0.25/1M tokens |

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. ✅ Console logs showing successful AI model usage
2. ✅ Personalized recommendations with AI-generated content
3. ✅ No fallback to simulated recommendations
4. ✅ Faster, more relevant recommendation generation

## 🔗 Useful Links

- [AI/ML API Documentation](https://docs.aimlapi.com/)
- [Google AI Studio Guide](https://ai.google.dev/tutorials/get_started_web)
- [Hugging Face API Docs](https://huggingface.co/docs/api-inference/index)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

## 💡 Pro Tips

1. **Start with AI/ML API** - it's the easiest and most generous
2. **Use environment variables** - keeps your keys secure
3. **Monitor usage** - check your API dashboard regularly
4. **Test thoroughly** - complete a few quizzes to ensure everything works
5. **Keep backups** - the system gracefully falls back if APIs fail

---

**Need help?** Check the console logs for detailed error messages and debugging information. 