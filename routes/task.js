const express = require('express');

const router = express.Router();

const getHustlerIdByUserId = require('../middlewares/getHustlerId.middleware');
const checkAuthMiddleware = require('../middlewares/check-auth');

router.get('/assign', require('../controllers/task.controller').asignTasks);
router.post('/request', checkAuthMiddleware.isUser, getHustlerIdByUserId, require('../controllers/task.controller').postRequest);
router.get('/requests', checkAuthMiddleware.isUser, getHustlerIdByUserId, require('../controllers/task.controller').getRequests);

module.exports = router;