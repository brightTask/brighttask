const express = require('express');
const router = express.Router();

const clientController = require('../controllers/client.controller');
const checkAuthMiddleware = require('../middlewares/check-auth');
const getHustlerIdByUserId = require('../middlewares/getHustlerId.middleware');

router.get('/dashboard/get', checkAuthMiddleware.check, clientController.getClientDashboard);
router.get('/dashboard/gigs', checkAuthMiddleware.check, clientController.getClientGigs);

module.exports = router;
