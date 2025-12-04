# Rewrite Backend API

Simple test backend server for the Rewrite Chrome extension.

## Installation

```bash
cd backend
npm install
```

## Usage

Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000`.

## API Endpoint

### POST /rewrite

Rewrites text based on the specified mode.

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
  "rewrittenText": "Dear colleague, Hello Jon, attach the doc. Please let me know if you need any further assistance."
}
```

## Testing

Test the endpoint with curl:

```bash
curl -X POST http://localhost:3000/rewrite \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello Jon, attach the doc.", "mode": "professional"}'
```

## Note

This is a **mock implementation** for testing purposes. The `mockRewrite()` function simply adds prefixes/suffixes based on the mode.

For production, replace the `mockRewrite()` function with actual AI API calls (OpenAI, Anthropic, etc.).

### Example Production Implementation

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function rewriteWithAI(text, mode) {
  const prompts = {
    clarity: "Rewrite the text to make it clearer and easier to understand. Preserve meaning.",
    professional: "Rewrite the text in a polished, professional tone suitable for workplace communication.",
    friendly: "Rewrite the text in a warm, friendly, conversational tone."
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: prompts[mode] },
      { role: "user", content: text }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}
```
