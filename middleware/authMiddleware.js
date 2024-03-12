require('dotenv').config();
const jwt = require('jsonwebtoken')

// Function to extract token from cookies
const extractTokenFromCookies = function (req) {
    let accessToken = null;
    // Check if the token is present in the authorization header
    if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            accessToken = parts[1];
        }
    }
    // If token is not found in the authorization header, check the cookies
    if (!accessToken && req.cookies && req.cookies.accessToken) {
        accessToken = req.cookies.accessToken;
    }
    return accessToken;
};

// Function to decode user from token and attach it back to the request
const authenticate = function (req, res, next) {
    const token = extractTokenFromCookies(req);
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'JsonWebTokenError'){
                    res.redirect(`${process.env.AUTH_BASEURL}/auth/login`)
                }
                else if (err.name === 'TokenExpiredError') {
                    // Token expired, attach error message and refresh token to request
                    req.errorMessage = 'TokenExpired';
                    req.refreshToken = req.cookies.refreshToken;
                    next();
                } 
                else {
                    // Handle other token errors
                    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
                }
            } else {
                // Attach user to the request object
                req.user = decoded;
                res.locals.isAuthenticated = true;
                next();
            }
        });
    } else {
        // Token not found
        return res.status(401).json({ message: 'Unauthorized: Token not found' });
    }
};

module.exports = authenticate;