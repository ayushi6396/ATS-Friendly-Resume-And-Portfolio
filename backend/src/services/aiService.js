const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
let genAI;
let model;

if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // User explicitly requested gemini-2.5-flash
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

const analyzeResume = async (resumeData, jobDescription) => {
    if (!model) {
        console.log('GEMINI_API_KEY missing, returning mock analysis');
        return {
            score: 75,
            analysis: "This is a mock analysis because GEMINI_API_KEY is not set. The resume looks good structure-wise but could use more quantifiable achievements.",
            missingKeywords: ["React", "Node.js", "Team Leadership"],
            suggestions: ["Add more metrics", "Clarify your role in project X"]
        };
    }

    try {
        const prompt = `
      You are an ATS (Applicant Tracking System) expert. Analyze the following resume and provide:
      1. A compatibility score (0-100)
      2. Detailed feedback on formatting, keywords, and structure
      3. Specific suggestions for improvement
      
      Resume Data:
      ${JSON.stringify(resumeData)}
      
      Job Description (if provided):
      ${jobDescription || 'Not provided'}
      
      Provide your response in this exact JSON format (no markdown code blocks):
      {
        "score": number,
        "analysis": "string",
        "missingKeywords": ["string"],
        "suggestions": ["string"]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error('AI Analysis Error:', error);
        throw new Error('Failed to analyze resume with AI');
    }
};

const generateSuggestions = async (type, context, jobTitle) => {
    if (!model) {
        return {
            suggestions: [
                "Mock suggestion 1: Improve this section.",
                "Mock suggestion 2: Add more details.",
                "Mock suggestion 3: Use action verbs."
            ]
        };
    }

    try {
        let prompt = '';
        if (type === 'summary') {
            prompt = `Generate a professional resume summary for a ${jobTitle}. Context: ${context}. return valid JSON: { "suggestions": ["option 1", "option 2", "option 3"] }`;
        } else if (type === 'bullet') {
            prompt = `Generate 3 professional resume bullet points for this experience: ${context}. return valid JSON: { "suggestions": ["bullet 1", "bullet 2", "bullet 3"] }`;
        } else {
            prompt = `Suggest 5 relevant skills for a ${jobTitle} position. Current skills: ${context}. return valid JSON: { "suggestions": ["skill 1", "skill 2", ...] }`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error('AI Suggestion Error:', error);
        throw new Error('Failed to generate suggestions');
    }
};

module.exports = {
    analyzeResume,
    generateSuggestions
};
