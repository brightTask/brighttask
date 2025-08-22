'use strict';

const {
  Hustler,
  User,
  Service,
  Task,
  Request,
  Payment,
  HustlerService
} = require('../models');
const { Op, Sequelize } = require('sequelize');
// ============================
// GET ALL HUSTLERS
// ============================
exports.getAllHustlers = async (req, res) => {
  try {
    const hustlers = await Hustler.findAll({
      include: [
        { model: User },
        {
          model: Service,
          as: 'services',
          through: {
            attributes: ['service_score', 'available']
          }
        },
        { model: Task },
        { model: Request }
      ]
    });
    res.status(200).json(hustlers);
  } catch (error) {
    console.error("Error fetching all hustlers:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// GET HUSTLER BY ID
// ============================
exports.getHustlerById = async (req, res) => {
  try {
    const id = req.params.id || req.hustlerId; // Use hustlerId from middleware if available
    if (!id) {
      return res.status(400).json({ message: 'Hustler ID is required' });
    }

    const hustler = await Hustler.findByPk(id, {
      include: [
        { model: User },
        {
          model: Service,
          as: 'services',
          through: {
            attributes: ['service_score', 'available']
          }
        },
        { model: Task },
        { model: Request }
      ]
    });

    if (!hustler) {
      return res.status(404).json({ message: 'Hustler not found' });
    }

    res.status(200).json(hustler);
  } catch (error) {
    console.error("Error fetching hustler:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// CREATE HUSTLER
// ============================
exports.createHustler = async (req, res) => {
  try {
    const { bio, portfolioUrl, location, skills } = req.body;
    const skillsMeta = JSON.parse(skills); // array of { title, fileField }

    const enrichedSkills = skillsMeta.map((s) => {
      const file = req.files.find(f => f.fieldname === s.fileField);
      return {
        title: s.title,
        supportiveDoc: file ? file.path : null
      };
    });

    const userId = req.userData.userId;

    const hustlerExists = await Hustler.findOne({ where: { userId } });
    if (hustlerExists) {
      return res.status(400).json({ message: 'Hustler profile already exists for this user.' });
    }

    const hustler = await Hustler.create({
      userId,
      bio,
      isVerified: false,
      portfolioUrl,
      location,
      skills: enrichedSkills,
      rating: 0 // Default rating
    });

    res.status(201).json({
      message: "Hustler profile created successfully",
      hustler
    });
  } catch (error) {
    console.error("Create Hustler Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// ADD HUSTLER SERVICES
// ============================
exports.addHustlerServices = async (req, res) => {
  try {
    const hustlerId = req.hustlerId;
    const { serviceIds } = req.body;

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ message: "Services array is required." });
    }

    const insertData = serviceIds.map(id => ({
      hustlerId,
      serviceId: id,
      service_score: 0,
      available: false
    }));

    await HustlerService.bulkCreate(insertData);

    res.status(200).json({
      message: "Services added successfully.",
    });
  } catch (error) {
    console.error("Add Hustler Services Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// UPDATE HUSTLER
// ============================
exports.updateHustler = async (req, res) => {
  try {
    const id = req.hustlerId;
    const userId = req.userData.userId;
    const {
      bio,
      isVerified,
      portfolioUrl,
      location,
      rating,
      services
    } = req.body;

    const hustler = await Hustler.findByPk(id);

    if (!hustler) {
      return res.status(404).json({ message: 'Hustler not found' });
    }

    if (hustler.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    await hustler.update({
      bio,
      isVerified,
      portfolioUrl,
      location,
      rating
    });

    if (Array.isArray(services)) {
      await hustler.setServices(services); // Updates join table (not scores)
    }

    res.status(200).json({
      message: 'Hustler updated successfully',
      hustler
    });
  } catch (error) {
    console.error("Update Hustler Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// DELETE HUSTLER
// ============================
exports.deleteHustler = async (req, res) => {
  try {
    const id = req.hustlerId;
    const userId = req.userData.userId;

    const hustler = await Hustler.findByPk(id);

    if (!hustler) {
      return res.status(404).json({ message: 'Hustler not found' });
    }

    if (hustler.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this profile' });
    }

    await hustler.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Delete Hustler Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.gethustlerDashboard = async (req, res) => {
  try {
    const hustlerId = req.hustlerId || req.query.hustlerId || req.params.hustlerId;

    if (!hustlerId) {
      return res.status(400).json({ message: "Missing hustlerId in request." });
    }

    const hustler = await Hustler.findByPk(hustlerId, {
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*) 
              FROM Tasks AS t 
              WHERE t.hustlerId = Hustler.id
            )`),
            'totalTasks'
          ],
          [
            Sequelize.literal(`(
    SELECT COUNT(DISTINCT t.gigId) 
    FROM Tasks AS t 
    WHERE t.hustlerId = Hustler.id
  )`),
            'totalClients'
          ],
          [
            Sequelize.literal(`(
              SELECT COALESCE(SUM(p.netAmount), 0)
              FROM Payments AS p
              INNER JOIN Tasks AS t ON t.id = p.taskId AND p.taskType = 'task'
              WHERE t.hustlerId = Hustler.id
            )`),
            'totalEarnings'
          ],
          [
            Sequelize.literal(`(
    SELECT JSON_OBJECT(
      'labels', JSON_ARRAYAGG(DATE_FORMAT(months.month, '%Y-%m')),
      'data', JSON_ARRAYAGG(COALESCE(month_earnings.total, 0))
    )
    FROM (
      SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL n MONTH), '%Y-%m-01') AS month
      FROM (
        SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      ) AS nums
    ) AS months
    LEFT JOIN (
      SELECT 
        DATE_FORMAT(p.createdAt, '%Y-%m') AS payment_month,
        SUM(p.netAmount) AS total
      FROM Payments AS p
      INNER JOIN Tasks AS t ON t.id = p.taskId AND p.taskType = 'task'
      WHERE t.hustlerId = Hustler.id
        AND p.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY payment_month
    ) AS month_earnings
    ON DATE_FORMAT(months.month, '%Y-%m') = month_earnings.payment_month
  )`),
            'earnings'
          ]

        ]
      },
      include: [
        {
          association: 'user', // assuming this relation exists
        },
        {
          association: 'tasks',
          include: {
            association: 'gig',
            include: {
              association: 'Client',
              attributes: ['username'],
            },
            attributes: ['title']
          },
          limit: 5,
          order: [['createdAt', 'DESC']],
        }
      ]
    });

    if (!hustler) {
      return res.status(404).json({ message: "Hustler not found." });
    }

    return res.status(200).json(hustler);

  } catch (error) {
    console.error('Error in gethustlerDashboard:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTasks = async (req, res) => {

  const hustlerId = req.hustlerId || req.query.hustlerId || req.params.hustlerId;

  const tasks = await Task.findAll({
    where: {
      hustlerId
    },
    include: {
      association: 'gig',
      include: {
        association: 'Client',
        attributes: ['username'],
      },
      attributes: ['title']
    },
    order: [['createdAt', 'DESC']],
  })

  res.json(tasks)
}

exports.getServices = async (req, res) => {

  const hustlerId = req.hustlerId || req.query.hustlerId || req.params.hustlerId;

  const hustler = await Hustler.findByPk(hustlerId, {
    include: {
      association: 'services',
      through: {
        model: HustlerService,
        attributes: ['id', 'service_score', 'available']
      },
      include: {
        association: 'category',
        attributes: ['name']
      },
      attributes: ['id', 'name', 'icon', 'description', 'price', 'priceUnit']
    }
  });

  res.json(hustler.services);
}

exports.available = async (req, res) => {
  const serviceId = parseInt(req.query.id);
  console.log('Toggle availability for ID:', serviceId);

  try {
    const service = await HustlerService.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({
        error: 'Service not found',
        id: serviceId
      });
    }

    const newAvailability = !service.available;

    await HustlerService.update(
      { available: newAvailability },
      { where: { id: serviceId } }
    );

    return res.json({
      success: true,
      message: `Service is now ${newAvailability ? 'available' : 'unavailable'}`,
      available: newAvailability
    });

  } catch (error) {
    console.error('Error toggling availability:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.delete = async (req, res) => {
  const serviceId = parseInt(req.query.id);
  console.log('Delete request for ID:', serviceId);

  try {
    const service = await HustlerService.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found', id: serviceId });
    }

    await service.destroy(); // Hard delete

    return res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
