const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin SDK only if credentials are available
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== 'demo_private_key') {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const authenticateToken = async (req, res, next) => {
  console.log('Auth middleware called, admin.apps.length:', admin.apps.length);
  
  // Check if Firebase is properly initialized
  if (!admin.apps.length) {
    console.log('Firebase not initialized, using demo mode');
    req.user = { uid: 'test-user-123', email: 'test@example.com' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  console.log('Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // First try Firebase token verification
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch (firebaseError) {
      console.log('Firebase token verification failed, trying JWT...');
      
      // If Firebase fails, try JWT verification (for MetaMask users)
      try {
        console.log('Trying JWT verification...');
        const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT decoded successfully:', { uid: decodedJwt.uid, authMethod: decodedJwt.authMethod });
        
        // Check if this is a MetaMask authentication
        if (decodedJwt.authMethod === 'metamask') {
          req.user = {
            uid: decodedJwt.uid,
            email: decodedJwt.email,
            authMethod: 'metamask'
          };
          console.log('MetaMask authentication successful');
          return next();
        }
        
        // If it's not MetaMask auth, fall through to error
        throw new Error('Invalid authentication method');
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError.message);
        throw new Error('Invalid token');
      }
    }
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateToken };
