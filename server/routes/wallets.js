const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

// Use Firebase authentication
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: req.user.uid },
      include: {
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      }
    });

    res.json(wallets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { address, label } = req.body;
    
    console.log('Adding wallet:', { address, label, userId: req.user.uid });
    
    // Validate required fields
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate Ethereum address format
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    // Check if wallet exists for this user
    const existingWalletForUser = await prisma.wallet.findFirst({
      where: { 
        address,
        userId: req.user.uid 
      }
    });

    if (existingWalletForUser) {
      return res.status(400).json({ error: 'Wallet already exists for this user' });
    }

    // Check if wallet exists for any user (global unique constraint)
    const existingWalletGlobal = await prisma.wallet.findFirst({
      where: { address }
    });

    if (existingWalletGlobal) {
      return res.status(400).json({ error: 'Wallet address already exists in the system' });
    }

    const userWallets = await prisma.wallet.count({
      where: { userId: req.user.uid }
    });

    if (userWallets >= 10) {
      return res.status(400).json({ error: 'Maximum 10 wallets allowed' });
    }

    const wallet = await prisma.wallet.create({
      data: {
        address,
        label: label || `Wallet ${userWallets + 1}`,
        userId: req.user.uid
      }
    });

    console.log('Wallet created successfully:', wallet.id);
    res.status(201).json(wallet);
  } catch (error) {
    console.error('Error creating wallet:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Wallet address already exists' });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

router.get('/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    
    const wallet = await prisma.wallet.findFirst({
      where: { 
        id,
        userId: req.user.uid 
      }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { walletId: id },
      orderBy: { timestamp: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
