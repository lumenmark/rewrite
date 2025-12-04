# Rewrite Browser Extension – Full MVP Spec (Extended)

## 1. Overview

This project is a Chrome-compatible extension that rewrites selected text using AI.  
Includes inline icon, popup rewrite UI, tone selection, replace-in-place, and usage limits.

---

# 2. Core Behavior

### User Flow
1. User highlights text in any editable field.
2. A small floating "Rewrite" icon appears near the selection.
3. Clicking the icon opens a popup near the selection:
   - Original text
   - Rewritten text preview
   - Tone options:
     - Rewrite for clarity
     - Professional
     - Friendly
   - Accept or Cancel
4. On Accept → replace selected text in-place.
5. User can rewrite up to **15 times per month** (stored locally).
6. Also includes right-click context menu: “Rewrite selection with AI”.

---

# 3. Goals & Non-Goals

## Goals
- Chrome Manifest V3 extension
- Work on:
  - Gmail compose
  - LinkedIn DMs
  - Facebook Messenger Web
  - Slack Web
  - Jira, Confluence
  - Any `<textarea>`, `<input>`, or contenteditable
- Inline icon + popup UI
- 15 free rewrites per month
- Use best practices for the code

## Non-Goals
- No login
- No team admin panel
- No Windows native app
- No mobile app
- No history view
- No translation/summarization (MVP)

---

# 4. Architecture Overview

Extension includes:

```
manifest.json
background service worker
content script
DOM-injected popup UI
options page
icons
```

Backend:

```
API_BASE_URL/rewrite
```

---

# 5. Browser Extension Structure (Suggested)

```
/extension-root
  /src
    /background
      background.ts
    /content
      contentScript.ts
      popup.css
      popup.ts
    /options
      options.html
      options.ts
    /icons
      icon16.png
      icon32.png
      icon48.png
      icon128.png
    config.ts
  manifest.json
  package.json
  tsconfig.json
  README.md
```

---

# 6. Full manifest.json Requirements

```json
{
  "manifest_version": 3,
  "name": "Rewrite with AI",
  "version": "0.1.0",
  "description": "Rewrite selected text with AI for clarity, professionalism, or friendliness.",
  "permissions": [
    "storage",
    "activeTab",
    "contextMenus",
    "scripting"
  ],
  "host_permissions": [
    "https://*/*",
    "http://*/*"
  ],
  "background": {
    "service_worker": "dist/background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://*/*", "http://*/*"],
      "js": ["dist/contentScript.js"],
      "run_at": "document_idle"
    }
  ],
  "options_page": "options/options.html",
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

# 7. Background Script – Detailed Responsibilities

### 7.1 Create Context Menu
```ts
chrome.contextMenus.create({
  id: "rewrite-selection",
  title: "Rewrite selection with AI",
  contexts: ["selection"]
});
```

### 7.2 Handle Menu Click
On click:
- Get selected text (`info.selectionText`)
- Send message to content script:
```ts
chrome.tabs.sendMessage(tab.id, {
  type: "OPEN_REWRITE_POPUP",
  text: info.selectionText
});
```

### 7.3 Handle Rewrite Requests
Background receives:
```ts
{
  type: "REQUEST_REWRITE",
  text: "...",
  mode: "clarity" | "professional" | "friendly"
}
```

It then:
1. Calls backend API
2. Returns rewritten text or error

---

# 8. Content Script – Detailed Responsibilities

### 8.1 Detect selection changes
Use:
- `document.addEventListener("selectionchange", ...)`
- Track if selection is inside editable element

### 8.2 Display inline floating icon
- Icon appears near the bounding rect of selected text.
- Basic CSS:
```css
position: fixed;
z-index: 2147483647;
cursor: pointer;
width: 24px; height: 24px;
border-radius: 4px;
background: white;
box-shadow: 0 0 6px rgba(0,0,0,0.2);
```

### 8.3 Popup Logic
Injected DOM element:

- Positioned absolute/fixed based on selection's bounding box
- Contains:
```
Original Text (readonly)
Rewritten Text (editable or readonly)
Tone Buttons
Accept / Cancel
Usage counter: (X/15)
```

### 8.4 Trigger rewrite
When user selects a tone:
```ts
chrome.runtime.sendMessage({
  type: "REQUEST_REWRITE",
  text: selectedText,
  mode
});
```

### 8.5 Replace text in-place
Case logic:

#### A) `<textarea>` or `<input>`
Use:
```ts
element.value =
  element.value.slice(0, selectionStart) +
  rewrittenText +
  element.value.slice(selectionEnd);
