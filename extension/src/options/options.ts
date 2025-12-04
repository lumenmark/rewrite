import { MAX_REWRITES_PER_MONTH, type UsageStorage } from '../config';

// Update usage display on page load
document.addEventListener('DOMContentLoaded', async () => {
  await updateUsageDisplay();
});

async function updateUsageDisplay() {
  try {
    const storage = await chrome.storage.local.get([
      'usageMonthKey',
      'rewritesUsedThisMonth',
    ]) as UsageStorage;

    const used = storage.rewritesUsedThisMonth || 0;
    const percentage = (used / MAX_REWRITES_PER_MONTH) * 100;

    // Update count
    const usageCountEl = document.getElementById('usageCount');
    if (usageCountEl) {
      usageCountEl.textContent = used.toString();
    }

    // Update progress bar
    const progressFillEl = document.getElementById('progressFill') as HTMLElement;
    if (progressFillEl) {
      progressFillEl.style.width = `${percentage}%`;
    }

    // Update reset info with next month
    const resetInfoEl = document.getElementById('resetInfo');
    if (resetInfoEl) {
      const nextMonth = getNextMonthName();
      resetInfoEl.textContent = `Resets on ${nextMonth} 1st`;
    }
  } catch (error) {
    console.error('Failed to load usage stats:', error);
  }
}

function getNextMonthName(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

// Handle documentation link
const docsLink = document.getElementById('docsLink');
if (docsLink) {
  docsLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Could open a documentation page or GitHub README
    alert('Documentation coming soon!');
  });
}
