import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'ethers/lib/utils.js';
import whitelist from '../data/whitelist.json';

// Generate leaves from the whitelist
const leaves = whitelist.map(addr => keccak256(addr));
const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

// Get the Merkle root of the tree
const root = tree.getHexRoot();

// Example function to get a Merkle proof for an address
export const getMerkleProof = (address) => {
    const leaf = keccak256(address);
    return tree.getHexProof(leaf);
};

