const { Op, where } = require('sequelize');
const {
  Task,
  Hustler,
  User,
  Service,
  Gig,
  Request,
  Notification,
} = require('../models');

exports.asignTasks = async (req, res) => {
  try {
    const gigs = await Gig.findAll({
      include: [
        { model: Task, as: 'task' },
        { model: Service, as: 'service' },
      ],
    });

    const tasks = [];
    const unassigned = gigs.filter((o) => !o.task);

    for (const gig of unassigned) {
      const requests = await Request.findAll({
        where: { gigId: gig.id },
      });

      // Case 1: No requests exist yet — notify providers
      if (!requests || requests.length === 0) {
        await notifyAvailableProviders(gig);
        continue;
      }

      let assigned = false;
      let alreadyRejectedIds = [];

      while (!assigned) {
        // Fetch best next available provider (excluding those already rejected)
        const hustler = await Hustler.findOne({
          where: {
            id: { [Op.notIn]: alreadyRejectedIds },
          },
          include: [
            {
              model: Request,
              as: 'requests',
              where: {
                status: 'under-review',
                gigId: gig.id,
              },
              required: true,
            },
            {
              model: Task,
              as: 'tasks',
            },
            {
              model: Service,
              as: 'services',
              through: {                
              where: {
                serviceId: gig.serviceId,
                available: true,
              },
                 attributes: ['service_score'] }
            },
          ],
          order: [services.through['service_score', 'DESC']],
        });

        // If no more providers, re-notify everyone again
        if (!hustler) {
          await notifyAvailableProviders(gig);
          break;
        }

        const hasPendingTasks = hustler.tasks.some(
          (t) => t.status !== 'completed'
        );

        const requestToUpdate = hustler.requests[0];

        if (!requestToUpdate) {
          alreadyRejectedIds.push(hustler.id);
          continue;
        }

        if (hasPendingTasks) {
          // Reject and try next
          await Request.update(
            {
              status: 'rejected',
              note: 'Please complete your previous task before applying again.',
            },
            {
              where: { id: requestToUpdate.id },
            }
          );

          // Notify the hustler about rejection
          await Notification.create({
            target_id: hustler.userId,
            type: 'task',
            title: 'Task Application Rejected',
            message: 'You have been rejected for this task due to pending tasks.',
          });

          alreadyRejectedIds.push(hustler.id);
        } else {
          // Accept this one
          await Request.update(
            {
              status: 'accepted',
              note: 'Please accept the task in the next 24 hours.',
            },
            {
              where: { id: requestToUpdate.id },
            }
          );
          // Notify the hustler about acceptance
          await Notification.create({
            target_id: hustler.userId,
            type: 'task',
            title: 'Task Application Accepted',
            message: `You have been accepted for the task: ${gig.title}. Please complete it within the deadline.`,
          });


          tasks.push({
            gigId: gig.id,
            assignedTo: hustler.userId,
            accepted: true,
          });

          assigned = true;
        }
      }
    }

    res.json({ success: true, assigned: tasks });
  } catch (err) {
    console.error('Error assigning tasks:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// 🔁 Helper function to notify all available providers for the service
async function notifyAvailableProviders(gig) {
const hustlers = await Hustler.findAll({
  include: [{
    model: Service,
    as: 'services',
    required: true, // <-- ensures only Hustlers with matching services are returned
    through: {
      where: {
        serviceId: gig.serviceId,
        available: true, // Only notify those with the service available
      },
      attributes: ['service_score']
    }
  }]
});

  const notifications = hustlers.map((h) => ({
    target_id: h.userId,
    type: 'task',
    title: 'New Task Posted',
    message: `${gig.service.name} task posted. Go to tasks and apply. Ensure you have a good score to increase your chance of getting the task.`,
  }));

  if (notifications.length > 0) {
    await Notification.bulkCreate(notifications);
  }
}


exports.getTasks = async (req, res) => {
  const gigs = await Gig.findAll({
    include: {
      model: Task,
      as: 'task',      
    where: { status: req.params.status },
    require: true
    }
  });


  res.json(gigs);
}

exports.postRequest = async (req, res) => {
  const { gigId, note } = req.body;
  const hustlerId = req.hustlerId

  console.log('Hustler ID:', hustlerId);
  console.log('Gig ID:', gigId);


  try {
    // Check if the user has already requested this gig
    const existingRequest = await Request.findOne({
      where: {
        gigId,
        hustlerId,
      },
    });

    if (existingRequest) {
      return res.status(400).json({id: existingRequest.id, message: 'You have already requested this gig.' });
    }

    // Create a new request
    const request = await Request.create({
      gigId,
      hustlerId,
      note,
      status: 'under-review',
    });

    // Notify the hustler about the new request
    const gig = await Gig.findByPk(gigId);

    const hustler = await Hustler.findByPk(hustlerId, {
    });

    await Notification.create({
      target_id: gig.clientId,
      source_id: hustler.userId,
      type: 'task',
      title: 'New Task Request',
      message: `A new request has been made for your task "${gig.title}".`,
    });

    res.status(201).json({ message: 'Request Sent successfully', request,  });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { hustlerId: req.hustlerId },
      include: [
        {
          model: Gig,
          as: 'gig',
          include: [
            {
              model: Service,
              as: 'service',
            },
            {
              model: User,
              as: 'Client',
              attributes: ['id', 'first_name', 'last_name', 'profile_pic'],
            },
          ],
        },
      ],
    });

    const requestsData = requests.map((request) => ({
      id: request.id,
      gigId: request.gigId,
      hustlerId: request.hustlerId,
      message: request.note,
      status: request.status,
      requestedAt: request.createdAt,
      gig: request.gig.service.name,
      gigTitle: request.gig.title,
      gigDescription: request.gig.description,
      gigLocation: request.gig.location,
      gigPostedAt: request.gig.createdAt,
      clientId: request.gig.clientId,
      serviceId: request.gig.serviceId,
      clientName: `${request.gig.Client.first_name} ${request.gig.Client.last_name}`,
      clientProfilePic: request.gig.Client.profile_pic,
    }));

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};