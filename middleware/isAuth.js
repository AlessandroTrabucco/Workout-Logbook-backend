const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET;

module.exports = (req, res, next) => {
  const authheader = req.get('Authorization');
  if (!authheader) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  let decodedToken;
  try {
    const token = authheader.split(' ')[1];

    if (!token) {
      const error = new Error('Not authenticated');
      error.statusCode = 401;
      throw error;
    }

    decodedToken = jwt.verify(token, SECRET);
  } catch (err) {
    if (!err.statusCode) {
      err.message = 'Not authenticated';
      err.statusCode = 401;
    }
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};