```

#### B) contenteditable
Use Range API:
```ts
range.deleteContents();
range.insertNode(document.createTextNode(rewrittenText));
```

---

# 9. Popup UI – Detailed Spec

### Layout
```
[Rewrite with AI]

Original
[   Readonly box   ]

Rewritten
[   Rewritten output box   ]

Tones:
[ Clarity ] [ Professional ] [ Friendly ]

Footer:
[Cancel]            (Usage: X/15)            [Accept]
```

### Popup CSS Requirements
- Should appear near text selection
- Auto reposition if near edge
- z-index must exceed page content

### Loading State
- Replace rewritten box content with:
```
Rewriting…
```

### Error State
Show:
```
Error: Could not rewrite. Try again.
```

---

# 10. Usage Tracking System

Keys stored in `chrome.storage.local`:

```ts
usageMonthKey: "2025-12",
rewritesUsedThisMonth: 7
```

Logic:
- On startup or rewrite attempt:
  - Compare month keys
  - Reset if changed
- If usage ≥ 15:
  - Block rewrite and show upgrade message

---

# 11. Backend API – Full Spec

Backend accepts POST:

### **POST /rewrite**

#### Request
```json
{
  "text": "Hello Jon, attach the doc.",
  "mode": "professional"
}
```

#### Response
```json
{
  "rewrittenText": "Hello Jon, I'm sharing the document you requested."
}
```

### Backend business rules

#### Mode → Prompt
- clarity:
  > Rewrite the text to make it clearer and easier to understand. Preserve meaning.

- professional:
  > Rewrite the text in a polished, professional tone suitable for workplace communication.

- friendly:
  > Rewrite the text in a warm, friendly, conversational tone.

#### Output rules
- No meta commentary
- Output *only* rewritten text
- Maintain original language
- Keep formatting simple
- Avoid adding new ideas

#### Rate limiting (backend optional)
Not required for MVP, but recommended.

---

# 12. Icons (UI & Assets)

Provide these icons for the coding assistant to generate:

| Size | Purpose |
|------|---------|
| 16×16 | Browser toolbar |
| 32×32 | Context menu / extension page |
| 48×48 | Chrome store |
| 128×128 | Chrome store listing |

Inline rewrite icon:
- Suggest a small feather pen icon or “wand/star” icon
- Should be ~22–24px
- Background circle optional

The assistant should generate placeholders for all icons.

---

# 13. Testing Matrix

### Browsers
- Chrome (required)
- Edge (recommended)

### Web Apps
Test rewrite in:
- Gmail compose (contenteditable)
- LinkedIn messaging (contenteditable)
- Gmail reply inline
- Reddit comment box
- Twitter/X text box
- Facebook Messenger
- Slack Web
- Notion (limited support)
- Jira/Confluence

### Edges
- selection at bottom-right of viewport
- long selections
- empty selections
- rapid consecutive rewrites
- text replacement maintaining cursor position

---

# 14. Packaging for Chrome Web Store

### Build Steps
```
npm install
npm run build
```

### Output
A `/dist` folder containing:
- manifest.json
- background.js
- contentScript.js
- popup.js
- popup.css
- icons/

### Submission Requirements
- 128×128 icon
- Detailed description
- Screenshots:
  - Inline icon visible
  - Popup UI screenshot
  - Before/after rewrite example
- Video optional but recommended

### Permissions Justification
Include text:
```
We need script and activeTab permissions to detect text selections and show the rewrite popup. We do not collect or store user data; all rewriting is done via a single API request.
```

---

# 15. Roadmap After MVP

Future improvements:
- Custom tones
- Rewrite intensity slider
- Keyboard shortcut (Ctrl+Shift+R)
- Windows desktop client
- iOS/Android share extension
- Team/admin dashboard
- Multi-language detection
- Rewrite history
