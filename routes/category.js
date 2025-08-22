const express = require('express');
const router = express.Router();
const { Category, Service, ServiceGroup } = require('../models');
const { Op } = require('sequelize');
const upload = require('../middlewares/uploadMiddleware');

router.post('/groups', async (req, res) => {
  const { name, description, order } = req.body;
  const group = await ServiceGroup.create({ name, description, order });
  res.json(group);
});


router.post(
  '/add',
  upload.single('icon'),
  async (req, res) => {
    try {
      const { groupId, name, description, order } = req.body;

      const icon = req.file?.path;

      // Validation (optional but recommended)
      if (!name || !description || !order || !icon) {
        return res.status(400).json({ error: 'All fields including icon are required.' });
      }

      const category = await Category.create({ groupId, name, description, order, icon });
      res.status(201).json({ success: true, category });
    } catch (error) {
      console.error('Category creation error:', error);
      res.status(500).json({ success: false, error: 'Server error while creating category.' });
    }
  }
);

router.get('/groups', async (req, res) => {
  try {
    const groups = await ServiceGroup.findAll({
      attributes: ['id', 'name'],
      order: [['order', 'ASC']],
    });
    return res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching categories.',
      error: error.message
    });
  }
});


router.get('/groups/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const query = req.query.q || '';

    let whereClause = {};
    if (query) {
      whereClause.name = {
        [Op.like]: `%${query}%`
      };
    }

    const groups = await ServiceGroup.findAll({
      where: whereClause,
      limit,
      offset,
      order: [['order', 'ASC']],
      attributes: ['id', 'name', 'description'],
      include: {
        association: 'categories',
        limit: 4
      },
    });

    return res.status(200).json({
      success: true,
      data: groups,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(await Category.count({ where: whereClause }) / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching categories.',
      error: error.message
    });
  }
});

router.get('/groups/:id', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['order', 'ASC']],
    });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching categories.',
      error: error.message
    });
  }
});


router.get('/all/:id', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const query = req.query.q || '';

    let whereClause = {
      groupId: parseInt(req.params.id),
    };

    if (query) {
      whereClause.name = {
        [Op.like]: `%${query}%`,
      };
    }

    const group = await ServiceGroup.findByPk(parseInt(req.params.id));

    const categories = await Category.findAll({
      where: whereClause,
      limit,
      offset,
      order: [['order', 'ASC']],
      include: {
        model: Service,
        as: 'services'
      }
    });

    return res.status(200).json({
      success: true,
      group,
      data: categories,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(await Category.count({ where: whereClause }) / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching categories.',
      error: error.message
    });
  }
});


router.get('/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const query = req.query.q || '';

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Build service filter
    const serviceWhereClause = {
      categoryId: categoryId // Required to only show services under this category
    };

    if (query) {
      serviceWhereClause.name = {
        [Op.like]: `%${query}%`
      };
    }

    // Get filtered and paginated services
    const { rows: services, count: totalServices } = await Service.findAndCountAll({
      where: serviceWhereClause,
      limit,
      offset,
      order: [['order', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: {
        category,
        services,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalServices / limit),
          totalServices
        }
      }
    });

  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});


module.exports = router;
