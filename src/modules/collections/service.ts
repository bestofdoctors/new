import * as rpc from './rpc';

export async function mintCollection(name: string) {
  return rpc.mintCollection({ name });
}

export async function addItem(collectionId: string, item: Record<string, unknown>) {
  return rpc.addItem({ collectionId, item });
}

export async function getStats(collectionId: string) {
  return rpc.getStats({ collectionId });
}
