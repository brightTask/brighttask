const {
    Comment,
    Post,
    Like,
    Notification,
    User,
    Media,
    PostRelation,
    Task,
    Course,
    Hustler,
    Gig,
    HustlerService,
    Service
} = require('./models');
const { Op, Sequelize, fn, col, where } = require('sequelize');

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


class OneComment {
    constructor(id) {
        this.id = id;
    }

    async getComment() {
        const comment = await Comment.findOne({
            where: { id: this.id },
            include: [
                {
                    model: Post,
                    as: 'post',
                    attributes: ['id', 'title'],
                },
                {
                    model: Comment,
                    as: 'parent',
                    attributes: ['id', 'content'],
                    include: [
                        {
                            model: Post,
                            as: 'post',
                            attributes: ['id', 'title'],
                        },
                        {
                            model: Comment,
                            as: 'parent',
                            attributes: ['id', 'content'],
                            include: [
                                {
                                    model: Post,
                                    as: 'post',
                                    attributes: ['id', 'title'],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!comment) return null;

        if (comment.parent) {
            if (comment.parent.parent) {
                return {
                    comment_id: comment.id,
                    parent_id: comment.parent.id,
                    g_parent_id: comment.parent.parent.id,
                    post_id: comment.parent.parent.post?.id || null,
                };
            } else {
                return {
                    comment_id: comment.id,
                    parent_id: comment.parent.id,
                    post_id: comment.parent.post?.id || null,
                };
            }
        } else {
            return {
                comment_id: comment.id,
                post_id: comment.post?.id || null,
            };
        }
    }

    static async getComment(id) {
        const instance = new OneComment(id);
        return await instance.getComment();
    }
}

class OneLike {
    constructor(id) {
        this.id = id;
    }

    async getLiked() {
        const like = await Like.findOne({
            where: { id: this.id },
            include: [
                {
                    model: Post,
                    as: 'post',
                    attributes: ['id', 'title'],
                },
                {
                    model: Comment,
                    as: 'comment',
                    attributes: ['id', 'content'],
                },
            ],
        });

        if (!like) return null;

        if (like.comment) {
            const commentDetails = await OneComment.getComment(like.comment.id);
            return commentDetails;
        } else {
            return {
                post_id: like.post?.id || null,
            };
        }
    }

    static async getLiked(id) {
        const instance = new OneLike(id);
        return await instance.getLiked();
    }
}

class AllNotification {
    constructor(userId, page = 1, limit = 10) {
        this.userId = userId;
        this.page = page;
        this.limit = limit;
    }

    async getNotification() {
        const notifications = await Notification.findAll({
            where: { target_id: this.userId },
            include: [
                {
                    model: User,
                    as: 'Source',
                    attributes: ['id', 'username', 'profile_pic'],
                },
            ],
            order: [['createdAt', 'DESC']],
            offset: (this.page - 1) * this.limit,
            limit: this.limit,
        });

        if (!notifications.length) return [];

        return await Promise.all(
            notifications.map(async (notification) => {
                const data = {
                    id: notification.id,
                    type: notification.type,
                    message: notification.message,
                    title: notification.title,
                    isRead: notification.isRead,
                    item_id: notification.item_id,
                    user_id: notification.user_id,
                    source: notification.Source,
                    createdAt: notification.createdAt
                };

                if (notification.type === 'like') {
                    data.likeDetails = await OneLike.getLiked(notification.item_id);
                } else if (['comment', 'reply'].includes(notification.type)) {
                    data.commentDetails = await OneComment.getComment(notification.item_id);
                }

                return data;
            })
        );
    }

    static async getNotification(userId, page = 1, limit = 10) {
        const instance = new AllNotification(userId, page, limit);
        return await instance.getNotification();
    }
}

class IsLiked {
    constructor(id, type, userId) {
        this.likeableId = parseInt(id);
        this.likeableType = type;
        this.userId = parseInt(userId);
    }

    async isLiked() {

        const like = await Like.findOne({
            where: {
                user_id: this.userId,
                likeable_id: this.likeableId,
                likeable_type: this.likeableType,
            },
        });
        return !!like;
    }

    static async isLiked(id, type, userId) {
        const instance = new IsLiked(id, type, userId);
        return await instance.isLiked();
    }
}

class AllComments {
    constructor(post_id, page = 1, limit = 10, userId) {
        this.post_id = post_id;
        this.page = page;
        this.limit = limit;
        this.userId = userId;
    }


    async getAllComments() {
        const comments = await Comment.findAll({
            where: { post_id: this.post_id, parent_comment_id: null },
            include: [
                {
                    model: Comment,
                    as: 'replies',
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'profile_pic'],
                },
                {
                    model: Like,
                    as: 'likes',
                    attributes: ['id'],
                },
            ],
            offset: (this.page - 1) * this.limit,
            limit: this.limit,
            order: [['createdAt', 'DESC']],
        });

        console.log(this.userId);
        const foundComments = await Promise.all(
            comments.map(async (comment) => {
                const isLiked = this.userId
                    ? await IsLiked.isLiked(comment.id, 'Comment', this.userId)
                    : false;

                return {
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    isLiked,
                    user: {
                        id: comment.user.id,
                        username: comment.user.username,
                        profile_pic: comment.user.profile_pic,
                    },
                    repliesCount: comment.replies.length,
                    likesCount: comment.likes.length,
                };
            })
        );
        return foundComments;
    }

    static async getAllComments(post_id, page = 1, limit = 10, userId) {
        const instance = new AllComments(post_id, page, limit, userId);
        return await instance.getAllComments();
    }
}

class Replies {
    constructor(commentId, userId, post_id, page = 1, limit = 10) {
        this.commentId = commentId;
        this.page = page;
        this.limit = limit;
        this.userId = userId;
        this.post_id = post_id;
    }

    async getReplies() {
        const comment = await Comment.findByPk(this.commentId, {
            include: [
                {
                    model: Comment,
                    as: 'replies',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'profile_pic'],
                        },
                        {
                            model: Like,
                            as: 'likes',
                            attributes: ['id'],
                        },
                        {
                            model: Comment,
                            as: 'replies',
                            attributes: ['id'],
                        },
                    ],
                },
            ],
        });

        if (!comment) return [];

        const foundReplies = await Promise.all(
            comment.replies.map(async (reply) => {
                const isLiked = this.userId
                    ? await IsLiked.isLiked(reply.id, 'Comment', this.userId)
                    : false;

                return {
                    id: reply.id,
                    content: reply.content,
                    createdAt: reply.createdAt,
                    isLiked,
                    likesCount: reply.likes.length,
                    repliesCount: reply.replies.length,
                    user: {
                        id: reply.user.id,
                        username: reply.user.username,
                        profile_pic: reply.user.profile_pic,
                    },
                };
            })
        );

        return foundReplies;
    }

    static async getReplies(commentId, userId, post_id, page = 1, limit = 10) {
        const instance = new Replies(commentId, userId, post_id, page, limit);
        return await instance.getReplies();
    }
}

class GetPost {
    constructor(id, userId) {
        this.id = id;
        this.userId = userId;
    }

    async getPost() {
        const postData = await Post.findByPk(this.id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'email', 'profile_pic', 'role'],
                },
                {
                    model: User,
                    as: 'tags',
                    attributes: ['id', 'username', 'profile_pic', 'role', 'verified', 'first_name', 'last_name'],
                },
                {
                    model: Like,
                    as: 'likes',
                    attributes: ['id'],
                },
                {
                    model: Media,
                    as: 'media',
                    attributes: ['type', 'url'],
                    through: {
                        model: PostRelation,
                        attributes: []
                    }
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description', 'courseCode'],
                    through: {
                        model: PostRelation,
                        attributes: []
                    }
                },
                {
                    model: Task,
                    as: 'task',
                    attributes: ['id'], include: { association: 'gig', attribute: ['title'], include: { association: 'service', attribute: ['name'], } },
                    through: {
                        model: PostRelation,
                        attributes: []
                    }
                },
                {
                    model: Gig,
                    as: 'gig',
                    attribute: ['id', 'title', 'description', 'location', 'isRemote', 'deadline'], include: { association: 'service', attribute: ['name', 'icon'], },
                    through: {
                        model: PostRelation,
                        attributes: []
                    }
                },
                {
                    model: Service,
                    as: 'service',
                    attributes: ['id', 'name', 'description'],
                    through: {
                        model: PostRelation,
                        attributes: []
                    }
                },
                {
                    model: Post,
                    as: 'sharedPost',
                    through: {
                        model: PostRelation,
                        attributes: []
                    },
                    include: [
                        {
                            model: User,
                            as: 'author',
                            attributes: ['id', 'username', 'email', 'profile_pic', 'role'],
                        },
                        {
                            model: Media,
                            as: 'media',
                            attributes: ['type', 'url'],
                            through: {
                                model: PostRelation,
                                attributes: []
                            }
                        }
                    ],
                }
            ],
        });


