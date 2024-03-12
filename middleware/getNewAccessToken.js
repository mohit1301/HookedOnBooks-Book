const axios = require('axios')

const getNewAccessToken = async (req, res, next) => {
  // Generate a new access token using the refresh token
  const newAccessToken = await axios.get('http://localhost:3002/auth/newAccessToken', {
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
