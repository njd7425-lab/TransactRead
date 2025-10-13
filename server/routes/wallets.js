const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

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
    
    const existingWallet = await prisma.wallet.findUnique({
      where: { address }
    });

    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet already exists' });
    }

    const userWallets = await prisma.wallet.count({
      where: { userId: req.user.uid }
    });

    if (userWallets >= 3) {
      return res.status(400).json({ error: 'Maximum 3 wallets allowed' });
    }

    const wallet = await prisma.wallet.create({
      data: {
        address,
        label: label || `Wallet ${userWallets + 1}`,
        userId: req.user.uid
      }
    });

    res.status(201).json(wallet);
  } catch (error) {
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
