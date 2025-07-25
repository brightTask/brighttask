const express = require('express');
const router = express.Router();
const { getposts, getpost, post, getRelated } = require('../controllers/post.controller');
const checkAuthMiddleware = require('../middlewares/check-auth');
const upload = require('../middlewares/uploadMiddleware');
const getHustlerIdByUserId = require('../middlewares/getHustlerId');

router.post(
  '/',
  checkAuthMiddleware.check,
  upload.fields([{ name: 'media', maxCount: 10 }]),
  post
);
router.get('/related', checkAuthMiddleware.check, getHustlerIdByUserId, getRelated);

router.get('/', checkAuthMiddleware.check, getposts);
router.get('/:post_id', checkAuthMiddleware.check, getpost);

module.exports = router;

