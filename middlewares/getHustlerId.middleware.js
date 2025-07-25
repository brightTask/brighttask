const { Hustler } = require('../models');

const getHustlerIdByUserId = async (req, res, next) => {
  try {
    const { userId } = req.userData; // populated by checkAuthMiddleware

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const hustler = await Hustler.findOne({
      where: { userId },
      attributes: ['id']
    });

    if (!hustler) {
      return res.status(404).json({ message: 'Hustler not found for this user ID' });
    }

    req.hustlerId = hustler.id; // make available for future middleware/routes
    next();
  } catch (error) {
    console.error('Error getting Hustler ID by User ID:', error);
    res.status(500).json({ error: 'Server error while retrieving hustler ID' });
  }
};

module.exports = getHustlerIdByUserId;
