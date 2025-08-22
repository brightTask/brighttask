const express = require('express');
const router = express.Router();

const checkAuthMiddleware = require('../middlewares/check-auth');
const clases = require('../classes');

// Protect routes and inject hustler ID
router.get('/', checkAuthMiddleware.isUser, async(req, res) => {
    
    const page = req.query.page || 1;
    const data = await req.userData;
    const userId = data?.userId || null;
        const notifications = await clases.AllNotification.getNotification(userId, page, 10);
        return res.json(notifications);
    
});

module.exports = router;
