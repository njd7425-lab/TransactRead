const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { validateAuthRequest } = require('../services/metamask');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  try {
    const { email, uid } = req.body;
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await prisma.user.create({
      data: {
        id: uid,
        email
      }
    });

    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, uid } = req.body;
    
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uid,
          email
        }
      });
    }

    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// MetaMask authentication endpoint
router.post('/metamask', async (req, res) => {
  try {
    const { address, message, signature, timestamp } = req.body;

    // Validate the authentication request
    const validation = validateAuthRequest(address, message, signature, timestamp);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if user exists with this address
    let user = await prisma.user.findUnique({
      where: { id: validation.address }
    });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: validation.address,
          email: `${validation.address}@metamask.local` // Placeholder email for MetaMask users
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        uid: user.id, 
        email: user.email,
        authMethod: 'metamask'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        address: user.id
      }
    });
  } catch (error) {
    console.error('MetaMask authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
