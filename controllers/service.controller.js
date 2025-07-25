const { Association, where } = require('sequelize');
const { Service, Category, Hustler, HustlerService, User } = require('../models');
const service = require('../models/service');

exports.addService = async (req, res) => {
  try {
    const {
    name,
    description,
    price,
    priceUnit,
    order,
    categoryId,
    requirements,
  } = req.body;

    const icon = req.file?.path;
    // Validate category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create the service
    const newService = await Service.create({
    name,
    description,
    price,
    priceUnit,
    order,
    categoryId,
    requirements,
    icon
  });

    res.status(201).json({
      message: 'Service created successfully',
      service: newService,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create service',
      error: error.message,
    });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: Hustler,
          as: 'serviceProviders',
          through: {
            model: HustlerService,
            attributes: ['service_score', 'available', 'requirements'],
          },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profile_pic'],
            }
          ],
        }
      ]
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ service });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      message: 'Failed to fetch service',
      error: error.message,
    });
  }
};



exports.gethustlerService = async (req, res) => {
  try {
    const { serviceId, userId } = req.query;

    if (!userId || !serviceId) {
      return res.status(400).json({ message: "Missing serviceId or userId in query." });
    }

    const hustler = await Hustler.findOne({
      where: { userId },
      include: [
        {
          association: 'user', // Basic user profile data
          attributes: ['id', 'username', 'email', 'profile_pic']
        },
        {
          association: 'services',
          include: [
            {
              association: 'category', // Basic user profile data
              attributes: ['id', 'name']
            },
          ],
          where: { id: serviceId },
          required: true,
          through: {
            model: HustlerService
          },
        }
      ]
    });

    if (!hustler || hustler.services.length === 0) {
      return res.status(404).json({ message: "Hustler service not found." });
    }

    const service = hustler.services[0];

    // Calculate average rating

    const response = {
      hustlerId: hustler.id,
      name: hustler.user.username,
      email: hustler.user.email,
      profile_pic: hustler.user.profile_pic,
      rating: hustler.rating,
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        // category: service.category,
        icon: service.icon,
      }
    };

    return res.status(200).json(hustler);

  } catch (error) {
    console.error('Error in gethustlerService:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

