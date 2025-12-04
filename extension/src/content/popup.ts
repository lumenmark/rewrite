import { POPUP_Z_INDEX, MAX_REWRITES_PER_MONTH, type RewriteMode, type UsageStorage } from '../config';

let popupElement: HTMLElement | null = null;
let currentRewrittenText = '';
let onToneClick: ((mode: RewriteMode) => void) | null = null;
let onAccept: ((text: string) => void) | null = null;
let onCancel: (() => void) | null = null;

// Create popup element
export function createPopup(): HTMLElement {
  const popup = document.createElement('div');
  popup.id = 'rewrite-popup-container';

  popup.innerHTML = `
    <div class="rewrite-popup-header">
      <span>Rewrite with AI</span>
      <button class="rewrite-close-btn" aria-label="Close">×</button>
    </div>
    <div class="rewrite-popup-body">
      <div class="rewrite-section">
        <label class="rewrite-label">Original</label>
        <div class="rewrite-original"></div>
      </div>
      <div class="rewrite-section">
        <label class="rewrite-label">Rewritten</label>
        <div class="rewrite-output">Select a tone to rewrite</div>
      </div>
      <div class="rewrite-tones">
        <button class="rewrite-tone-btn" data-mode="clarity">
          <span class="tone-icon">🎯</span>
          <span>Clarity</span>
        </button>
        <button class="rewrite-tone-btn" data-mode="professional">
          <span class="tone-icon">💼</span>
          <span>Professional</span>
        </button>
        <button class="rewrite-tone-btn" data-mode="friendly">
          <span class="tone-icon">😊</span>
          <span>Friendly</span>
        </button>
      </div>
    </div>
    <div class="rewrite-popup-footer">
      <button class="rewrite-cancel-btn">Cancel</button>
      <span class="rewrite-usage">Usage: 0/15</span>
      <button class="rewrite-accept-btn" disabled>Accept</button>
    </div>
  `;

  popup.style.cssText = `
    position: fixed;
    z-index: ${POPUP_Z_INDEX};
    width: 420px;
    max-height: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    color: #1f2937;
    display: none;
  `;

  return popup;
}

// Show popup
export function showPopup(
  originalText: string,
  rect: DOMRect,
  toneClickHandler: (mode: RewriteMode) => void,
  acceptHandler: (text: string) => void,
  cancelHandler: () => void
) {
  // Store handlers
  onToneClick = toneClickHandler;
  onAccept = acceptHandler;
  onCancel = cancelHandler;

  // Create popup if it doesn't exist
  if (!popupElement) {
    popupElement = createPopup();
    document.body.appendChild(popupElement);

    // Attach event listeners
    attachEventListeners();
  }

  // Reset state
  currentRewrittenText = '';

  // Update content
  const originalDiv = popupElement.querySelector('.rewrite-original') as HTMLElement;
  if (originalDiv) {
    originalDiv.textContent = originalText;
  }

  const outputDiv = popupElement.querySelector('.rewrite-output') as HTMLElement;
  if (outputDiv) {
    outputDiv.textContent = 'Select a tone to rewrite';
    outputDiv.className = 'rewrite-output';
  }

  // Disable accept button
  const acceptBtn = popupElement.querySelector('.rewrite-accept-btn') as HTMLButtonElement;
  if (acceptBtn) {
    acceptBtn.disabled = true;
  }

  // Update usage counter
  updateUsageDisplay();

  // Position popup
  positionPopup(popupElement, rect);

  // Show popup
  popupElement.style.display = 'block';
}

// Hide popup
export function hidePopup() {
  if (popupElement) {
    popupElement.style.display = 'none';
  }
  currentRewrittenText = '';
}

// Update popup with rewrite result
export function updatePopupWithRewrite(rewrittenText: string | null, error: string | null) {
  if (!popupElement) return;

  const outputDiv = popupElement.querySelector('.rewrite-output') as HTMLElement;
  const acceptBtn = popupElement.querySelector('.rewrite-accept-btn') as HTMLButtonElement;
  const toneButtons = popupElement.querySelectorAll('.rewrite-tone-btn') as NodeListOf<HTMLButtonElement>;

  if (error) {
    // Show error state
    outputDiv.textContent = error;
    outputDiv.className = 'rewrite-output error';
    acceptBtn.disabled = true;
    currentRewrittenText = '';

    // Re-enable tone buttons
    toneButtons.forEach(btn => btn.disabled = false);
  } else if (rewrittenText) {
    // Show success state
    outputDiv.textContent = rewrittenText;
    outputDiv.className = 'rewrite-output success';
    acceptBtn.disabled = false;
    currentRewrittenText = rewrittenText;

    // Re-enable tone buttons
    toneButtons.forEach(btn => btn.disabled = false);

    // Update usage display
    updateUsageDisplay();
  }
}

// Position popup intelligently
function positionPopup(popup: HTMLElement, selectionRect: DOMRect) {
  const popupWidth = 420;
  const popupHeight = 500; // Approximate
  const margin = 16;

  let top = selectionRect.bottom + window.scrollY + margin;
  let left = selectionRect.left + window.scrollX;

  // Handle right edge overflow
  if (left + popupWidth > window.innerWidth) {
    left = window.innerWidth - popupWidth - margin;
  }

  // Handle left edge
  if (left < margin) {
    left = margin;
  }

  // Handle bottom edge overflow
  if (top + popupHeight > window.innerHeight + window.scrollY) {
    // Position above selection instead
    top = selectionRect.top + window.scrollY - popupHeight - margin;
  }

  // Ensure minimum top position
  if (top < margin) {
    top = margin;
  }

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
}

// Attach event listeners
function attachEventListeners() {
  if (!popupElement) return;

  // Tone buttons
  const toneButtons = popupElement.querySelectorAll('.rewrite-tone-btn');
  toneButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const button = e.currentTarget as HTMLButtonElement;
      const mode = button.getAttribute('data-mode') as RewriteMode;

      if (onToneClick) {
        // Show loading state
        const outputDiv = popupElement!.querySelector('.rewrite-output') as HTMLElement;
        outputDiv.textContent = 'Rewriting...';
        outputDiv.className = 'rewrite-output loading';

        // Disable all tone buttons during loading
        toneButtons.forEach(b => (b as HTMLButtonElement).disabled = true);

        onToneClick(mode);
      }
    });
  });

  // Accept button
  const acceptBtn = popupElement.querySelector('.rewrite-accept-btn');
  acceptBtn?.addEventListener('click', () => {
    if (onAccept && currentRewrittenText) {
      onAccept(currentRewrittenText);
    }
  });

  // Cancel button
  const cancelBtn = popupElement.querySelector('.rewrite-cancel-btn');
  cancelBtn?.addEventListener('click', () => {
    if (onCancel) {
      onCancel();
    }
  });

  // Close button
  const closeBtn = popupElement.querySelector('.rewrite-close-btn');
  closeBtn?.addEventListener('click', () => {
    if (onCancel) {
      onCancel();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupElement?.style.display === 'block') {
      if (onCancel) {
        onCancel();
      }
    }
  });
}

// Update usage display
async function updateUsageDisplay() {
  if (!popupElement) return;

  try {
    const storage = await chrome.storage.local.get('rewritesUsedThisMonth') as UsageStorage;
    const used = storage.rewritesUsedThisMonth || 0;
    const usageElement = popupElement.querySelector('.rewrite-usage');
    if (usageElement) {
      usageElement.textContent = `Usage: ${used}/${MAX_REWRITES_PER_MONTH}`;
    }
  } catch (error) {
    console.error('Failed to update usage display:', error);
  }
}
