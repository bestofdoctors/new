import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  keypairIdentity,
  generateSigner,
  createSignerFromKeypair,
  Signer,
  Umi,
} from '@metaplex-foundation/umi';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { readFileSync } from 'fs';
import path from 'path';

function loadKeypair(umi: Umi): Signer {
  try {
    const keypairPath =
      process.env.KEYPAIR_PATH ||
      path.join(process.env.HOME || '', '.config', 'solana', 'id.json');
    const secret = JSON.parse(readFileSync(keypairPath, 'utf8')) as number[];
    const keypair = umi.eddsa.createKeypairFromSecretKey(
      Uint8Array.from(secret)
    );
    return createSignerFromKeypair(umi, keypair);
  } catch (err) {
    return generateSigner(umi);
  }
}

export function createConfiguredUmi(): Umi {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8899';
  const umi = createUmi(rpcUrl).use(mplTokenMetadata());
  umi.use(keypairIdentity(loadKeypair(umi)));
  return umi;
}

export const umi = createConfiguredUmi();
