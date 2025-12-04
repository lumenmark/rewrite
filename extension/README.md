# Rewrite with AI - Chrome Extension

A Chrome Manifest V3 extension that rewrites selected text using AI with multiple tone options (clarity, professional, friendly).

## Features

- 🎯 **Three Tone Options**: Clarity, Professional, and Friendly
- ✨ **Inline UI**: Floating icon appears when you select text
- 🔄 **Smart Text Replacement**: Works with textarea, input, and contenteditable elements
- 📊 **Usage Tracking**: 15 free rewrites per month (resets monthly)
- 🌐 **Works Everywhere**: Gmail, LinkedIn, Slack, Facebook Messenger, Reddit, Twitter, and more
- ⌨️ **Right-click Menu**: Quick access via context menu

## Installation

### Option 1: Load Unpacked Extension (Development)

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the `/extension/dist` folder

6. The extension should now appear in your extensions list

### Option 2: Chrome Web Store (Production)

Coming soon!

## Setup Backend API

The extension requires a backend API endpoint at `http://localhost:3000/rewrite` (or update `src/config.ts` with your API URL).

### Backend API Requirements

**Endpoint:** `POST /rewrite`

**Request Body:**
```json
{
  "text": "Hello Jon, attach the doc.",
  "mode": "clarity" | "professional" | "friendly"
}
```

**Response:**
```json
{
  "rewrittenText": "Hello Jon, I'm sharing the document you requested."
}
```

### Mode Prompts

The backend should use these prompts for each mode:

- **clarity**: "Rewrite the text to make it clearer and easier to understand. Preserve meaning."
- **professional**: "Rewrite the text in a polished, professional tone suitable for workplace communication."
- **friendly**: "Rewrite the text in a warm, friendly, conversational tone."

## Usage

### Method 1: Floating Icon

1. Select any text in an editable field (textarea, input, or contenteditable)
2. A floating ✨ icon will appear near your selection
3. Click the icon to open the rewrite popup
4. Choose a tone (Clarity, Professional, or Friendly)
5. Review the rewritten text
6. Click "Accept" to replace your original text

### Method 2: Context Menu

1. Select any text in an editable field
2. Right-click and select "Rewrite selection with AI"
3. The popup will open automatically
4. Follow steps 4-6 above

## Development

### Project Structure

```
/extension
  /src
    /background       - Background service worker
      background.ts   - Context menu, API calls, usage tracking
    /content          - Content scripts
      contentScript.ts - Selection detection, floating icon, text replacement
      popup.ts        - Popup UI logic
      popup.css       - Popup styling
    /options          - Options page
      options.html    - Options page HTML
      options.ts      - Options page logic
    config.ts         - Shared configuration and types
  /public
    /icons            - Extension icons (16, 32, 48, 128px)
  manifest.json       - Chrome extension manifest
  vite.config.ts      - Build configuration
  package.json        - Dependencies and scripts
```

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode (watch for changes)
npm run dev

# Lint code
npm run lint
```

### Testing Checklist

**Basic Functionality:**
- [ ] Extension loads without errors in Chrome
- [ ] Right-click menu appears on text selection
- [ ] Floating icon appears when selecting text in editable fields
- [ ] Popup opens on icon click
- [ ] Popup positioned correctly (not off-screen)

**API Integration:**
- [ ] Tone button triggers API request
- [ ] Loading state displays during request
- [ ] Rewritten text appears on success
- [ ] Error message shows on API failure

**Text Replacement:**
- [ ] Replace text in `<textarea>` - cursor positioned correctly
- [ ] Replace text in `<input type="text">` - cursor positioned correctly
- [ ] Replace text in Gmail compose (contenteditable)
- [ ] Replace text in LinkedIn messages (contenteditable)
- [ ] React/Vue frameworks detect change via input events

**Edge Cases:**
- [ ] Popup at bottom-right viewport edge repositions correctly
- [ ] Long selections (>1000 chars) handled properly
- [ ] Empty selection - no icon shown
- [ ] 15th rewrite increments counter correctly
- [ ] 16th rewrite attempt shows error message
- [ ] Month change resets counter to 0

**Real-World Testing Sites:**
1. Gmail - compose new email
2. LinkedIn - send message
3. Facebook Messenger
4. Slack Web
5. Reddit comment box
6. Twitter/X

## Configuration

Update `src/config.ts` to change:

- `API_BASE_URL`: Backend API endpoint (default: `http://localhost:3000`)
- `MAX_REWRITES_PER_MONTH`: Monthly usage limit (default: 15)
- `POPUP_Z_INDEX`: Z-index for popup (default: 2147483647)

## Packaging for Chrome Web Store

1. Build the production version:
   ```bash
   npm run build
   ```

2. Create a ZIP file of the dist folder:
   ```bash
   cd dist
   zip -r ../rewrite-extension-v0.1.0.zip *
   ```

3. Upload to Chrome Web Store Developer Dashboard

4. Provide screenshots:
   - Floating icon visible on text selection
   - Popup UI with tone buttons
   - Before/after rewrite example

5. Permissions justification:
   > We need script and activeTab permissions to detect text selections and show the rewrite popup. We do not collect or store user data; all rewriting is done via a single API request.

## Known Limitations

- Requires active backend API endpoint
- 15 rewrites per month limit (MVP)
- No history or undo functionality (MVP)
- No custom tone options (MVP)
- SVG icons used instead of PNG (should be converted for production)

## Future Enhancements

- Custom tone definitions
- Rewrite intensity slider
- Keyboard shortcut (Ctrl+Shift+R)
- Rewrite history
- Multi-language support
- Analytics dashboard

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
