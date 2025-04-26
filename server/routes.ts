import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the generative model
// The error message indicates we need to use the correct model name and API version
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.post("/api/generate-study-plan", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        subject: z.string().min(1),
        topics: z.string().min(1),
        examDate: z.string().min(1),
      });

      const { subject, topics, examDate } = schema.parse(req.body);
      
      // Generate study plan using Gemini API
      const prompt = `Create a detailed study plan for a student preparing for a ${subject} exam on ${examDate}. 
      The exam will cover these topics: ${topics}.
      
      Instructions:
      1. Create a step-by-step study plan with specific time durations for each topic
      2. Include short breaks between study sessions
      3. Break down complex topics into manageable sub-topics
      4. Format your response as a JSON object with the following structure:
      {
        "subject": "${subject}",
        "examDate": "${examDate}",
        "topics": [
          {
            "name": "topic name",
            "duration": duration in minutes (number only),
            "isBreak": false
          },
          {
            "name": "Break",
            "duration": duration in minutes (number only),
            "isBreak": true
          },
          ... and so on
        ]
      }
      
      Make sure the response is valid JSON that can be parsed in JavaScript.`;

      const result = await model.generateContent(prompt);
      const textResult = result.response.text();
      
      // Extract JSON from the response
      const jsonMatch = textResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to generate valid study plan");
      }
      
      try {
        const studyPlan = JSON.parse(jsonMatch[0]);
        
        // Generate a unique ID
        studyPlan.id = `sp-${Date.now()}`;
        
        // Return the study plan
        res.json(studyPlan);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        throw new Error("Failed to parse generated study plan");
      }
    } catch (error) {
      console.error("Study plan generation error:", error);
      res.status(500).json({ message: "Failed to generate study plan" });
    }
  });

  app.post("/api/generate-notes", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        topic: z.string().min(1),
        detailLevel: z.string().min(1),
        format: z.string().min(1),
      });

      const { topic, detailLevel, format } = schema.parse(req.body);
      
      // Generate notes using Gemini API
      const prompt = `Create comprehensive study notes about ${topic} at a ${detailLevel} detail level. 
      Format the notes as ${format}. Make the notes clear, concise, and easy to understand. 
      Include key concepts, definitions, and examples where appropriate.
      Format your response in markdown.`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      
      res.json({ content });
    } catch (error) {
      console.error("Notes generation error:", error);
      res.status(500).json({ message: "Failed to generate notes" });
    }
  });

  app.post("/api/generate-explanation", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        topic: z.string().min(1),
      });

      const { topic } = schema.parse(req.body);
      
      // Generate real-world explanation using Gemini API
      const prompt = `Explain the concept of ${topic} using real-world examples and analogies that would make it easy for a student to understand and remember. 
      Be creative with your analogies but make sure they're accurate representations of the concept. 
      Start with the basics and then gradually move to more complex aspects. 
      Format your response in markdown with appropriate headings, bullet points, and emphasis.`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      
      res.json({ content });
    } catch (error) {
      console.error("Explanation generation error:", error);
      res.status(500).json({ message: "Failed to generate explanation" });
    }
  });

  app.post("/api/generate-quiz", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        topic: z.string().min(1),
        difficulty: z.string().min(1),
        numQuestions: z.number().min(1).max(15),
      });

      const { topic, difficulty, numQuestions } = schema.parse(req.body);
      
      // Generate quiz using Gemini API
      const prompt = `Create a multiple-choice quiz about ${topic} with ${numQuestions} questions at a ${difficulty} difficulty level. 
      
      Format your response as a JSON array of questions with this structure:
      {
        "questions": [
          {
            "id": 1,
            "question": "The question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "The correct option (exactly matching one of the options)"
          },
          ... and so on
        ]
      }
      
      Make sure each question has exactly 4 options, and the correct answer matches one of the options exactly. Make the quiz challenging yet fair. Cover different aspects of the topic.
      
      Make sure the response is valid JSON that can be parsed in JavaScript.`;

      const result = await model.generateContent(prompt);
      const textResult = result.response.text();
      
      // Extract JSON from the response
      const jsonMatch = textResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to generate valid quiz");
      }
      
      try {
        const quiz = JSON.parse(jsonMatch[0]);
        res.json(quiz);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        throw new Error("Failed to parse generated quiz");
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
