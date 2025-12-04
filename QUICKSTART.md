# Quick Start Guide - Rewrite Chrome Extension

Get the extension running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Chrome or Edge browser
- Terminal/command line access

## Step 1: Install Dependencies (2 minutes)

```bash
# Install backend dependencies
cd backend
npm install

# Install extension dependencies
cd ../extension
npm install
```

## Step 2: Start Backend Server (30 seconds)

```bash
cd backend
npm start
```

You should see:
```
🚀 Test backend server running on http://localhost:3000
📝 POST /rewrite endpoint ready for testing
```

**Keep this terminal window open!**

## Step 3: Build Extension (30 seconds)

Open a **new terminal** and run:

```bash
cd extension
npm run build
```

You should see:
```
✓ built in 240ms
✓ Build completed successfully! Extension is ready in dist/
```

## Step 4: Load Extension in Chrome (1 minute)

1. Open Chrome browser
2. Navigate to `chrome://extensions`
3. Toggle "Developer mode" ON (top right corner)
4. Click "Load unpacked" button
5. Navigate to and select `/rewrite/extension/dist` folder
6. Click "Select Folder"

You should now see "Rewrite with AI" in your extensions list!

## Step 5: Test It! (1 minute)

### Quick Test on Any Website

1. Visit any website with a text input (try https://gmail.com or just use the address bar test below)

2. **Easy Test Method** - Use Chrome's omnibox:
   - Type some text in Chrome's address bar
   - Select the text you typed (Ctrl+A or Cmd+A)
   - Look for the floating ✨ icon
   - Click it!

3. **Better Test** - Try on Gmail:
   - Go to Gmail and click "Compose"
   - Type: "hey can u send me that file"
   - Select all the text
   - Click the floating ✨ icon
   - Choose "Professional" tone
   - Click "Accept"
   - Watch your text transform!

### What You Should See

1. **Floating Icon**: ✨ appears when you select text in editable fields
2. **Popup**: Opens when you click the icon
3. **Original Text**: Shows your selected text
4. **Tone Buttons**: Three options (🎯 Clarity, 💼 Professional, 😊 Friendly)
5. **Loading State**: "Rewriting..." appears
6. **Result**: Rewritten text displays
7. **Accept Button**: Replaces your original text

## Troubleshooting

### Extension not loading?
- Make sure you selected the `/extension/dist` folder, not `/extension`
- Check Chrome console for errors (right-click extension → Inspect)

### Floating icon not appearing?
- Make sure you're selecting text in an **editable** field (textarea, input, or contenteditable)
- Try refreshing the page after loading the extension

### "Failed to rewrite" error?
- Make sure the backend server is running (`npm start` in `/backend`)
- Check backend terminal for errors
- Verify backend is running on `http://localhost:3000`

### Backend not starting?
- Make sure port 3000 is not in use
- Check you ran `npm install` in the backend folder

## Testing Recommendations

### Best Sites to Test On

1. **Gmail** (https://mail.google.com)
   - Click "Compose"
   - Type a casual message
   - Select text and rewrite as Professional

2. **LinkedIn** (https://linkedin.com)
   - Go to Messages
   - Start a new message
   - Test Friendly tone

3. **Reddit** (https://reddit.com)
   - Go to any post
   - Click "Add a comment"
   - Test Clarity tone

4. **Simple Test Page**
   - Create a simple HTML file:
   ```html
   <!DOCTYPE html>
   <html>
   <body>
     <textarea rows="10" cols="50">Type something here and select it!</textarea>
   </body>
   </html>
   ```

### Usage Tracking Test

1. Click the extension icon in Chrome toolbar
2. Go to "Options" (or right-click → Options)
3. See your usage stats: "0/15 rewrites this month"
4. After rewriting, refresh the options page
5. Counter should increment: "1/15 rewrites this month"

## Next Steps

### Replace Mock Backend with Real AI

1. Sign up for an AI API (OpenAI, Anthropic, etc.)
2. Edit `/backend/server.js`
3. Replace `mockRewrite()` function with real AI calls
4. See `/backend/README.md` for example implementation

### Customize the Extension

- **Change API URL**: Edit `/extension/src/config.ts` → `API_BASE_URL`
- **Change Usage Limit**: Edit `/extension/src/config.ts` → `MAX_REWRITES_PER_MONTH`
- **Modify Tones**: Edit tone prompts in backend
- **Style Popup**: Edit `/extension/src/content/popup.css`

### Deploy to Production

See `/extension/README.md` and `IMPLEMENTATION_SUMMARY.md` for deployment guides.

## Need Help?

- **Extension Issues**: See `/extension/README.md`
- **Backend Issues**: See `/backend/README.md`
- **Architecture**: See `/CLAUDE.md`
- **Full Details**: See `/IMPLEMENTATION_SUMMARY.md`

---

**That's it!** You should now have a working AI text rewriter in your browser. 🎉

**Pro Tip**: Press Escape to close the popup without making changes.
