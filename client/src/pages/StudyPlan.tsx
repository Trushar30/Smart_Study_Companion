import { useEffect } from "react";
import { useLocation } from "wouter";
import { Container, SectionTitle } from "@/components/ui/container";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const StudyPlan = () => {
  const [location, navigate] = useLocation();
  const { studyPlan, hasStudyPlan, markTopicCompleted, getTopicStatus } = useStudyPlan();
  
  // If no study plan exists, redirect to study plan generator
  useEffect(() => {
    if (!hasStudyPlan()) {
      navigate("/study-plan-generator");
    }
  }, [hasStudyPlan, navigate]);

  if (!hasStudyPlan()) {
    return null;
  }

  return (
    <div>
      <SectionTitle>STUDY PLAN</SectionTitle>
      
      <Container>
        <div className="mb-4 space-y-2">
          <div>
            <span className="text-muted-foreground">Subject:</span>
            <h3 className="text-lg font-bold">{studyPlan?.subject}</h3>
          </div>
          
          <div>
            <span className="text-muted-foreground">Exam Date:</span>
            <p>{studyPlan?.examDate}</p>
          </div>
        </div>
        
        <div className="relative">
          <div className="timeline-line"></div>
          
          {studyPlan?.topics.map((topic, index) => (
            <div 
              key={index} 
              className="ml-16 pb-8 relative"
            >
              {topic.isBreak ? (
                <>
                  <div className="timeline-dot bg-gray-500 flex items-center justify-center">
                    <i className="fas fa-coffee text-xs"></i>
                  </div>
                  <div className="flex justify-between items-center w-full pl-10">
                    <h4 className="font-medium text-muted-foreground">Break</h4>
                    <div className="flex items-center space-x-4 min-w-[120px] justify-end">
                      <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {topic.duration} minutes
                      </span>
                      <div className={getTopicStatus(index) ? "study-done" : "study-pending"}>
                        {getTopicStatus(index) && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="timeline-dot flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{index + 1}</span>
                  </div>
                  <div className="flex justify-between items-center w-full pl-10">
                    <h4 className="font-medium text-primary"><span>&ensp;&ensp;</span>{topic.name}</h4>
                    <div className="flex items-center space-x-4 min-w-[120px] justify-end">
                      <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {topic.duration} minutes
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={getTopicStatus(index) ? "study-done" : "study-pending"}
                        onClick={() => markTopicCompleted(index)}
                      >
                        {getTopicStatus(index) && <Check className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default StudyPlan;
