export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MintRequest {
  tokenId: string;
  metadata?: Record<string, unknown>;
  collectionId?: string;
  collectionMint?: string;
  authorityPubkey?: string;
}

export interface ListingRequest {
  tokenId: string;
  price: string;
  currency?: string;
  expiresAt?: string;
  collectionId?: string;
}

// Collection related types
export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface CollectionItem {
  tokenId: string;
  price?: string; // serialized BigInt
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: CollectionItem[];
}

export interface AddItemRequest {
  tokenId: string;
  price?: string;
}

export interface CollectionStats {
  total: number;
  listed: number;
  floorPrice: string;
  volume: string;
}