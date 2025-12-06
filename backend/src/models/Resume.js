const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        default: 'Untitled Resume'
    },
    personalInfo: {
        fullName: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        website: String,
        jobTitle: String,
        summary: String
    },
    education: [{
        school: String,
        degree: String,
        field: String,
        startDate: String,
        endDate: String,
        description: String
    }],
    experience: [{
        company: String,
        position: String,
        location: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String,
        bullets: [String]
    }],
    skills: [String],
    certifications: [{
        name: String,
        issuer: String,
        date: String,
        url: String
    }],
    template: {
        type: String,
        default: 'modern'
    },
    atsScore: {
        type: Number,
        default: null
    },
    lastAnalyzedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Helper to rename _id to id
resumeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
