const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcrypt-nodejs');
const Datastore = require('nedb-promises');
const jwt = require('jsonwebtoken');
const models = require('../models');

const userRefreshTokens = Datastore.create('UserRefreshTokens.db');
const userInvalidTokens = Datastore.create('UserInvalidTokens.db');

const config = {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '7d',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
};


async function set(req, res, next) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const id = req.userId;

    if (!id) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing user ID.' });
    }

    const accessToken = jwt.sign(
        { userId: id },
        config.accessTokenSecret,
        { subject: 'accessApi', expiresIn: config.accessTokenExpiresIn }
    );

    const refreshToken = jwt.sign(
        { userId: id },
        config.refreshTokenSecret,
        { subject: 'refreshToken', expiresIn: config.refreshTokenExpiresIn }
    );

    await userRefreshTokens.insert({ refreshToken, userId: id });

    res.cookie('accessToken', accessToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
    });

    //   const isJson = req.headers.accept?.includes('application/json') || req.headers['content-type']?.includes('application/json');

    //   if (isJson) {
    return res.status(200).json({
        success: true,
        message: 'Authentification success'
    });
    //   } else {
    //     return res.redirect('/');
    //   }
}

function clear(req, res, next) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({
        message: "Logged out successfully"
    });
}

module.exports = {
    set,
    clear
};
