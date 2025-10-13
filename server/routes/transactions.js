const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { fetchTransactionsFromEtherscan, generateSummary } = require('../services/etherscan');
const { categorizeTransaction } = require('../utils/transactionUtils');

router.use(authenticateToken);

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { wallet: true }
    });

    if (!transaction || transaction.wallet.userId !== req.user.uid) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

router.post('/sync/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const wallet = await prisma.wallet.findFirst({
      where: { 
        id: walletId,
        userId: req.user.uid 
      }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const transactions = await fetchTransactionsFromEtherscan(wallet.address);
    
    for (const tx of transactions) {
      const existing = await prisma.transaction.findUnique({
        where: { hash: tx.hash }
      });

      if (!existing) {
        const category = categorizeTransaction(tx);
        const summary = await generateSummary(tx);

        await prisma.transaction.create({
          data: {
            ...tx,
            walletId,
            category,
            summary
          }
        });
      }
    }

    res.json({ message: 'Transactions synced successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync transactions' });
  }
});

module.exports = router;
