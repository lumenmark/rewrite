# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Manifest V3 browser extension that rewrites selected text using AI. The extension provides an inline floating icon when users select text in editable fields, opens a popup UI with tone options (clarity, professional, friendly), and replaces text in-place.

**Key Features:**
- Works on Gmail, LinkedIn, Slack, Facebook Messenger, Jira, Confluence, and any editable field
- 15 free rewrites per month (stored in `chrome.storage.local`)
- Right-click context menu integration
- DOM-injected popup UI near text selection

## Project Structure

The project follows this structure (as defined in `docs/rewrite-extension-spec-extended.md`):

```
/src
  /background       - Service worker (context menus, API calls)
  /content          - Content script (selection detection, popup UI, text replacement)
  /options          - Options page
  /icons            - Extension icons (16, 32, 48, 128px)
  config.ts         - Configuration (API base URL, usage limits)
manifest.json       - Chrome extension manifest
```

## Build Commands

**Note:** Build system not yet implemented. Expected commands:
- `npm install` - Install dependencies
- `npm run build` - Build extension to `/dist` folder
- `npm run dev` - Development mode with watch
- `npm run lint` - Lint TypeScript/JavaScript files

Build output should go to `/dist` containing compiled JS, manifest, icons, and CSS.

## Architecture

### Three-Part Extension Architecture

1. **Background Service Worker** (`src/background/background.ts`)
   - Creates context menu ("Rewrite selection with AI")
   - Handles rewrite API requests to backend
   - Manages message passing between components

2. **Content Script** (`src/content/contentScript.ts`)
   - Listens for `selectionchange` events on editable elements
   - Shows/hides floating rewrite icon near selection
   - Injects and manages popup UI in page DOM
   - Handles text replacement for `<textarea>`, `<input>`, and contenteditable elements

3. **Popup UI** (`src/content/popup.ts`, `src/content/popup.css`)
   - DOM-injected interface (not browser action popup)
   - Shows original text, rewritten text, tone buttons, usage counter
   - Positioned near selection with auto-repositioning for viewport edges

### Text Replacement Logic

**For `<textarea>` and `<input>`:**
```ts
element.value = element.value.slice(0, selectionStart) +
                rewrittenText +
                element.value.slice(selectionEnd);
```

**For contenteditable:**
```ts
range.deleteContents();
range.insertNode(document.createTextNode(rewrittenText));
```

### Usage Tracking System

Store in `chrome.storage.local`:
- `usageMonthKey`: Current month (e.g., "2025-12")
- `rewritesUsedThisMonth`: Counter (0-15)

Reset counter when month changes. Block rewrites when ≥15 and show upgrade message.

## Backend API Integration

**Endpoint:** `POST /rewrite`

**Request:**
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

Configure `API_BASE_URL` in `src/config.ts`.

## Critical Implementation Details

### Manifest V3 Requirements
- Use service worker for background script (not persistent background page)
- Content scripts injected via `content_scripts` in manifest
- Requires permissions: `storage`, `activeTab`, `contextMenus`, `scripting`
- Host permissions: `https://*/*`, `http://*/*`

### Popup UI Positioning
- Must use high z-index (suggest `2147483647`) to appear above page content
- Position based on selection's bounding rect (`Range.getBoundingClientRect()`)
- Auto-reposition if near viewport edges

### Message Passing
Background ↔ Content Script communication:
- Content → Background: `chrome.runtime.sendMessage({ type: "REQUEST_REWRITE", text, mode })`
- Background → Content: `chrome.tabs.sendMessage(tabId, { type: "OPEN_REWRITE_POPUP", text })`

## Testing Priorities

Test text replacement on:
- Gmail compose (contenteditable)
- LinkedIn messaging (contenteditable)
- Slack Web
- Facebook Messenger
- Standard `<textarea>` elements

Edge cases:
- Selection at viewport boundaries
- Long selections (>1000 characters)
- Rapid consecutive rewrites
- Empty or whitespace-only selections

## Important Constraints

**Non-Goals (do not implement):**
- No user login/authentication
- No team admin panel
- No history view
- No translation or summarization features
- No mobile app or Windows native client

**Output Rules for Rewritten Text:**
- No meta commentary from AI
- Maintain original language
- Keep formatting simple
- Avoid adding new ideas beyond original intent
