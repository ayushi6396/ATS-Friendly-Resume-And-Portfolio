const Resume = require('../models/Resume');
const ATSAnalysis = require('../models/ATSAnalysis');
const aiService = require('../services/aiService');

// @desc    Get all resumes
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json(resumes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (resume) {
            if (resume.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            res.json(resume);
        } else {
            res.status(404).json({ message: 'Resume not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a resume
// @route   POST /api/resumes
// @access  Private
const createResume = async (req, res) => {
    try {
        const { title } = req.body;

        const resume = new Resume({
            userId: req.user._id,
            title: title || 'Untitled Resume',
            personalInfo: {},
            education: [],
            experience: [],
            skills: [],
            certifications: []
        });

        const createdResume = await resume.save();
        res.status(201).json(createdResume);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a resume
// @route   PATCH /api/resumes/:id
// @access  Private
const updateResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (resume) {
            if (resume.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            // Update fields
            const {
                title,
                personalInfo,
                education,
                experience,
                skills,
                certifications,
                template,
                atsScore,
                lastAnalyzedAt
            } = req.body;

            if (title) resume.title = title;
            if (personalInfo) resume.personalInfo = personalInfo;
            if (education) resume.education = education;
            if (experience) resume.experience = experience;
            if (skills) resume.skills = skills;
            if (certifications) resume.certifications = certifications;
            if (template) resume.template = template;
            if (atsScore !== undefined) resume.atsScore = atsScore;
            if (lastAnalyzedAt) resume.lastAnalyzedAt = lastAnalyzedAt;

            const updatedResume = await resume.save();
            res.json(updatedResume);
        } else {
            res.status(404).json({ message: 'Resume not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (resume) {
            if (resume.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            await resume.deleteOne();
            res.status(204).json({ message: 'Resume removed' });
        } else {
            res.status(404).json({ message: 'Resume not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Analyze resume with AI
// @route   POST /api/resumes/analyze
// @access  Private
const analyzeResume = async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;

        // Call AI Service
        const result = await aiService.analyzeResume(resumeData, jobDescription);

        // Save analysis to history (optional but good)
        // We need a resume ID context, but the frontend sends data.
        // Ideally we update the resume record with the new score.
        // The current API spec request body doesn't include resumeId, just resumeData.
        // But typically we are analyzing an existing resume or a draft.

        res.json({
            score: result.score,
            analysis: result.analysis,
            missingKeywords: result.missingKeywords,
            suggestions: result.suggestions,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI suggestions
// @route   POST /api/resumes/suggest
// @access  Private
const generateSuggestions = async (req, res) => {
    try {
        const { type, context, jobTitle } = req.body;

        const result = await aiService.generateSuggestions(type, context, jobTitle);

        res.json({
            suggestions: result.suggestions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getResumes,
    getResumeById,
    createResume,
    updateResume,
    deleteResume,
    analyzeResume,
    generateSuggestions
};
