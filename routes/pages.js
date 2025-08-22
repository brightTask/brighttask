const express = require('express');
const { Hustler } = require('../models');
const checkAuthMiddleware = require('../middlewares/check-auth');
const verifyEmailToken = require('../middlewares/verifyEmailToken');
const router = express.Router();


const getHustlerIdByUserId = async (req, res, next) => {
    try {
        const { userId } = req.userData; // from checkAuthMiddleware

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const hustler = await Hustler.findOne({
            where: { userId },
            attributes: ['id']
        });

        // Attach hustlerId to request (even if null)
        req.hustlerId = hustler ? hustler.id : null;

        next(); // proceed to next middleware or route
    } catch (error) {
        console.error('Error getting Hustler ID by User ID:', error);
        res.status(500).json({ error: 'Server error while retrieving hustler ID' });
    }
};

router.get('/', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('index.html', { root: __dirname + '/../public' });
});

router.get('/verify-email', verifyEmailToken);

router.get('/groups', checkAuthMiddleware.isUser, async (req, res) => {
    res.sendFile('groups.html', { root: __dirname + '/../public' });
});

router.get('/freelancer/join', checkAuthMiddleware.isUser, async (req, res) => {
    res.sendFile('be-freelancer.html', { root: __dirname + '/../public' });
});

router.get('/categories', checkAuthMiddleware.isUser, async (req, res) => {
    res.sendFile('categories.html', { root: __dirname + '/../public' });
});

router.get('/service', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('service.html', { root: __dirname + '/../public' });
});
router.get('/category', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('category.html', { root: __dirname + '/../public' });
});
router.get('/tasks', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('tasks.html', { root: __dirname + '/../public' });
});
router.get('/order', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('order.html', { root: __dirname + '/../public' });
});
router.get('/messages', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('messages.html', { root: __dirname + '/../public' });
});

router.get('/courses', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('coursesCategories.html', { root: __dirname + '/../public' });
});

router.get('/course', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('course.html', { root: __dirname + '/../public' });
});

router.get('/class', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('class.html', { root: __dirname + '/../public' });
});

router.get('/provider/service', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('provider_service.html', { root: __dirname + '/../public' });
});

router.get('/courses/category', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('courses.html', { root: __dirname + '/../public' });
});


router.get('/profile', checkAuthMiddleware.verified, getHustlerIdByUserId, async (req, res) => {
    if (req.hustlerId) {
        res.sendFile('service-provider-dashboard.html', { root: __dirname + '/../public' });
    } else {
        res.sendFile('client-dashboard.html', { root: __dirname + '/../public' });
    }
});

router.get('/dashboard', checkAuthMiddleware.verified, getHustlerIdByUserId, async (req, res) => {
    if (req.hustlerId) {
        res.sendFile('dashboard-hustler.html', { root: __dirname + '/../public' });
    } else {
        res.sendFile('dashboard-client.html', { root: __dirname + '/../public' });
    }
});

router.get('/earning', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('earning.html', { root: __dirname + '/../public' });
});
router.get('/services', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('services.html', { root: __dirname + '/../public' });
});
router.get('/review', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('review.html', { root: __dirname + '/../public' });
});


router.get('/message', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('message.html', { root: __dirname + '/../public' });
});

router.get('/notifications', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('notification.html', { root: __dirname + '/../public' });
});
router.get('/settings', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('settings.html', { root: __dirname + '/../public' });
});
router.get('/order/auth', async (req, res) => {
    res.sendFile('order_auth.html', { root: __dirname + '/../public' });
});

router.get('/gig/add', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('add-gig.html', { root: __dirname + '/../public' });
});

router.get('/task/requests', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('my-requests.html', { root: __dirname + '/../public' });
});

router.get('/gig/requests', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('my-gig-requests.html', { root: __dirname + '/../public' });
});

router.get('/task/request', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('request.html', { root: __dirname + '/../public' });
});

router.get('/hustler/auth', async (req, res) => {
    res.sendFile('hustler-auth.html', { root: __dirname + '/../public' });
});

router.get('/order/auth', async (req, res) => {
    res.sendFile('order_auth.html', { root: __dirname + '/../public' });
});
router.get('/orders', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('orders.html', { root: __dirname + '/../public' });
});
router.get('/add', checkAuthMiddleware.admin, async (req, res) => {
    res.sendFile('add-service.html', { root: __dirname + '/../public' });
});
router.get('/blog', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('blog.html', { root: __dirname + '/../public' });
});
router.get('/chat', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('messages.html', { root: __dirname + '/../public' });
});
router.get('/gig', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('gig.html', { root: __dirname + '/../public' });
});
router.get('/gigs', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('gigs.html', { root: __dirname + '/../public' });
});
router.get('/admin/order', checkAuthMiddleware.admin, async (req, res) => {
    res.sendFile('order-admin.html', { root: __dirname + '/../public' });
});

router.get('/post', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('post.html', { root: __dirname + '/../public' });
});

router.get('/home', checkAuthMiddleware.verified, async (req, res) => {
    res.sendFile('home.html', { root: __dirname + '/../public' });
});

router.get('/logo', async (req, res) => {
    res.sendFile('assets/images/logo.png', { root: __dirname + '/../public' });
});

router.get('/logo.png', async (req, res) => {
    res.sendFile('assets/images/logo2.png', { root: __dirname + '/../public' });
});

module.exports = router;