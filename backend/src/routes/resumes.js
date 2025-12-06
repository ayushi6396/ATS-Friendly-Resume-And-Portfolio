const express = require('express');
const router = express.Router();
const {
    getResumes,
    getResumeById,
    createResume,
    updateResume,
    deleteResume,
    analyzeResume,
    generateSuggestions
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getResumes)
    .post(protect, createResume);

router.post('/analyze', protect, analyzeResume);
router.post('/suggest', protect, generateSuggestions);

router.route('/:id')
    .get(protect, getResumeById)
    .patch(protect, updateResume)
    .delete(protect, deleteResume);

module.exports = router;
