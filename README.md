# ATS-Friendly Resume Builder & Portfolio

An intelligent, AI-powered resume builder designed to help job seekers create ATS-optimized resumes that stand out. Built with modern web technologies and integrated with Google's Gemini AI.

## 🚀 Features

*   **AI-Powered Resume Analysis**: Get real-time feedback on your resume's ATS compatibility using Gemini AI.
*   **Smart Suggestions**: AI-generated suggestions for summaries, bullet points, and skills based on your job title.
*   **Real-time Preview**: See changes instantly as you type.
*   **ATS Check**: Compare your resume against job descriptions to ensure a perfect match.
*   **PDF Export**: download your professional resume in a simplified, ATS-friendly format.
*   **Secure Authentication**: User accounts with secure Sign Up/Sign In.
*   **Dashboard**: Manage multiple resumes comfortably.

## 🛠️ Tech Stack

### Frontend
*   **React** (Vite)
*   **TypeScript**
*   **Tailwind CSS**
*   **Shadcn UI** (Component Library)
*   **React Query** (State Management)

### Backend
*   **Node.js** & **Express**
*   **MongoDB** (Database)
*   **Mongoose** (ODM)
*   **JWT** (Authentication)
*   **Google Gemini API** (AI Integration)

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v16 or higher)
*   npm

### 1. Setup Backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Configuration (.env):**
Create a `.env` file in the `backend/` directory with the following:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/resume-builder
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

**Running the Database & Server:**

We use an in-memory MongoDB for easy setup, but you can also use a local or cloud MongoDB instance.

```bash
# Terminal 1: Start Backend (inc. Database)
npm run db   # Starts local MongoDB instance
npm run dev  # Starts Express server
```
*Note: If `npm run db` fails, ensure you are in the `backend` folder.*

### 2. Setup Frontend

Open a new terminal, navigate to the root directory, and install dependencies:

```bash
# In the project root
npm install --legacy-peer-deps
```

**Configuration (.env):**
Ensure the root `.env` file points to your local backend:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Run Frontend:**

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

---

## 🔒 Security Note
This project uses **environment variables** to manage secrets like API keys. Never commit your `.env` files to version control.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
