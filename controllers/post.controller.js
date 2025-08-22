const {
  Task,
  Course,
  Hustler,
  Gig,
  HustlerService,
  Service,
  postTag,
  Notification,
  Post, User, Comment, PostRelation, Media, Like } = require('../models');
const { Op, Association, where } = require('sequelize');
const clases = require('../classes');


exports.post = async (req, res) => {
  try {
    let { relatedType, relatedId, content, tags } = req.body;
    const files = req.files?.media || [];
    const tagged = tags ? JSON.parse(tags)
      //? tags
      // .split(",")                 // split into pieces
      // .map(s => s.trim())         // remove spaces
      // .filter(s => s !== "")      // drop empty strings
      // .map(Number)                // convert to numbers
      : [];

    relatedType = typeof relatedType === 'string' && relatedType.trim() !== ''
      ? relatedType.trim()
      : null;
    // Sanitize relatedId
    const parsedId = Number(relatedId);
    relatedId = !isNaN(parsedId) && parsedId > 0 ? parsedId : null;

    if (!content && files.length === 0 && !relatedId) {
      return res.status(400).json({ message: 'Post must include content or media.' });
    }
    // process data...
    // Categorize media

    const post = {
      content,
      userId: req.userData?.userId,
      status: 'posted'
    };

    const newPost = await Post.create(post);

    if (!newPost) return;

    for (const file of files) {
      const mime = file.mimetype;

      let mediaType = null;
      const url = file.path; // Make sure you're using diskStorage for `file.path`

      if (mime.startsWith('image/')) {
        mediaType = 'image';
      } else if (mime.startsWith('video/')) {
        mediaType = 'video';
      } else if (mime.startsWith('audio/')) {
        mediaType = 'audio';
      }

      // Create media entry
      const media = await Media.create({
        userId: req.userData?.userId,
        type: mediaType,
        url,
        postId: newPost.id // If using direct FK relationship
      });

      // OPTIONAL: Create post relation only if you're modeling that separately
      await PostRelation.create({
        postId: newPost.id,
        relatedType: 'media',
        relatedId: media.id
      });
    }
    if (relatedType && relatedId) {
      await PostRelation.create({
        postId: newPost.id,
        relatedType,
        relatedId
      });
    }

    // 2. Build postTag records for bulk insert
    if (Array.isArray(tagged) && tagged.length > 0) {
      const tagsData = tagged.map(tag => ({
        postId: newPost.id,
        userId: parseInt(tag)
      }));

      const notify = tagged.map(tag => ({
        type: 'tag',
        title: 'You have been tagged on a post',
        message: '',
        item_id: newPost.id,
        user_id: req.userData?.userId,
        target_id: parseInt(tag),
      }));

      await postTag.bulkCreate(tagsData);

      await Notification.bulkCreate(notify);
    }

    res.status(201).json({ message: 'Post created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating post' });
  }
};
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
exports.getposts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(req.userData.userId, {
      attributes: [
        'id', 'username', 'first_name', 'last_name', 'role', 'profile_pic',
        'bio', 'facebook', 'twitter', 'instagram', 'linkedin',
        'tiktok', 'youtube', 'verified', 'referralCode'
      ]
    });

    const { count, rows: posts } = await Post.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'profile_pic', 'role', 'verified'],
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
      order: [['createdAt', 'DESC']],
    });

    const postsData = await Promise.all(posts.map(async (p) => {
      const userId = req.userData?.userId;

      const post = {
        id: p.id,
        title: p.title,
        content: p.content,
        sponsored: p.sponsored,
        createdAt: timeAgo(p.createdAt),
        author: p.author,
        tags: p.tags.slice(0, 5),
        totalTags: p.tags.length,
        images: (p.media || []).filter(m => m.type === 'image').map(m => m.url),
        isLiked: await clases.IsLiked.isLiked(p.id, 'post', userId),
        likesCount: p.likes ? p.likes.length : 0,
        commentsCount: await Comment.count({
          where: { post_id: p.id, parent_comment_id: null }
        }),
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

      return post;
    }));

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalPosts: count,
      user,
      posts: postsData,
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


exports.getpost = async (req, res) => {
  try {
    const { post_id } = req.params;

    const userId = await req.userData?.userId
    const post = await clases.GetPost.getPost(post_id, userId);

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


exports.toggleRepost = async (req, res) => {
  try {
    const { postId } = req.body; // ID of the original post being reposted
    const userId = req.userData?.userId;

    if (!postId || isNaN(Number(postId))) {
      return res.status(400).json({ error: 'Invalid postId.' });
    }

    // 1. Check if user already reposted this post
    const existingRepost = await Post.findOne({
      where: { userId },
      include: {
        association: 'sharedPost',
        where: { id: postId },
        required: true
      }
    });

    if (existingRepost) {
      // 2. Remove repost and relation
      await PostRelation.destroy({
        where: {
          postId: existingRepost.id,
          relatedType: 'post',
          relatedId: postId
        }
      });

      await existingRepost.destroy();

      return res.status(200).json({ message: 'Repost removed successfully', reposted: false });
    }

    // 3. Otherwise, create a new post and relation
    const newPost = await Post.create({
      content: req.body.content || '',
      userId,
      status: 'posted'
    });

    await PostRelation.create({
      postId: newPost.id,
      relatedType: 'post',
      relatedId: postId
    });

    return res.status(201).json({ message: 'Reposted successfully', reposted: true });

  } catch (error) {
    console.error('Toggle repost error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRelated = async (req, res) => {
  try {
    const { type } = req.query;
    const { userId } = req.userData;
    const hustlerId = req.hustlerId;

    if (!type) {
      return res.status(400).json({ message: 'Please enter a type (task, course, service, or gig).' });
    }

    let data = [];

    switch (type.toLowerCase()) {
      case 'task':
        if (!hustlerId) return res.status(404).json({ message: 'Hustler profile not found for tasks.' });
        const task = await Task.findAll({ where: { hustlerId }, attributes: ['id'], include: { association: 'gig', attribute: ['title'], include: { association: 'service', attribute: ['name'], } } });
        data = task.map(task => {
          const t = {
            id: task.id,
            name: task.gig.service.name,
            title: task.gig.title
          };
          return t;
        })
        break;

      case 'course':
        if (!hustlerId) return res.status(404).json({ message: 'Hustler profile not found for courses.' });
        const courses = await Course.findAll({ where: { instructorId: hustlerId } });
        data = courses.map(course => {
          return {
            id: course.id,
            name: course.title,
            code: course.courseCode
          }
        })
        break;

      case 'service':
        if (!hustlerId) return res.status(404).json({ message: 'Hustler profile not found for services.' });
        const hustler = await Hustler.findByPk(hustlerId, {
          include: {
            association: 'services', through: {
              model: HustlerService,
              attributes: []
            }, attributes: ['id', 'name']
          }
        });
        data = hustler.services;
        break;
      case 'gig':
        const gigs = await Gig.findAll({ where: { clientId: userId }, attribute: ['id', 'title'], include: { association: 'service', attribute: ['name'], } });
        data = gigs.map(gig => {
          return {
            id: gig.id,
            name: gig.service.name,
            title: gig.title
          }
        })
        break;

      default:
        return res.status(400).json({ message: 'Invalid type. Must be one of task, course, service, or gig.' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('getRelated error:', error);
    return res.status(500).json({ error: 'Server error while retrieving related data.' });
  }
};




