// Configuration and shared types for the Rewrite extension

export const API_BASE_URL = 'http://localhost:3000';
export const MAX_REWRITES_PER_MONTH = 15;
export const POPUP_Z_INDEX = 2147483647;

export type RewriteMode = 'clarity' | 'professional' | 'friendly';

// Message types for communication between components
export interface RequestRewriteMessage {
  type: 'REQUEST_REWRITE';
  text: string;
  mode: RewriteMode;
}

export interface OpenRewritePopupMessage {
  type: 'OPEN_REWRITE_POPUP';
  text: string;
}

export interface RewriteResponseMessage {
  rewrittenText?: string;
  error?: string;
}

// API request/response types
export interface RewriteAPIRequest {
  text: string;
  mode: RewriteMode;
}

export interface RewriteAPIResponse {
  rewrittenText: string;
}

// Usage tracking types
export interface UsageStorage {
  usageMonthKey?: string;
  rewritesUsedThisMonth?: number;
}
