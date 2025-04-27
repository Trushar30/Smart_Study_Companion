# Smart Study Companion 📚

A personalized learning assistant that generates structured study plans and real-life examples using Google's Gemini AI. This project helps students create effective study materials and understand complex topics through practical examples.

## 🌟 Features

- **AI-Powered Study Plans**: Generate personalized learning paths using Gemini AI
- **Real-World Examples**: Get practical examples for better understanding
- **PDF Export**: Download study materials in well-formatted PDF
- **Responsive UI**: Built with Tailwind CSS and Radix UI
- **TypeScript**: Type-safe codebase for better development
- **Modern Stack**: React.js, Node.js, Express.js

## Screenshots

- Dashboard with progress tracking
- Study plan generation
- Notes creation with AI assistance
- Interactive quizzes
- Real-world explanations

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI Components
- **Backend:** Node.js, Express
- **AI Integration:** Google Gemini API
- **State Management:** React Context, localStorage
- **Charts:** Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js v18 or later
- npm v8 or later
- Google Gemini API key

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Trushar30/Smart_Study_Companion.git
cd Smart_Study_Companion
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
Create a `.env` file in the root directory with the following content:
```plaintext
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

4. **Install required packages**
```bash
npm install dotenv pdfkit @types/pdfkit cross-env
```

## ⚙️ Configuration

1. **Get Gemini API Key**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy the key to your `.env` file

2. **Update environment variables**
- Make sure your `.env` file has all required variables
- Double-check there are no spaces around the equal signs

## 🏃‍♂️ Running the Project

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## How to Use

1. **Create a Study Plan**
   - Go to the Study Plan Generator page
   - Enter your subject, exam date, and study time preferences
   - Click "Generate Study Plan" to create a personalized schedule

2. **Generate Notes**
   - Select a topic from your study plan
   - Choose detail level and format
   - Generate AI-powered notes for focused study

3. **Take Quizzes**
   - Select a topic to test your knowledge
   - Answer the AI-generated questions
   - View your score and track improvement over time

4. **Get Real-World Explanations**
   - Select a complex topic
   - Get practical, real-world examples to better understand concepts

5. **Track Progress**
   - Visit the Dashboard to see your overall progress
   - Mark topics as completed
   - Monitor quiz scores and topic coverage

## 📁 Project Structure

```
SmartStudyCompanion/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── routes/
│   ├── index.ts
│   └── vite.ts
├── .env
├── package.json
└── README.md
```

## 🔧 Troubleshooting

### Common Issues

1. **GEMINI_API_KEY not found**
   - Check if `.env` file exists in root directory
   - Verify API key is correct
   - Restart the server

2. **Port already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

3. **Build errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

## 👥 Authors

- Trushar Patel - *Initial work* - [Trushar30](https://github.com/Trushar30)

## 🙏 Acknowledgments

- Google Gemini AI for providing the AI capabilities
- OpenAI for inspiration
- All contributors who helped with the project

---
