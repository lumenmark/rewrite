import {
  API_BASE_URL,
  MAX_REWRITES_PER_MONTH,
  type RewriteMode,
  type RequestRewriteMessage,
  type RewriteResponseMessage,
  type RewriteAPIRequest,
  type RewriteAPIResponse,
  type UsageStorage,
} from '../config';

// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'rewrite-selection',
    title: 'Rewrite selection with AI',
    contexts: ['selection'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'rewrite-selection' && tab?.id && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'OPEN_REWRITE_POPUP',
      text: info.selectionText,
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REQUEST_REWRITE') {
    const rewriteRequest = request as RequestRewriteMessage;
    handleRewriteRequest(rewriteRequest.text, rewriteRequest.mode)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

// Handle rewrite request with usage tracking
async function handleRewriteRequest(
  text: string,
  mode: RewriteMode
): Promise<RewriteResponseMessage> {
  // Check usage limit
  const canRewrite = await checkUsageLimit();
  if (!canRewrite) {
    const storage = await chrome.storage.local.get('rewritesUsedThisMonth') as UsageStorage;
    const used = storage.rewritesUsedThisMonth || 0;
    throw new Error(`Monthly rewrite limit reached (${used}/${MAX_REWRITES_PER_MONTH})`);
  }

  // Call API
  try {
    const response = await fetch(`${API_BASE_URL}/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        mode,
      } as RewriteAPIRequest),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: RewriteAPIResponse = await response.json();

    // Increment usage counter after successful rewrite
    await incrementUsageCounter();

    return { rewrittenText: data.rewrittenText };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to rewrite: ${error.message}`);
    }
    throw new Error('Failed to rewrite. Please try again.');
  }
}

// Check if user has remaining rewrites this month
async function checkUsageLimit(): Promise<boolean> {
  const currentMonth = getCurrentMonth();
  const storage = await chrome.storage.local.get([
    'usageMonthKey',
    'rewritesUsedThisMonth',
  ]) as UsageStorage;

  if (storage.usageMonthKey !== currentMonth) {
    // Reset for new month
    await chrome.storage.local.set({
      usageMonthKey: currentMonth,
      rewritesUsedThisMonth: 0,
    });
    return true;
  }

  return (storage.rewritesUsedThisMonth || 0) < MAX_REWRITES_PER_MONTH;
}

// Increment usage counter
async function incrementUsageCounter(): Promise<void> {
  const storage = await chrome.storage.local.get('rewritesUsedThisMonth') as UsageStorage;
  await chrome.storage.local.set({
    rewritesUsedThisMonth: (storage.rewritesUsedThisMonth || 0) + 1,
  });
}

// Get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
