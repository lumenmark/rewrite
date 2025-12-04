// Simple test backend server for the Rewrite extension
// This is a mock server for testing - replace with actual AI implementation

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock rewrite endpoint
app.post('/rewrite', (req, res) => {
  const { text, mode } = req.body;

  if (!text || !mode) {
    return res.status(400).json({ error: 'Missing text or mode' });
  }

  // Mock rewriting logic - replace with actual AI call
  const rewrittenText = mockRewrite(text, mode);

  res.json({ rewrittenText });
});

function mockRewrite(text, mode) {
  // Simple mock that adds a prefix based on mode
  switch (mode) {
    case 'clarity':
      return `[Clear] ${text} (This has been clarified for better understanding.)`;
    case 'professional':
      return `Dear colleague, ${text} Please let me know if you need any further assistance.`;
    case 'friendly':
      return `Hey! ${text} 😊 Hope this helps!`;
    default:
      return text;
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Test backend server running on http://localhost:${PORT}`);
  console.log(`📝 POST /rewrite endpoint ready for testing`);
  console.log(`\nExample request:`);
  console.log(`  curl -X POST http://localhost:${PORT}/rewrite \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"text": "Hello", "mode": "professional"}'`);
});
