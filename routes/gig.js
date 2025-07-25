const express = require('express');
const gigController = require('../controllers/gig.controller');
const checkAuthMiddleware   = require('../middlewares/check-auth');
//const { auth } = require('../auth');
const router = express.Router();

// Import the gig controller

// Example routes connected to controller methods
router.get('/', checkAuthMiddleware.isUser, gigController.getGigs);
router.get('/:id', checkAuthMiddleware.isUser, gigController.getGigById);
router.get('/requests/all', checkAuthMiddleware.isUser, gigController.getMyGigsRequest);
router.patch('/request/update', checkAuthMiddleware.isUser, gigController.updaterequest);
router.post('/add', checkAuthMiddleware.isUser, gigController.addGig);
router.post('/pay', checkAuthMiddleware.isUser, gigController.createPayment);
router.put('/update', checkAuthMiddleware.admin, gigController.updateGig);

module.exports = router;