        if (!postData) return null;

        // Convert to plain object so we can add new properties
        const p = postData.get({ plain: true });

        const post = {
            id: p.id,
            title: p.title,
            content: p.content,
            sponsored: p.sponsored,
            createdAt: p.createdAt,
            author: p.author,
            tags: p.tags.slice(0, 5),
            totalTags: p.tags.length,
            images: (p.media || []).filter(m => m.type === 'image').map(m => m.url),
        };

        if (p.gig && Array.isArray(p.gig) && p.gig.length > 0) post.gig = p.gig[0];
        if (p.task && Array.isArray(p.task) && p.task.length > 0) post.task = p.task[0];
        if (p.service && Array.isArray(p.service) && p.service.length > 0) post.service = p.service[0];
        if (p.course && Array.isArray(p.course) && p.course.length > 0) post.course = p.course[0];

        if (p.sharedPost && Array.isArray(p.sharedPost) && p.sharedPost.length > 0) {
            post.sharedPost = p.sharedPost.map(s => ({
                id: s.id,
                title: s.title,
                content: s.content,
                sponsored: s.sponsored,
                createdAt: s.createdAt,
                images: (s.media || []).filter(m => m.type === 'image').map(m => m.url),
                author: s.author || null,
            }));
        }

        // Add custom fields
        post.createdAt = timeAgo(post.createdAt);
        post.isLiked = this.userId
            ? await IsLiked.isLiked(post.id, 'Post', this.userId)
            : false;

        const commentsCount = await Comment.count({
            where: { post_id: post.id, parent_comment_id: null },
        });

        post.likesCount = p.likes ? p.likes.length : 0;

        post.commentsCount = commentsCount;

        post.comments = await AllComments.getAllComments(post.id, 1, 10, this.userId);

        return post;

    }

    static async getPost(id, userId) {
        const instance = new GetPost(id, userId);
        return await instance.getPost();
    }
}

module.exports = {
    OneComment,
    OneLike,
    AllNotification,
    AllComments,
    Replies,
    IsLiked,
    GetPost,
};
