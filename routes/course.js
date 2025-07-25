const express = require('express');
const router = express.Router();
const courseCategoryController = require('../controllers/course.controller');

// @route   GET /api/course-categories
// @desc    Get all course categories (with pagination & search)
// @access  Public
router.get('/categories', courseCategoryController.getCourseCategories);
router.get('/category/:slug', courseCategoryController.getCourseCategory);
router.get('/', courseCategoryController.getCourse);
router.get('/class/:id', courseCategoryController.getClass);

// Optional future routes
// router.post('/', courseCategoryController.createCourseCategory);
// router.put('/:id', courseCategoryController.updateCourseCategory);
// router.delete('/:id', courseCategoryController.deleteCourseCategory);

module.exports = router;
