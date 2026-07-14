# BNA Portal - Firebase Functions & Secret Management

## ⚠️ IMPORTANT: Never commit API keys to GitHub!

All API keys and Firebase config are stored as **Firebase Secret Manager secrets**.
They are NEVER hardcoded in the public repository.

## Setting Up Secrets (One-Time Setup)

After deploying to Firebase, run these commands **only once** from your local machine:

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Set the Groq API Key (for quiz generation)
```bash
firebase functions:secrets:set GROQ_API_KEY
```
When prompted, paste your Groq API key (the one provided by your school administrator).

### 4. Set the Firebase Client Config
```bash
firebase functions:secrets:set BNA_FIREBASE_CONFIG
```
When prompted, paste the Firebase client config JSON (all on one line). Get this from your Firebase project console under Project Settings > General > Your apps > Web app > Firebase SDK snippet.

### 5. Deploy Functions
```bash
firebase deploy --only functions
```

## How It Works

### Quiz Generation (Groq API)
- **Before**: The Gemini API key was hardcoded in `assets/js/app.js` → **DISABLED by Google**
- **After**: The frontend calls `generateQuizQuestions` Firebase Function
  - The function reads `GROQ_API_KEY` from Firebase Secret Manager
  - The key NEVER reaches the client browser
  - Questions are generated server-side and returned to the frontend

### Firebase Client Config
- **Before**: `apiKey`, `authDomain`, etc. were hardcoded in `assets/js/app.js` → **GETS FLAGGED**
- **After**: The frontend can optionally call `getFirebaseConfig` Firebase Function
  - The config JSON is stored in `BNA_FIREBASE_CONFIG` secret
  - Fallback: config can still be set via `window.__bnaFirebaseConfig` or localStorage

## Local Development

For local development, you can still set the Firebase config via:

1. **localStorage method** (in browser console):
   ```javascript
   localStorage.setItem('bna_custom_firebase_config', '{"apiKey":"...","appId":"...",...}')
   ```

2. **HTML script tag** (in index.html, for local only):
   ```html
   <script>
     window.__bnaFirebaseConfig = {"apiKey":"...","appId":"...",...};
   </script>
   ```
   **Remove this before deploying to production/github!**

## Files Modified for Security

| File | Change |
|------|--------|
| `functions/index.js` | Added `getFirebaseConfig` and `generateQuizQuestions` functions |
| `functions/package.json` | Added Firebase Functions dependencies |
| `assets/js/app.js` | Removed hardcoded Firebase config & Gemini API key |
| `assets/js/app.js` | Updated `fetchAIQuestions` to call Firebase Function |
| `.gitignore` | Added environment file patterns |
| `functions/README.md` | This file |