const mongoose = require('mongoose');

const atsAnalysisSchema = new mongoose.Schema({
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Resume'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    score: {
        type: Number,
        required: true
    },
    analysis: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        default: null
    },
    missingKeywords: [String],
    suggestions: [String]
}, {
    timestamps: true
});

const ATSAnalysis = mongoose.model('ATSAnalysis', atsAnalysisSchema);
module.exports = ATSAnalysis;
