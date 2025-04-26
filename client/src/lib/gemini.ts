import { apiRequest } from "./queryClient";
import { StudyPlan, Topic, QuizQuestion } from "@/types";
import { marked } from "marked";

// Process Gemini API Response
const processGeminiResponse = (markdown: string): string => {
  return marked.parse(markdown) as string;
};

// Generate Study Plan
export const generateStudyPlan = async (
  subject: string,
  topics: string,
  examDate: string
): Promise<StudyPlan> => {
  try {
    const response = await apiRequest("POST", "/api/generate-study-plan", {
      subject,
      topics,
      examDate,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw error;
  }
};

// Generate Notes Content
export const generateNotesContent = async (
  topic: string,
  detailLevel: string,
  format: string
): Promise<string> => {
  try {
    const response = await apiRequest("POST", "/api/generate-notes", {
      topic,
      detailLevel,
      format,
    });
    
    const data = await response.json();
    return processGeminiResponse(data.content);
  } catch (error) {
    console.error("Error generating notes:", error);
    throw error;
  }
};

// Generate Real-World Explanation
export const generateRealWorldExplanation = async (
  topic: string
): Promise<string> => {
  try {
    const response = await apiRequest("POST", "/api/generate-explanation", {
      topic,
    });
    
    const data = await response.json();
    return processGeminiResponse(data.content);
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw error;
  }
};

// Generate Quiz
export const generateQuiz = async (
  topic: string,
  difficulty: string,
  numQuestions: number
): Promise<QuizQuestion[]> => {
  try {
    const response = await apiRequest("POST", "/api/generate-quiz", {
      topic,
      difficulty,
      numQuestions,
    });
    
    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};
