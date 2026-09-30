// Interface the dashboard expects from the T10L claim contract (VITE_T10L_CLAIM_ADDRESS).
// If the deployed contract's ABI differs, replace this file with the real ABI and adjust
// src/app/hooks/useClaim.ts; everything else reads through that hook.
export const CLAIM_ABI = [
  {
    type: 'function',
    name: 'windowOpensAt',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'windowClosesAt',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'claimable',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [
      { name: 'tokens', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
    ],
  },
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const
