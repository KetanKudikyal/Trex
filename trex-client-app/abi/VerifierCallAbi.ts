export const VerifierCallAbi = [
  {
    type: 'function',
    name: 'callP256R1Verify',
    inputs: [
      { name: 'messageHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'r', type: 'bytes32', internalType: 'bytes32' },
      { name: 's', type: 'bytes32', internalType: 'bytes32' },
      { name: 'pubKeyX', type: 'bytes32', internalType: 'bytes32' },
      { name: 'pubKeyY', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [{ name: 'isValid', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
] as const
