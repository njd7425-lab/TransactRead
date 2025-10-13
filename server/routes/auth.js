const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

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

module.exports = router;
