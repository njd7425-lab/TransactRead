const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { fetchTransactionsFromEtherscan, generateSummary } = require('../services/etherscan');
const { categorizeTransaction } = require('../utils/transactionUtils');

// Use Firebase authentication
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
        // Don't generate AI summary automatically - let user request it manually
        const summary = null;

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

router.delete('/wallet/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const userId = req.user.uid;
    
    const wallet = await prisma.wallet.findFirst({
      where: { 
        id: walletId,
        userId: userId 
      }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Delete all transactions for this wallet
    const result = await prisma.transaction.deleteMany({
      where: { walletId }
    });

    res.json({ 
      message: 'Transactions cleared successfully',
      deletedCount: result.count 
    });
  } catch (error) {
    console.error('Error clearing transactions:', error);
    res.status(500).json({ error: 'Failed to clear transactions' });
  }
});

router.post('/:id/generate-summary', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { wallet: true }
    });

    if (!transaction || transaction.wallet.userId !== req.user.uid) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    try {
      // Generate AI summary
      const summary = await generateSummary(transaction);
      
      // Update transaction with summary
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: { summary }
      });

      res.json({ 
        message: 'Summary generated successfully',
        summary: updatedTransaction.summary 
      });
    } catch (openaiError) {
      console.log('OpenAI Error caught:', {
        status: openaiError.status,
        code: openaiError.code,
        message: openaiError.message,
        type: openaiError.type
      });
      
      // Handle OpenAI quota exceeded or other API errors
      if (openaiError.status === 429 || openaiError.code === 'insufficient_quota' || openaiError.message?.includes('quota') || openaiError.type === 'insufficient_quota') {
        console.log('Quota exceeded, generating fallback summary...');
        const fallbackSummary = `Transaction: ${transaction.category} - ${transaction.value} ETH to ${transaction.to?.slice(0, 6)}...${transaction.to?.slice(-4)}`;
        
        const updatedTransaction = await prisma.transaction.update({
          where: { id },
          data: { summary: fallbackSummary }
        });

        console.log('Fallback summary generated:', fallbackSummary);
        res.json({ 
          message: 'AI summary unavailable due to API quota. Generated basic summary instead.',
          summary: updatedTransaction.summary 
        });
      } else {
        console.error('Unexpected OpenAI error:', openaiError);
        throw openaiError;
      }
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

module.exports = router;
