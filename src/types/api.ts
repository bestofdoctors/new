export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MintRequest {
  tokenId: string;
  metadata?: Record<string, unknown>;
}

export interface ListingRequest {
  tokenId: string;
  price: string;
  currency?: string;
  expiresAt?: string;
}