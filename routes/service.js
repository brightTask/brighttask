const express = require('express');
const serviceController = require('../controllers/service.controller');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Example route connected to controller
//router.get('/', serviceController.getAllServices);
router.post('/', upload.single('icon'), serviceController.addService);
router.get('/:id', serviceController.getServiceById);
router.get('/', serviceController.gethustlerService);

module.exports = router;