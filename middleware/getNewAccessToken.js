const axios = require('axios')
require('dotenv').config();

const getNewAccessToken = async (req, res, next) => {
  // Generate a new access token using the refresh token
  const newAccessToken = await axios.get(`${process.env.AUTH_BASEURL}/auth/newAccessToken`, {
    headers: {
      'Authorization': `Bearer ${req.refreshToken}`,
    }
  })

  // Update the cookies with the new access token
  res.cookie('accessToken', newAccessToken.data, { httpOnly: true, secure: true });

  res.locals.isAuthenticated = true;
  next();
}

module.exports = getNewAccessToken
