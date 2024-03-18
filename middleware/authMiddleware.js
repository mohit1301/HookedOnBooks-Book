require('dotenv').config();
const jwt = require('jsonwebtoken')

// Function to extract token from cookies
const extractTokens = function (req, res) {
    let accessToken = null;
    let refreshToken = null;

    // Check if the tokens are present in the query string
    if (req.query.accessToken && req.query.refreshToken) {
        accessToken = Buffer.from(decodeURIComponent(req.query.accessToken), 'base64').toString();
        refreshToken = Buffer.from(decodeURIComponent(req.query.refreshToken), 'base64').toString();
    }

    // Check if the tokens are present in the authorization header
    if (req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            accessToken = parts[1];
        }
    }

    // If tokens are not found in the authorization header, check the cookies
    if (req.cookies && req.cookies.accessToken) {
        accessToken = req.cookies.accessToken;
        refreshToken = req.cookies.refreshToken;
    }

    if(res.locals.accessToken){

        accessToken = res.locals.accessToken
        refreshToken = res.locals.refreshToken
    }

    return { accessToken, refreshToken };
};

// Function to decode user from token and attach it back to the request
const authenticate = function (req, res, next) {
    const { accessToken, refreshToken } = extractTokens(req, res);
    if (accessToken) {
        jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'JsonWebTokenError') {
                    res.redirect(`${process.env.AUTH_BASEURL}/auth/login`)
                }
                else if (err.name === 'TokenExpiredError') {
                    // Token expired, attach error message and refresh token to request
                    req.errorMessage = 'TokenExpired';
                    req.refreshToken = refreshToken;
                    next();
                }
                else {
                    // Handle other token errors
                    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
                }
            } else {
                // Attach user to the request object
                req.user = decoded;
                req.accessToken = accessToken
                req.refreshToken = refreshToken
                res.cookie('accessToken', accessToken)
                res.cookie('refreshToken', refreshToken)

                res.locals.authorBaseUrl = process.env.AUTHOR_BASEURL
                res.locals.booksBaseUrl = process.env.BOOKS_BASEURL
                res.locals.authBaseUrl = process.env.AUTH_BASEURL
                res.locals.accessToken = accessToken
                res.locals.refreshToken = refreshToken
                res.locals.isAuthenticated = true;
                next();
            }
        });
    } else {
        // Token not found
        res.status(401).json({ message: 'Unauthorized: Token not found' });
    }
};

module.exports = authenticate