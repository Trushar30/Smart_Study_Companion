# Smart Study Companion

A web application that helps students prepare for exams using AI-generated study plans, notes, explanations, and quizzes with real-time progress tracking.

## Features

- Create personalized study plans with topics and duration
- Generate detailed notes for specific topics with Gemini AI
- Get real-world explanations of concepts
- Take quizzes to test your knowledge
- Track your progress through a comprehensive dashboard
- Real-time countdown to exam date
- Topic completion tracking
- Theme toggle (light/dark mode)

## Screenshots

- Dashboard with progress tracking
- Study plan generation
- Notes creation with AI assistance
- Interactive quizzes
- Real-world explanations

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI Components
- **Backend:** Node.js, Express
- **AI Integration:** Google Gemini API
- **State Management:** React Context, localStorage
- **Charts:** Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Google Gemini API key

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd smart-study-companion
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Gemini API key
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

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

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: UI components
  - `src/pages/`: Application pages
  - `src/hooks/`: Custom React hooks
  - `src/lib/`: Utility functions and API clients
  - `src/types/`: TypeScript type definitions

- `server/`: Backend Express server
  - `routes.ts`: API routes for AI integration
  - `storage.ts`: Data storage logic

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.