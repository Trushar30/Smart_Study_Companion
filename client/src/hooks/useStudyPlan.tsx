import { useCallback, useState, createContext, useContext, ReactNode, useEffect } from "react";
import { StudyPlan } from "@/types";

interface StudyPlanContextType {
  studyPlan: StudyPlan | null;
  setStudyPlan: (plan: StudyPlan) => void;
  hasStudyPlan: () => boolean;
  markTopicCompleted: (index: number) => void;
  getTopicStatus: (index: number) => boolean;
}

const defaultContext: StudyPlanContextType = {
  studyPlan: null,
  setStudyPlan: () => {},
  hasStudyPlan: () => false,
  markTopicCompleted: () => {},
  getTopicStatus: () => false,
};

const StudyPlanContext = createContext<StudyPlanContextType>(defaultContext);

export const StudyPlanProvider = ({ children }: { children: ReactNode }) => {
  const [studyPlan, setStudyPlanState] = useState<StudyPlan | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Record<number, boolean>>({});

  // Load from local storage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem("studyPlan");
    const savedCompletedTopics = localStorage.getItem("completedTopics");
    
    if (savedPlan) {
      setStudyPlanState(JSON.parse(savedPlan));
    }
    
    if (savedCompletedTopics) {
      setCompletedTopics(JSON.parse(savedCompletedTopics));
    }
  }, []);

  const setStudyPlan = useCallback((plan: StudyPlan) => {
    setStudyPlanState(plan);
    setCompletedTopics({});
    localStorage.setItem("studyPlan", JSON.stringify(plan));
    localStorage.setItem("completedTopics", JSON.stringify({}));
  }, []);

  const hasStudyPlan = useCallback(() => {
    return studyPlan !== null;
  }, [studyPlan]);

  const markTopicCompleted = useCallback((index: number) => {
    setCompletedTopics(prev => {
      const updated = { 
        ...prev, 
        [index]: !prev[index]
      };
      localStorage.setItem("completedTopics", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getTopicStatus = useCallback((index: number) => {
    return completedTopics[index] || false;
  }, [completedTopics]);

  return (
    <StudyPlanContext.Provider
      value={{
        studyPlan,
        setStudyPlan,
        hasStudyPlan,
        markTopicCompleted,
        getTopicStatus,
      }}
    >
      {children}
    </StudyPlanContext.Provider>
  );
};

export const useStudyPlan = () => {
  const context = useContext(StudyPlanContext);
  if (context === undefined) {
    throw new Error("useStudyPlan must be used within a StudyPlanProvider");
  }
  return context;
};

// Add this provider to index.tsx or App.tsx
