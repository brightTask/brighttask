const { Hustler } = require('../models');

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

module.exports = getHustlerIdByUserId;
