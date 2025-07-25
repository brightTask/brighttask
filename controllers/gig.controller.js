const { assign } = require('nodemailer/lib/shared');
const { Gig, User, Service, Hustler, Task, Payment, Request, Notification } = require('../models');
const { Op, where } = require('sequelize');

//const payGig = require('../pay')
// Create a new gig

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
        message: `task posted. Go to tasks and apply. Ensure you have a good score to increase your chance of getting the task.`,
    }));

    if (notifications.length > 0) {
        await Notification.bulkCreate(notifications);
    }
}

exports.addGig = async (req, res) => {
    try {
        const data = await req.userData;
        const clientId = data.userId;
        let gigData = req.body;

        // ✅ Convert to correct types or null
        const parseNumber = (val) => val === '' || val == null ? null : Number(val);
        const parseBoolean = (val) => val === 'true' || val === true;
        gigData.requirements = gigData.requirements !== "" ? JSON.parse(gigData.requirements || '[]') : null;
        gigData.requirements = gigData.requirements ? JSON.stringify(gigData.requirements) : null;
        gigData.hustlerId = parseNumber(gigData.hustlerId);
        gigData.serviceId = parseNumber(gigData.serviceId);
        gigData.budgetMin = parseNumber(gigData.budgetMin);
        gigData.budgetMax = parseNumber(gigData.budgetMax);
        gigData.isRemote = parseBoolean(gigData.isRemote);
        gigData.clientId = clientId;
        gigData.deadline = gigData.deadline !== "" ? gigData.deadline : null;
        gigData.note = gigData.note !== "" ? gigData.note : null;
        gigData.visibility = gigData.hustlerId ? 'private' : 'public';


        const serviceId = parseInt(gigData.serviceId, 10);

        let gig = await Gig.findOne({
            where: {
                clientId,
                serviceId
            },
            include: [
                {
                    model: Task,
                    as: 'task',
                    required: false
                }
            ]
        });

        // If no gig exists, or if the existing gig has already been assigned a task,
        if (!gig || gig.task) {
            gig = await Gig.create(gigData);
        }

        if (gigData.hustlerId) {

            const hustler = await Hustler.findByPk(gigData.hustlerId);

            await Notification.create({
                target_id: hustler.userId,
                source_id: clientId,
                type: 'task',
                title: `You have new Task Request`,
                message: `Your Task RequestWork on your service score and try other tasks.`,
            });
        } else {
            await notifyAvailableProviders(gig);
        }

        // Check if the request expects JSON (fetch, AJAX, etc.)
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json({
                message: 'Gig created successfully',
                gig
            });
        }

        // Otherwise assume it's a form POST
        return res.redirect(`/task/request?id=${gig.id}`);
        //return res.json(gigData);


    } catch (err) {

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ message: 'Failed to create gig' });
        }

        return res.status(500).render('gig-form', {
            errorMessage: 'Something went wrong. Please try again.',
            formData: req.body
        });
    }
};


