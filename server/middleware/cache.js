const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 });

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    if (cachedData) {
      return res.json(cachedData);
    }

    const originalSend = res.json;
    res.json = function(data) {
      cache.set(key, data, duration);
      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = { cacheMiddleware };
