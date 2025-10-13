const validateWalletAddress = (req, res, next) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address format' });
  }
  
  next();
};

const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};

module.exports = {
  validateWalletAddress,
  validateEmail
};
