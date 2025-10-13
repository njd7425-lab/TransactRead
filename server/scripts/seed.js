const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const seedData = async () => {
  try {
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    const user1 = await prisma.user.create({
      data: {
        id: 'user1',
        email: 'alice@example.com'
      }
    });

    const user2 = await prisma.user.create({
      data: {
        id: 'user2',
        email: 'bob@example.com'
      }
    });

    const wallet1 = await prisma.wallet.create({
      data: {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        label: 'Main Wallet',
        userId: user1.id
      }
    });

    const wallet2 = await prisma.wallet.create({
      data: {
        address: '0x8ba1f109551bD432803012645Hac136c',
        label: 'Trading Wallet',
        userId: user1.id
      }
    });

    const wallet3 = await prisma.wallet.create({
      data: {
        address: '0x1234567890123456789012345678901234567890',
        label: 'NFT Wallet',
        userId: user2.id
      }
    });

    const mockTransactions = [
      {
        hash: '0xabc123def456789',
        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        to: '0x8ba1f109551bD432803012645Hac136c',
        value: '1000000000000000000',
        method: '0x',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        category: 'Send',
        summary: 'You sent 1.0 ETH to another wallet',
        gasUsed: '21000',
        gasPrice: '20000000000',
        walletId: wallet1.id
      },
      {
        hash: '0xdef456abc789123',
        from: '0x8ba1f109551bD432803012645Hac136c',
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        value: '500000000000000000',
        method: '0x',
        timestamp: new Date('2024-01-14T15:45:00Z'),
        category: 'Receive',
        summary: 'You received 0.5 ETH from another wallet',
        gasUsed: '21000',
        gasPrice: '20000000000',
        walletId: wallet1.id
      },
      {
        hash: '0x789123def456abc',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        value: '0',
        method: '0xa9059cbb',
        timestamp: new Date('2024-01-13T09:20:00Z'),
        category: 'NFT',
        summary: 'You received an NFT transfer',
        gasUsed: '65000',
        gasPrice: '25000000000',
        walletId: wallet3.id
      }
    ];

    for (const tx of mockTransactions) {
      await prisma.transaction.create({ data: tx });
    }

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedData();
