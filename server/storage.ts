import { 
  users, 
  User, 
  InsertUser, 
  studyPlans,
  InsertStudyPlan,
  StudyPlan,
  notes,
  InsertNote,
  Note,
  explanations,
  InsertExplanation,
  Explanation,
  quizzes,
  InsertQuiz,
  Quiz,
  progress,
  InsertProgress,
  Progress,
  topicStatus,
  InsertTopicStatus,
  TopicStatus
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Study Plan methods
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  getStudyPlansByUserId(userId: number): Promise<StudyPlan[]>;
  getStudyPlanById(id: number): Promise<StudyPlan | undefined>;

  // Notes methods
  createNote(note: InsertNote): Promise<Note>;
  getNotesByUserId(userId: number): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;

  // Explanation methods
  createExplanation(explanation: InsertExplanation): Promise<Explanation>;
  getExplanationsByUserId(userId: number): Promise<Explanation[]>;
  getExplanationById(id: number): Promise<Explanation | undefined>;

  // Quiz methods
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuizzesByUserId(userId: number): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  updateQuizScore(id: number, score: number): Promise<Quiz | undefined>;

  // Progress methods
  createProgress(progress: InsertProgress): Promise<Progress>;
  getProgressByUserId(userId: number): Promise<Progress[]>;
  updateProgress(id: number, completion: number, quizScores: number[]): Promise<Progress | undefined>;

  // Topic Status methods
  updateTopicStatus(topicStatus: InsertTopicStatus): Promise<TopicStatus>;
  getTopicStatusByPlanId(planId: number): Promise<TopicStatus[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private studyPlans: Map<number, StudyPlan>;
  private notes: Map<number, Note>;
  private explanations: Map<number, Explanation>;
  private quizzes: Map<number, Quiz>;
  private progressData: Map<number, Progress>;
  private topicStatusData: Map<number, TopicStatus>;
  
  private userCurrentId: number;
  private studyPlanCurrentId: number;
  private noteCurrentId: number;
  private explanationCurrentId: number;
  private quizCurrentId: number;
  private progressCurrentId: number;
  private topicStatusCurrentId: number;

  constructor() {
    this.users = new Map();
    this.studyPlans = new Map();
    this.notes = new Map();
    this.explanations = new Map();
    this.quizzes = new Map();
    this.progressData = new Map();
    this.topicStatusData = new Map();
    
    this.userCurrentId = 1;
    this.studyPlanCurrentId = 1;
    this.noteCurrentId = 1;
    this.explanationCurrentId = 1;
    this.quizCurrentId = 1;
    this.progressCurrentId = 1;
    this.topicStatusCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Study Plan methods
  async createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan> {
    const id = this.studyPlanCurrentId++;
    const studyPlan: StudyPlan = { 
      ...plan, 
      id, 
      createdAt: new Date() 
    };
    this.studyPlans.set(id, studyPlan);
    return studyPlan;
  }

  async getStudyPlansByUserId(userId: number): Promise<StudyPlan[]> {
    return Array.from(this.studyPlans.values()).filter(
      (plan) => plan.userId === userId,
    );
  }

  async getStudyPlanById(id: number): Promise<StudyPlan | undefined> {
    return this.studyPlans.get(id);
  }

  // Notes methods
  async createNote(note: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const newNote: Note = { 
      ...note, 
      id, 
      createdAt: new Date() 
    };
    this.notes.set(id, newNote);
    return newNote;
  }

  async getNotesByUserId(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId,
    );
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  // Explanation methods
  async createExplanation(explanation: InsertExplanation): Promise<Explanation> {
    const id = this.explanationCurrentId++;
    const newExplanation: Explanation = { 
      ...explanation, 
      id, 
      createdAt: new Date() 
    };
    this.explanations.set(id, newExplanation);
    return newExplanation;
  }

  async getExplanationsByUserId(userId: number): Promise<Explanation[]> {
    return Array.from(this.explanations.values()).filter(
      (explanation) => explanation.userId === userId,
    );
  }

  async getExplanationById(id: number): Promise<Explanation | undefined> {
    return this.explanations.get(id);
  }

  // Quiz methods
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizCurrentId++;
    const newQuiz: Quiz = { 
      ...quiz, 
      id, 
      createdAt: new Date() 
    };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  async getQuizzesByUserId(userId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.userId === userId,
    );
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async updateQuizScore(id: number, score: number): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updatedQuiz = { ...quiz, score };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  // Progress methods
  async createProgress(progressData: InsertProgress): Promise<Progress> {
    const id = this.progressCurrentId++;
    const newProgress: Progress = { 
      ...progressData, 
      id, 
      lastStudied: new Date() 
    };
    this.progressData.set(id, newProgress);
    return newProgress;
  }

  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return Array.from(this.progressData.values()).filter(
      (progress) => progress.userId === userId,
    );
  }

  async updateProgress(id: number, completion: number, quizScores: number[]): Promise<Progress | undefined> {
    const progress = this.progressData.get(id);
    if (!progress) return undefined;
    
    const updatedProgress = { 
      ...progress, 
      completion,
      quizScores,
      lastStudied: new Date()
    };
    this.progressData.set(id, updatedProgress);
    return updatedProgress;
  }

  // Topic Status methods
  async updateTopicStatus(status: InsertTopicStatus): Promise<TopicStatus> {
    // Check if entry already exists
    const existingStatus = Array.from(this.topicStatusData.values()).find(
      (s) => s.studyPlanId === status.studyPlanId && s.topicIndex === status.topicIndex
    );
    
    if (existingStatus) {
      const updatedStatus = { 
        ...existingStatus, 
        completed: status.completed,
        updatedAt: new Date()
      };
      this.topicStatusData.set(existingStatus.id, updatedStatus);
      return updatedStatus;
    } else {
      const id = this.topicStatusCurrentId++;
      const newStatus: TopicStatus = { 
        ...status, 
        id, 
        updatedAt: new Date() 
      };
      this.topicStatusData.set(id, newStatus);
      return newStatus;
    }
  }

  async getTopicStatusByPlanId(planId: number): Promise<TopicStatus[]> {
    return Array.from(this.topicStatusData.values()).filter(
      (status) => status.studyPlanId === planId,
    );
  }
}

export const storage = new MemStorage();