exports.createPayment = async (req, res) => {
    try {
        const data = await req.userData;
        const userId = data.userId;
        let { gigId, amount, method } = req.body;

        let status = '';

        const gig = await Gig.findByPk(gigId, {
            include: [
                {
                    model: Task,
                    as: 'task',
                    include: [
                        {
                            model: Payment,
                            as: 'payment'
                        }
                    ]
                },
                {
                    model: Service,
                    as: 'service',
                }
            ]
        });

        if (!gig) return res.status(404).json({ error: 'gig not found' });

        if (!amount) {
            const totalPaid = (gig.task.payment || []).reduce((sum, p) => sum + parseFloat(p.amount), 0);
            // You need to include service model in gig to use gig.service.price
            const servicePrice = parseFloat(gig.service?.price || 0);
            amount = servicePrice - totalPaid;
        }

        status = 'pending';

        await Payment.create({
            taskId: gig.task.id,
            amount,
            fee: 0,
            netAmount: amount,
            status
        });

        // await payGig(amount, gig.task.id, userId, method);
        return res.json({ message: 'payment Initiated' });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
};

// Get all gigs
exports.getGigs = async (req, res) => {
    try {
        const gigs = await Gig.findAll();
        res.json(gigs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGigs = async (req, res) => {
    try {
        const gigs = await Gig.findAll();
        res.json(gigs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single gig by ID
exports.getGigById = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const gig = await Gig.findByPk(req.params.id, {
            include: [
                { model: Service, as: 'service' },
                { model: User, as: 'Client' },
                {
                    model: Task,
                    as: 'task',
                    include: [
                        {
                            model: Payment,
                            as: 'payments'
                        },
                        {
                            model: Hustler,
                            as: 'hustler',
                            include: [
                                {
                                    model: User,
                                    as: 'user',
                                    attributes: ['first_name', 'last_name', 'profile_pic', 'phone', 'email']
                                }
                            ]
                        }
                    ]
                },
            ]
        });

        if (!gig) return res.status(404).json({ error: 'gig not found' });


        // Calculate gig balance
        const taskPrice = parseFloat(gig.task?.price || 0);
        const totalPaid = (gig.task && gig.task.payment)
            ? gig.task.payment.reduce((sum, p) => sum + parseFloat(p.amount), 0)
            : 0;
        const balance = taskPrice - totalPaid;

        const gigData = {
            id: gig.id,
            title: gig.title,
            description: gig.description,
            note: gig.note,
            budgetMin: gig.budgetMin,
            budgetMax: gig.budgetMax,
            isRemote: gig.isRemote,
            deadline: gig.deadline,
            requirements: gig.requirements,
            location: gig.location,
            placedAt: gig.createdAt,
            service: gig.service?.name || null,
            serviceId: gig.serviceId,
            user: gig.Client ? `${gig.Client.first_name} ${gig.Client.last_name}` : null,
            phone: gig.Client?.phone || null,
            profile_picture: gig.Client?.profile_pic || null,
            email: gig.Client?.email || null,
            clientId: gig.clientId,
            myGig: gig.clientId === userId,
            ...gig.task ? {
                assigned: true,
                ...(gig.clientId === userId || gig.task.hustler.user.id === userId) ? {
                    assignedAt: gig.task.createdAt,
                    myTask: gig.task.hustler.user.id === userId,
                    balance: `${balance}`,
                    taskId: gig.task.id,
                    status: gig.task.status,
                    ...(gig.clientId === userId) ? {
                        assignedTo: {
                            id: gig.task.hustler.user.id,
                            name: `${gig.task.hustler.user.first_name} ${gig.task.hustler.user.last_name}`,
                            profile_pic: gig.task.hustler.user.profile_pic,
                            phone: gig.task.hustler.user.phone,
                            email: gig.task.hustler.user.email
                        }
                    } : {}
                } : {},
            } : {
                assigned: false,
            }
        };

        res.json(gigData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


// Update an Gig Step by ID
exports.updateGig = async (req, res) => {
    try {
        const { taskId, progress } = req.body;

        if (!taskId) {
            return res.status(400).json({ error: 'taskId is required' });
        }

        const updateData = {};
        if (progress) updateData.status = progress;

        console.log(updateData);
        const [updated] = await Task.update(updateData, {
            where: { id: parseInt(taskId) }
        });

        if (updated === 0) {
            return res.status(404).json({ error: 'Task not found or no changes made' });
        }

        res.json({ message: "success" });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getMyGigsRequest = async (req, res) => {
    try {
        const data = await req.userData;
        const userId = data.userId;

        const requests = await Request.findAll({
            include: [
                {
                    model: Gig,
                    as: 'gig',
                    where: {
                        clientId: userId
                    },
                    required: true,
                    include: [
                        {
                            model: Service,
                            as: 'service'
                        },
                    ],
                },
                {
                    model: Hustler,
                    as: 'hustler',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['first_name', 'last_name', 'profile_pic', 'phone', 'email']
                        }
                    ]
                }
            ],
        })

        const requestsData = requests.map((request) => ({
            id: request.id,
            gigId: request.gigId,
            message: request.note,
            status: request.status,
            requestedAt: request.createdAt,
            gig: request.gig.service.name,
            gigTitle: request.gig.title,
            gigDescription: request.gig.description,
            gigLocation: request.gig.location,
            gigPostedAt: request.gig.createdAt,
            hustlerId: request.hustlerId,
            serviceId: request.gig.serviceId,
            hustlerName: `${request.hustler.user.first_name} ${request.hustler.user.last_name}`,
            hustlerProfilePic: request.hustler.user.profile_pic,
        }));

        res.json(requestsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updaterequest = async (req, res) => {
    const { requestId, status } = req.query;

    try {
        const result = await Request.findByPk(requestId);

        if (!result) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const hustler = await Hustler.findByPk(result.hustlerId);
        const gig = await Gig.findByPk(result.gigId);

        if (!hustler || !gig) {
            return res.status(400).json({ message: 'Invalid hustler or gig associated with this request' });
        }

        // Prevent self-assignment (client trying to accept own request)
        if (hustler.userId === gig.clientId) {
            return res.status(403).json({ message: 'Cannot process own request' });
        }

        // If hustler is performing the action
        if (hustler.userId === req.userData.userId) {
            if (status !== 'cancelled') {
                return res.status(403).json({ message: 'You can only cancel requests' });
            }

            result.status = status;
            await result.save();

            return res.status(200).json({ message: `Request ${status}`, request: result });
        }

        // If client is performing the action
        if (gig.clientId === req.userData.userId) {
            if (status !== 'accepeted' && status !== 'rejected') {
                return res.status(403).json({ message: 'Clients can only accept or reject requests' });
            }

            result.status = status;
            await result.save();

            const action = status === 'accepeted' ? 'Accepted' : 'Rejected';

            await Notification.create({
                target_id: hustler.userId,
                source_id: gig.clientId,
                type: 'task',
                title: `Task Request ${action}`,
                message: `Your Task Request on "${gig.title}" has been ${action}. Work on your service score and try other tasks.`,
            });

            return res.status(200).json({ message: `Request ${action}`, request: result });
        }

        return res.status(403).json({ message: 'Unauthorized to update this request' });

    } catch (error) {
        console.error('Update request error:', error);
        return res.status(500).json({ message: 'Server error updating request' });
    }
};

