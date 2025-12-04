# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow Rules

**CRITICAL - MUST FOLLOW:**
1. **NEVER commit without explicit user command** - Only create commits when the user explicitly asks you to commit or check in code
2. **NO AI/Claude references in commit messages** - Commit messages must NOT include:
   - References to Claude, AI, or being AI-generated
   - "🤖 Generated with Claude Code" footer
   - "Co-Authored-By: Claude" attribution
   - Any mention of AI assistance
3. Keep commit messages professional and focused on the actual changes made

## Project Overview

This is a monorepo for an AI-powered text rewriting system consisting of:
1. **Chrome Browser Extension** (`/extension`) - Manifest V3 extension that provides inline text rewriting in web applications
2. **Backend API** (`/backend`) - API server that handles rewrite requests using AI

The extension rewrites selected text using AI with multiple tone options (clarity, professional, friendly). It works on Gmail, LinkedIn, Slack, Facebook Messenger, Jira, Confluence, and any editable field.

## Monorepo Structure

```
/rewrite
  /extension          - Chrome Manifest V3 browser extension
    /src
      /background     - Service worker (context menus, API calls)
      /content        - Content scripts (selection detection, popup UI, text replacement)
      /options        - Options page
      /icons          - Extension icons (16, 32, 48, 128px)
      config.ts       - Configuration (API base URL, usage limits)
    manifest.json     - Chrome extension manifest
    CLAUDE.md         - Extension-specific documentation
    docs/             - Extension specifications
  /backend            - Backend API server (currently empty)
```

## Build Commands

**Extension:**
- Build system not yet implemented for extension
- Expected: `npm install`, `npm run build`, `npm run dev`, `npm run lint`
- Build output should go to `/extension/dist`

**Backend:**
- Not yet implemented
- Expected to provide `POST /rewrite` endpoint

## Architecture

### Extension Architecture (Three Components)

1. **Background Service Worker** (`extension/src/background/background.ts`)
   - Creates context menu item: "Rewrite selection with AI"
   - Handles rewrite API requests to backend
   - Manages message passing between components

2. **Content Script** (`extension/src/content/contentScript.ts`)
   - Listens for `selectionchange` events on editable elements
   - Shows/hides floating rewrite icon near selection
   - Injects and manages popup UI in page DOM
   - Handles text replacement for `<textarea>`, `<input>`, and contenteditable elements

3. **Popup UI** (`extension/src/content/popup.ts`, `extension/src/content/popup.css`)
   - DOM-injected interface (not browser action popup)
   - Shows original text, rewritten text, tone buttons, usage counter
   - Positioned near selection with auto-repositioning for viewport edges

### Backend API

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

**Mode Prompts:**
- **clarity**: "Rewrite the text to make it clearer and easier to understand. Preserve meaning."
- **professional**: "Rewrite the text in a polished, professional tone suitable for workplace communication."
- **friendly**: "Rewrite the text in a warm, friendly, conversational tone."

**Output Rules:**
- No meta commentary from AI
- Output only rewritten text
- Maintain original language
- Keep formatting simple
- Avoid adding new ideas beyond original intent

### Usage Tracking

15 free rewrites per month stored in `chrome.storage.local`:
- `usageMonthKey`: Current month (e.g., "2025-12")
- `rewritesUsedThisMonth`: Counter (0-15)

Reset counter when month changes. Block rewrites when ≥15.

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

## Message Passing

Background ↔ Content Script communication:
```ts
// Content → Background
chrome.runtime.sendMessage({
  type: "REQUEST_REWRITE",
  text: selectedText,
  mode: "clarity" | "professional" | "friendly"
});

// Background → Content
chrome.tabs.sendMessage(tabId, {
  type: "OPEN_REWRITE_POPUP",
  text: info.selectionText
});
```

## Testing Priorities

Test text replacement on:
- Gmail compose (contenteditable)
- LinkedIn messaging (contenteditable)
- Slack Web
- Facebook Messenger
- Reddit comment boxes
- Twitter/X text boxes
- Standard `<textarea>` elements

Edge cases:
- Selection at viewport boundaries
- Long selections (>1000 characters)
- Rapid consecutive rewrites
- Empty or whitespace-only selections

## Project Constraints

**Non-Goals (do not implement):**
- No user login/authentication
- No team admin panel
- No history view
- No translation or summarization features
- No mobile app or Windows native client

## Chrome Web Store Packaging

Build output to `/extension/dist` should contain:
- manifest.json
- Compiled JS files (background.js, contentScript.js, popup.js)
- Icons (16×16, 32×32, 48×48, 128×128)
- popup.css

Permissions justification:
"We need script and activeTab permissions to detect text selections and show the rewrite popup. We do not collect or store user data; all rewriting is done via a single API request."
