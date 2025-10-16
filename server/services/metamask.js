const { ethers } = require('ethers');

/**
 * Verify a MetaMask signature
 * @param {string} address - The Ethereum address that signed the message
 * @param {string} message - The original message that was signed
 * @param {string} signature - The signature to verify
 * @returns {boolean} - Whether the signature is valid
 */
const verifySignature = (address, message, signature) => {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Check if the recovered address matches the claimed address
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Generate a unique message for authentication
 * @param {string} address - The Ethereum address
 * @param {number} timestamp - The timestamp
 * @returns {string} - The authentication message
 */
const generateAuthMessage = (address, timestamp) => {
  return `TransactRead Authentication\n\nAccount: ${address}\nTimestamp: ${timestamp}\n\nClick "Sign" to authenticate with TransactRead.`;
};

/**
 * Validate the authentication request
 * @param {string} address - The Ethereum address
 * @param {string} message - The message that was signed
 * @param {string} signature - The signature
 * @param {number} timestamp - The timestamp
 * @returns {object} - Validation result
 */
const validateAuthRequest = (address, message, signature, timestamp) => {
  // Check if all required fields are present
  if (!address || !message || !signature || !timestamp) {
    return {
      valid: false,
      error: 'Missing required fields'
    };
  }

  // Validate Ethereum address format using regex (more lenient than ethers.getAddress)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    return {
      valid: false,
      error: 'Invalid Ethereum address format'
    };
  }
  
  // Check if the message matches the expected format (use original address for message)
  const expectedMessage = generateAuthMessage(address, timestamp);
  
  // Normalize the address to lowercase for consistency (after message check)
  address = address.toLowerCase();
  if (message !== expectedMessage) {
    return {
      valid: false,
      error: 'Invalid message format'
    };
  }

  // Check if the timestamp is not too old (5 minutes)
  const now = Date.now();
  const timeDiff = now - timestamp;
  const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (timeDiff > maxAge) {
    return {
      valid: false,
      error: 'Authentication request expired'
    };
  }

  // Verify the signature
  if (!verifySignature(address, message, signature)) {
    return {
      valid: false,
      error: 'Invalid signature'
    };
  }

  return {
    valid: true,
    address: address.toLowerCase()
  };
};

module.exports = {
  verifySignature,
  generateAuthMessage,
  validateAuthRequest
};
