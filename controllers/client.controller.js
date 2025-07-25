const {
    User,
    Gig,
    Task
} = require('../models');
const { Sequelize } = require('sequelize');
function timeAgo(time) {
    const now = new Date();
    const past = new Date(time);
    const seconds = Math.floor((now - past) / 1000);
    const daysDiff = Math.floor(seconds / 86400);

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (seconds < 60) {
        return 'just now';
    } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    } else if (seconds < 86400) {
        const hrs = Math.floor(seconds / 3600);
        return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    } else if (daysDiff < 7 && past.getWeekNumber() === now.getWeekNumber()) {
        return weekdays[past.getDay()];
    } else {
        return past.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
exports.getClientDashboard = async (req, res) => {
    try {
        const data = await req.userData;
        if (!data) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const id = data.userId;

        // Get user info with project counts
        const user = await User.findByPk(id, {
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Tasks AS t
                            INNER JOIN Gigs AS g ON g.id = t.gigId
                            WHERE t.status = 'in_progress' AND g.clientId = User.id
                        )`),
                        'activeProjects'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Tasks AS t
                            INNER JOIN Gigs AS g ON g.id = t.gigId
                            WHERE t.status = 'completed' AND g.clientId = User.id
                        )`),
                        'completedProjects'
                    ]
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Fetch 5 most recent gigs by this user
        const recentGigs = await Gig.findAll({
            where: { clientId: id },
                attributes: ['id','title', 'createdAt'],
            include: {
                association: 'task',
                include: {
                    association: 'hustler',
                    include: {
                        association: 'user',
                        attributes: ['username'],
                    },
                    attributes: ['id'],
                },
                attributes: ['status']
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.status(200).json({
            id: user.id,
            username: user.username,
            full_name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            phone: user.phone,
            profile_pic: user.profile_pic,
            verified: user.verified,
            bio: user.bio,
            createdAt: user.createdAt,
            role: user.role,
            referralCode: user.referralCode,
            activeProjects: user.get('activeProjects'),
            completedProjects: user.get('completedProjects'),
            recentGigs: recentGigs.map(g => {
                return {
                    id: g.id,
                    status: g.task?.status || 'not_assigned',
                    title: g.title,
                    username: g.task?.hustler?.user?.username || 'Not assigned',
                    createdAt: timeAgo(g.createdAt)
                }
            })
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            message: "Something went wrong!",
            error: error.message
        });
    }
};

exports.getClientGigs = async (req, res) => {
    try {
        const data = await req.userData;
        if (!data) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const id = data.userId;

        const recentGigs = await Gig.findAll({
            where: { clientId: id },
            attributes: ['id', 'title', 'createdAt'],
            include: {
                association: 'task',
                attributes: ['status'],
                include: {
                    association: 'hustler',
                    attributes: ['id'],
                    include: {
                        association: 'user',
                        attributes: ['username'],
                    },
                },
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        console.log('Recent gigs:', recentGigs.map(g => g.title));

        const gigsFormatted = recentGigs.map(g => ({
            id: g.id,
            title: g.title,
            status: g.task?.status || 'not_assigned',
            username: g.task?.hustler?.user?.username || 'Not assigned',
            createdAt: timeAgo(g.createdAt)
        }));

        res.status(200).json(gigsFormatted);

    } catch (error) {
        console.error('getClientGigs error:', error);
        res.status(500).json({
            message: "Something went wrong!",
            error: error.message
        });
    }
};
