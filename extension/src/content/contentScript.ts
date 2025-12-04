import {
  POPUP_Z_INDEX,
  type RewriteMode,
  type OpenRewritePopupMessage,
  type RequestRewriteMessage,
  type RewriteResponseMessage,
} from '../config';
import { createPopup, showPopup, hidePopup, updatePopupWithRewrite } from './popup';

// State management
let floatingIcon: HTMLElement | null = null;
let activeEditableElement: HTMLElement | null = null;
let selectionRange: Range | null = null;
let currentSelectedText = '';

// Initialize selection detection
document.addEventListener('selectionchange', handleSelectionChange);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_REWRITE_POPUP') {
    const msg = message as OpenRewritePopupMessage;
    openRewritePopup(msg.text);
  }
});

// Handle selection changes
function handleSelectionChange() {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed) {
    hideFloatingIcon();
    return;
  }

  const text = selection.toString().trim();
  if (!text || text.length === 0) {
    hideFloatingIcon();
    return;
  }

  // Check if selection is in editable element
  const anchorNode = selection.anchorNode;
  const element = anchorNode?.nodeType === Node.TEXT_NODE
    ? anchorNode.parentElement
    : (anchorNode as HTMLElement);

  if (!isEditableElement(element)) {
    hideFloatingIcon();
    return;
  }

  // Store for later text replacement
  activeEditableElement = element;
  currentSelectedText = text;

  // Clone range to preserve after selection clears
  try {
    selectionRange = selection.getRangeAt(0).cloneRange();
  } catch (e) {
    hideFloatingIcon();
    return;
  }

  // Show icon near selection
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  showFloatingIcon(rect);
}

// Check if element is editable
function isEditableElement(element: HTMLElement | null): boolean {
  if (!element) return false;

  return (
    element.tagName === 'TEXTAREA' ||
    (element.tagName === 'INPUT' &&
     (element.getAttribute('type') === 'text' ||
      element.getAttribute('type') === 'email' ||
      !element.getAttribute('type'))) ||
    element.isContentEditable ||
    isInsideContentEditable(element)
  );
}

// Check if element is inside a contenteditable container
function isInsideContentEditable(element: HTMLElement): boolean {
  let current = element.parentElement;
  while (current) {
    if (current.isContentEditable) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

// Show floating icon near selection
function showFloatingIcon(rect: DOMRect) {
  if (!floatingIcon) {
    floatingIcon = document.createElement('div');
    floatingIcon.id = 'rewrite-floating-icon';
    floatingIcon.innerHTML = '✨';
    floatingIcon.style.cssText = `
      position: fixed;
      z-index: ${POPUP_Z_INDEX - 1};
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
      user-select: none;
    `;

    floatingIcon.addEventListener('mouseenter', () => {
      if (floatingIcon) {
        floatingIcon.style.transform = 'scale(1.1)';
        floatingIcon.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
      }
    });

    floatingIcon.addEventListener('mouseleave', () => {
      if (floatingIcon) {
        floatingIcon.style.transform = 'scale(1)';
        floatingIcon.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      }
    });

    floatingIcon.addEventListener('click', handleIconClick);
    document.body.appendChild(floatingIcon);
  }

  // Position icon near selection (bottom-right)
  const iconTop = rect.bottom + window.scrollY + 5;
  const iconLeft = rect.right + window.scrollX - 14;

  floatingIcon.style.top = `${iconTop}px`;
  floatingIcon.style.left = `${iconLeft}px`;
  floatingIcon.style.display = 'flex';
}

// Hide floating icon
function hideFloatingIcon() {
  if (floatingIcon) {
    floatingIcon.style.display = 'none';
  }
}

// Handle icon click
function handleIconClick(e: MouseEvent) {
  e.stopPropagation();
  if (currentSelectedText) {
    openRewritePopup(currentSelectedText);
  }
}

// Open rewrite popup
export function openRewritePopup(text: string) {
  if (!selectionRange) return;

  currentSelectedText = text;
  const rect = selectionRange.getBoundingClientRect();

  hideFloatingIcon();
  showPopup(text, rect, handleToneButtonClick, handleAcceptClick, handleCancelClick);
}

// Handle tone button click
async function handleToneButtonClick(mode: RewriteMode) {
  try {
    const response: RewriteResponseMessage = await chrome.runtime.sendMessage({
      type: 'REQUEST_REWRITE',
      text: currentSelectedText,
      mode,
    } as RequestRewriteMessage);

    if (response.error) {
      updatePopupWithRewrite(null, response.error);
      return;
    }

    if (response.rewrittenText) {
      updatePopupWithRewrite(response.rewrittenText, null);
    }
  } catch (error) {
    updatePopupWithRewrite(null, 'Failed to rewrite. Please try again.');
  }
}

// Handle accept button click
function handleAcceptClick(rewrittenText: string) {
  if (!activeEditableElement || !selectionRange) return;

  replaceTextInElement(activeEditableElement, selectionRange, rewrittenText);
  hidePopup();

  // Clean up state
  activeEditableElement = null;
  selectionRange = null;
  currentSelectedText = '';
}

// Handle cancel button click
function handleCancelClick() {
  hidePopup();

  // Clean up state
  activeEditableElement = null;
  selectionRange = null;
  currentSelectedText = '';
}

// Replace text in element (will be implemented in Phase 6)
function replaceTextInElement(
  element: HTMLElement,
  range: Range,
  rewrittenText: string
) {
  if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    replaceInFormElement(element as HTMLInputElement | HTMLTextAreaElement, rewrittenText);
  } else if (element.isContentEditable || isInsideContentEditable(element)) {
    replaceInContentEditable(range, rewrittenText);
  }
}

// Replace text in textarea or input
function replaceInFormElement(
  element: HTMLInputElement | HTMLTextAreaElement,
  rewrittenText: string
) {
  const start = element.selectionStart || 0;
  const end = element.selectionEnd || 0;

  const newValue =
    element.value.slice(0, start) +
    rewrittenText +
    element.value.slice(end);

  element.value = newValue;

  // Set cursor position after replaced text
  const newCursorPos = start + rewrittenText.length;
  element.setSelectionRange(newCursorPos, newCursorPos);

  // Trigger input event for frameworks (React, Vue, etc.)
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

// Replace text in contenteditable
function replaceInContentEditable(range: Range, rewrittenText: string) {
  // Delete selected content
  range.deleteContents();

  // Insert new text
  const textNode = document.createTextNode(rewrittenText);
  range.insertNode(textNode);

  // Move cursor to end of inserted text
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // Trigger input event for frameworks
  const container = range.commonAncestorContainer;
  const editableElement = container.nodeType === Node.TEXT_NODE
    ? container.parentElement
    : (container as HTMLElement);

  if (editableElement) {
    editableElement.dispatchEvent(new Event('input', { bubbles: true }));
    editableElement.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
