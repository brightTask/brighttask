const express = require('express');
const router = express.Router();

const hustlerController = require('../controllers/hustler.controller');
const checkAuthMiddleware = require('../middlewares/check-auth');
const getHustlerIdByUserId = require('../middlewares/getHustlerId.middleware');
const upload = require('../middlewares/uploadMiddleware');

// Protect routes and inject hustler ID
router.get('/', checkAuthMiddleware.isUser, hustlerController.getAllHustlers);
router.get('/:id', checkAuthMiddleware.isUser, getHustlerIdByUserId, hustlerController.getHustlerById);
router.get('/dashboard/get', checkAuthMiddleware.isUser, getHustlerIdByUserId, hustlerController.gethustlerDashboard);
router.get('/dashboard/tasks', checkAuthMiddleware.isUser, getHustlerIdByUserId, hustlerController.getTasks);
router.get('/dashboard/services', checkAuthMiddleware.isUser, getHustlerIdByUserId, hustlerController.getServices);
router.put('/dashboard/services/available', checkAuthMiddleware.isUser, getHustlerIdByUserId, hustlerController.available);
router.delete('/dashboard/services', checkAuthMiddleware.isUser, getHustlerIdByUserId, hustlerController.delete);
router.post('/', checkAuthMiddleware.isUser, upload.any(), hustlerController.createHustler);
router.post('/services/add', checkAuthMiddleware.isUser,getHustlerIdByUserId, hustlerController.addHustlerServices);
router.put('/', checkAuthMiddleware.isUser, getHustlerIdByUserId, hustlerController.updateHustler);
router.delete('/', checkAuthMiddleware.isUser, getHustlerIdByUserId, hustlerController.deleteHustler);

module.exports = router;
