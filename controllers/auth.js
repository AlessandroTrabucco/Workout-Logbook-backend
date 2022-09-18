const google = require('googleapis').google;

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const SECRET = process.env.SECRET;

exports.googleMobileVerification = async (req, res, next) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID);
  const idToken = req.body.idToken;
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const response = ticket.getPayload();
    console.log(response);
    if (
      response.iss !== 'accounts.google.com' &&
      response.aud !== GOOGLE_CLIENT_ID
    ) {
      const error = new Error('Bad Request');
      error.statusCode = 422;
      throw error;
    }

    let user = await User.findOne({
      googleId: String(response.sub),
    });
    let token;

    if (!user) {
      user = new User({
        googleId: String(response.sub),
      });
      await user.save();
      token = jwt.sign(
        {
          userId: user._id,
          name: response.name,
          imageUrl: response.picture,
        },
        SECRET,
        { expiresIn: '20m' }
      );
    } else {
      token = jwt.sign(
        {
          userId: user._id,
          name: response.name,
          imageUrl: response.picture,
        },
        SECRET,
        { expiresIn: '20m' }
      );
    }

    return res.status(200).json({
      token: token,
      userId: user._id.toString(),
      name: response.name,
      imageUrl: response.picture,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
