'use strict';
const { Comment, Like, User, Post, Notification, Activity } = require('../models');
const models = require('../models');
const { Sequelize } = require('sequelize');
const clases = require('../classes');

const { Op, fn, col, where } = require('sequelize');

// Escape HTML to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

// Dummy time ago
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

// Helper to get ISO week number
Date.prototype.getWeekNumber = function () {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the week number.
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};


// Add a comment or a reply
exports.addComment = async (req, res) => {
    const {
        post_id,
        parent_comment_id,
        content,
        level = 0, // Default level to 0 if not provided
    } = req.body;
    const data = await req.userData;
    const user_id = data.userId;

    try {
        const newComment = await Comment.create({
            post_id,
            user_id,
            parent_comment_id: parent_comment_id || null,
            content,
        });

        // Now fetch it with the associated user
        const fullComment = await Comment.findOne({
            where: { id: newComment.id },
            attributes: ['id', 'content', 'user_id', 'createdAt'],
            include: [
                {
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'username', 'profile_pic']
                }
            ]
        });


        let target_id = null;
        let message = '';
        let notifyCondition = {};

        if (parent_comment_id) {
            const commentData = await Comment.findOne({
                where: { id: parent_comment_id },
                include: [{ model: User, as: 'user', attributes: ['id'] }], // Use alias
            });

            if (commentData && commentData.user && commentData.user.id !== user_id) {
                target_id = commentData.user.id;
                message = `replied to your comment: ${content}`;

                notifyCondition = {
                    type: 'reply',
                    user_id,
                    target_id,
                    item_id: newComment.id,
                };
            }
        } else {

            const postData = await Post.findOne({
                where: { id: post_id },
                include: [{ model: User, as: 'author', attributes: ['id'] }],
            });

            if (postData && postData.author && parseInt(postData.author.id) !== parseInt(user_id)) {
                target_id = parseInt(postData.author.id);
                message = `commented on your post: ${content}`;
                notifyCondition = {
                    type: 'comment',
                    user_id,
                    target_id,
                    item_id: newComment.id,
                };

                if (target_id) {
                        const [activity, created] = await Activity.findOrCreate({
                            where: {
                                type: 'comment',
                                user_id,
                                target_id,
                                item_id: newComment.id,
                            },
                            defaults: {
                                message: `commented on`,
                            },
                        });

                        console.log('Notification created:', created);
                }

            }
        }

        if (target_id) {
            try {
                const [notification, created] = await Notification.findOrCreate({
                    where: notifyCondition,
                    defaults: {
                        message,
                    },
                });

                console.log('Notification created:', created);
            } catch (notifyErr) {
                console.error('Notification creation failed:', notifyErr.message);
            }
        }
        res.send({
                    id: fullComment.id,
                    content: fullComment.content,
                    createdAt: fullComment.createdAt,
                    isLiked: false,
                    user: {
                        id: fullComment.user.id,
                        username: fullComment.user.username,
                        profile_pic: fullComment.user.profile_pic,
                    },
                    repliesCount: 0,
                    likesCount: 0,
                });
                
    } catch (err) {
        console.error('Add comment error:', err.message);
        res.status(500).json({ error: 'Failed to add comment', details: err.message });
    }
};


// like
exports.toggleLike = async (req, res) => {
    const { post_id, comment_id, reaction_type } = req.body;
    const data = await req.userData;
    const user_id = data.userId;

    try {
        const likeable_id = comment_id ?? post_id;
        const likeable_type = comment_id ? 'Comment' : 'Post';

        const likeItem = await Like.findOne({
            where: { user_id, likeable_id, likeable_type }
        });

        let message = '';
        let liked = false;

        if (likeItem) {
            if (likeItem.reaction_type === reaction_type) {
                await likeItem.destroy();
                message = 'Unliked';
            } else {
                await likeItem.update({ reaction_type });
                message = reaction_type;
                liked = true;
            }
        } else {
            const newLike = await Like.create({
                user_id,
                likeable_id,
                likeable_type,
                reaction_type
            });

            message = reaction_type;
            liked = true;

            let target_id = null;
            let notifyMessage = '';
            let notifyCondition = {};

            if (comment_id) {
                const commentData = await Comment.findOne({
                    where: { id: comment_id },
                    include: [{ model: User, as: 'user', attributes: ['id'] }]
                });

                if (commentData?.user?.id !== user_id) {
                    target_id = commentData.user.id;
                    notifyMessage = 'liked your comment';
                    notifyCondition = {
                        type: 'like',
                        user_id,
                        target_id,
                        item_id: newLike.id

                    };
                }
            } else {
                const postData = await Post.findOne({
                    where: { id: post_id },
                    include: [{ model: User, as: 'author', attributes: ['id'] }]
                });

                if (postData?.author?.id !== user_id) {
                    target_id = postData.author.id;
                    notifyMessage = 'liked your post';
                    notifyCondition = {
                        type: 'like',
                        user_id,
                        target_id,
                        item_id: newLike.id
                    };
                }
            }

            // Send notification if applicable
            if (target_id) {
                await Notification.findOrCreate({
                    where: notifyCondition,
                    defaults: {
                        message: notifyMessage
                    }
                });
            }
        }

        const likeCount = await Like.count({
            where: { likeable_id, likeable_type }
        });

        res.status(200).json({ message, liked, likeCount });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle Like', details: err.message });
    }
};


exports.fetchReplies = async (req, res) => {
    const { commentId, post_id, page } = req.body;

    const data = await req.userData;
    const userId = data?.userId || null;
    const replies = await clases.Replies.getReplies(commentId, userId, post_id, page, 10);
    res.send(replies);
}



exports.deleteComment = async (req, res) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        await comment.destroy(); // Cascade will take care of child replies, images, etc.
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete comment', details: err.message });
    }
};



