const express = require('express');
const userController = require('../controllers/user.controller');
const checkAuthMiddleware   = require('../middlewares/check-auth');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();
const cookie = require('../middlewares/set_cookie.js');

const { User } = require('../models');

const sendVerificationEmailMiddleware = require('../middlewares/sendVerificationEmail');

router.post('/register', checkAuthMiddleware.isUser, upload.single('media'), userController.signUp, sendVerificationEmailMiddleware, cookie.set);
router.get('/', checkAuthMiddleware.check, async (req, res) => {
    res.sendFile('user.html', { root: __dirname + '/../public' });
});
router.get('/settings', checkAuthMiddleware.check, async (req, res) => {
    res.sendFile('settings.html', { root: __dirname + '/../admin' });
});

router.get('/check-verification', checkAuthMiddleware.isUser, async (req, res) => {
  const id = await req.userData?.userId;

  if (!id) {
    return res.status(400).json({ success: false, message: 'User Not Found' });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ success: false, message: 'Email not verified.' });
    }

    return res.status(200).json({ success: true, message: 'Email verified.' });

  } catch (err) {
    console.error('Verification check error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}, cookie.set);


router.get('/user', checkAuthMiddleware.check, userController.show);
router.get('/resend-verification', checkAuthMiddleware.check, sendVerificationEmailMiddleware, async(req, res) => {
      return res.status(200).json({
      success: true,
      message: 'Verification Email Sent'
    });
});

router.get('/user/:id', checkAuthMiddleware.check, userController.findUser);
router.get('/users', checkAuthMiddleware.check, userController.all);
router.put('/updateRole', checkAuthMiddleware.check, userController.bulkUpdateUsers);
router.get('/team', userController.team);
router.delete('/delete', checkAuthMiddleware.isUser, userController.deleteAccount);
router.get('/be_admin', checkAuthMiddleware.isUser, userController.beAdmin);
router.get('/admin', checkAuthMiddleware.admin, userController.admin);
router.put('/update', checkAuthMiddleware.isUser,upload.single('media'), userController.update);
router.put('/update/password', checkAuthMiddleware.isUser, userController.changePassword);
router.post('/login', checkAuthMiddleware.isUser, userController.login, cookie.set);
router.post('/follow', checkAuthMiddleware.isUser, userController.toggleFollow);
router.post('/logout', checkAuthMiddleware.isUser, userController.logout);


module.exports = router;