const { CourseCategory, Course, CourseClass, Enrollment } = require('../models');
const { Op, Sequelize } = require('sequelize');

exports.getCourseCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const query = req.query.q || '';

    const { count, rows: categories } = await CourseCategory.findAndCountAll({
      where: {
        name: {
          [Op.like]: `%${query}%`
        }
      },
      include: [
        {
          model: Course,
          as: 'courses',
          attributes: [], // Don’t fetch full course data
        }
      ],
      attributes: {
        include: [
          [
            // Add a subquery to count courses in each category
            Sequelize.literal(`(
              SELECT COUNT(*) 
              FROM Courses 
              WHERE Courses.categoryId = CourseCategory.id
            )`),
            'courseCount'
          ]
        ]
      },
      order: [['name', 'ASC']],
      limit,
      offset
    });

    res.json({
      page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseCategory = async (req, res) => {
  try {
    const slug = req.params.slug;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const query = req.query.q || '';

    // Fetch category by slug
    const category = await CourseCategory.findOne({
      where: { slug }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Fetch courses belonging to the category
    const { count, rows: courses } = await Course.findAndCountAll({
      where: {
        categoryId: category.id,
        title: {
          [Op.like]: `%${query}%`
        }
      },
      attributes: {
        include: [
          [
            // Add a subquery to count courses in each category
            Sequelize.literal(`(
              SELECT COUNT(*) 
              FROM CourseClasses 
              WHERE CourseClasses.courseId = Course.id
            )`),
            'classCount'
            ],
            [
            // Add a subquery to count courses in each category
            Sequelize.literal(`(
              SELECT COUNT(*) 
              FROM Enrollments 
              WHERE Enrollments.courseId = Course.id
            )`),
            'enrollments'
          ]
        ]
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        { association: 'instructor', include: {association: 'user'} },
        { association: 'category', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      category,
      courses
    });

  } catch (error) {
    console.error('Error fetching category courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourse = async(req, res) => {
   const courseCode = req.query.code;
    const course = await Course.findOne({
        where: {
            courseCode
        },      attributes: {
        include: [
            [
            Sequelize.literal(`(
              SELECT COUNT(*) 
              FROM Enrollments 
              WHERE Enrollments.courseId = Course.id
            )`),
            'enrollments'
          ]
        ]
      },
      include: [
        { association: 'instructor', include: {association: 'user'} },
        { association: 'classes', attributes: ['id', 'name', 'duration', 'price']},
        { association: 'category', attributes: ['id', 'name'] }
      ]
    });
    res.json(course);
}

exports.getClass = async (req, res) => {
  try {
    const id = req.params.id;

    const courseClass = await CourseClass.findByPk(id, {
      include: [
        {
          association: 'course',
          include: [
            {
              association: 'instructor',
              include: {
                association: 'user',
              },
            },
            {
              association: 'category',
              attributes: ['id', 'name'],
            },
            {
              association: 'students',
              through: {
                association: 'enrollments',
                attributes: ['status']
              },
              attributes: ['id', 'profile_pic', 'username'],
            },
          ],
        },
      ],
    });

    if (!courseClass) {
      return res.status(404).json({ message: 'Course class not found' });
    }

    // Dynamically build response
    const instructor = courseClass.course?.instructor?.user;

    const response = {
      id: courseClass.id,
      courseCode: courseClass.course?.courseCode,
      courseName: courseClass.course?.title,
      classNumber: courseClass.id,
      classTitle: courseClass.name,
      duration: courseClass.duration,
      date: courseClass.createdAt, // format this if needed
      description: courseClass.description,
      topics: courseClass.topics || [],
      materials: courseClass.materials.map((m, i) => ({
        name: `material ${i}`,
        link: m
      })) || [],
      resources: courseClass.resources || [],
      expectations: courseClass.expectations || [],
      instructor: instructor && {
        name: instructor.username,
        email: instructor.email,
        experience: instructor.experience || '',
        linkedin: instructor.linkedIn || '',
        avatar: instructor.profile_pic,
      },
      students: courseClass.course?.students?.map(student => ({
        id: student.id,
        name: student.username,
        avatar: student.profile_pic,
        status: student.enrollments?.status, // include if needed
      })) || [],
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching course class:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


