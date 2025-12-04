# Rewrite - AI-Powered Text Rewriting System

A monorepo containing a Chrome browser extension and backend API for AI-powered text rewriting with multiple tone options.

## Project Structure

```
/rewrite
  /extension          - Chrome Manifest V3 browser extension
  /backend            - Backend API server (Node.js/Express)
  CLAUDE.md           - Project documentation
  README.md           - This file
```

## Features

- ✨ **Chrome Extension**: Inline text rewriting with floating UI
- 🎯 **Three Tones**: Clarity, Professional, Friendly
- 🔄 **Smart Replacement**: Works with textarea, input, and contenteditable
- 📊 **Usage Tracking**: 15 free rewrites per month
- 🌐 **Universal**: Gmail, LinkedIn, Slack, Messenger, and more

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend API will run on `http://localhost:3000`.

### 2. Extension Setup

```bash
cd extension
npm install
npm run build
```

Then:
1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `/extension/dist` folder

### 3. Test the Extension

1. Navigate to any website with text input (e.g., Gmail, LinkedIn)
2. Select some text in an editable field
3. Click the floating ✨ icon that appears
4. Choose a tone and click Accept

## Documentation

- **Extension**: See [extension/README.md](extension/README.md)
- **Backend**: See [backend/README.md](backend/README.md)
- **Architecture**: See [CLAUDE.md](CLAUDE.md)

## Development

### Extension

```bash
cd extension
npm run dev      # Development mode
npm run build    # Production build
npm run lint     # Lint code
```

### Backend

```bash
cd backend
npm start        # Start server
```

## Architecture

### Extension Components

1. **Background Service Worker** - Context menu, API calls, usage tracking
2. **Content Script** - Selection detection, floating icon, text replacement
3. **Popup UI** - Rewrite interface with tone selection
4. **Options Page** - Usage statistics and settings

### Backend API

- **Endpoint**: `POST /rewrite`
- **Input**: `{ text: string, mode: 'clarity' | 'professional' | 'friendly' }`
- **Output**: `{ rewrittenText: string }`

## Browser Support

- Chrome (Manifest V3)
- Edge (Chromium-based)

## Supported Platforms

The extension works on:
- Gmail
- LinkedIn
- Slack
- Facebook Messenger
- Twitter/X
- Reddit
- Jira
- Confluence
- Any website with textarea, input, or contenteditable elements

## Testing

See [extension/README.md](extension/README.md) for a comprehensive testing checklist.

## Production Deployment

### Backend

For production, replace the mock `mockRewrite()` function in `backend/server.js` with actual AI API calls (OpenAI, Anthropic, etc.).

### Extension

1. Build production version: `cd extension && npm run build`
2. Create ZIP: `cd dist && zip -r ../rewrite-extension.zip *`
3. Upload to Chrome Web Store

## Contributing

This is a private project. See CLAUDE.md for development guidelines.

## License

MIT

## Git Workflow

**Important**: Per CLAUDE.md git rules:
- Only commit when explicitly requested
- No AI/Claude references in commit messages
- Keep commit messages professional and focused on changes
