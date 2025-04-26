import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container, SectionTitle } from "@/components/ui/container";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { StudyPlan, Topic } from "@/types";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const Dashboard = () => {
  const [location, navigate] = useLocation();
  const { studyPlan, hasStudyPlan, markTopicCompleted, getTopicStatus } = useStudyPlan();

  useEffect(() => {
    if (!hasStudyPlan()) {
      navigate("/study-plan-generator");
    }
  }, [hasStudyPlan, navigate]);

  if (!hasStudyPlan()) {
    return null;
  }

  // Extract data from current study plan
  const completedTopicsCount = studyPlan?.topics.filter((_, index) => getTopicStatus(index)).length || 0;
  const nonBreakTopicsCount = studyPlan?.topics.filter(topic => !topic.isBreak).length || 0;
  
  // Create progress data from actual topic completion status
  const progressData = studyPlan?.topics
    .filter(topic => !topic.isBreak)
    .map((topic, index) => ({
      name: topic.name.length > 10 ? topic.name.substring(0, 10) + '...' : topic.name,
      progress: getTopicStatus(index) ? 100 : 0,
      target: 100
    })) || [];

  // Load real quiz data from localStorage
  const loadQuizData = () => {
    try {
      const savedResults = localStorage.getItem('quizResults');
      if (savedResults) {
        const results = JSON.parse(savedResults);
        // Get the 5 most recent quiz results
        return results
          .slice(-5)
          .map((result: any, index: number) => ({
            name: `Quiz ${index + 1}`,
            score: Math.round((result.score / result.totalQuestions) * 100)
          }));
      }
    } catch (error) {
      console.error("Error loading quiz results:", error);
    }
    
    // If no quiz data found or error, use completed topics as a fallback
    return completedTopicsCount > 0 
      ? studyPlan?.topics
          .filter((topic, index) => !topic.isBreak && getTopicStatus(index))
          .slice(0, 5)
          .map((topic, i) => ({
            name: `Topic ${i + 1}`,
            score: 100 // Complete score for completed topics
          }))
      : [];
  };
  
  const quizData = loadQuizData();
  
  // Load notes and explanations from localStorage to create a comprehensive radar chart
  const loadTopicsRadarData = () => {
    try {
      // Get study plan topics first
      const planTopics = studyPlan?.topics
        .filter(topic => !topic.isBreak)
        .slice(0, 3) // Take up to 3 topics from study plan
        .map((topic, index) => ({
          subject: topic.name.length > 8 ? topic.name.substring(0, 8) + '...' : topic.name,
          A: getTopicStatus(index) ? 100 : 0
        })) || [];
      
      // Get notes topics (if any)
      const savedNotes = localStorage.getItem('generatedNotes');
      let notesTopics: any[] = [];
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        notesTopics = notes
          .slice(-2) // Get 2 most recent notes
          .map((note: any) => ({
            subject: note.topic.length > 8 ? note.topic.substring(0, 8) + '...' : note.topic,
            A: 80 // Notes contribute 80% to topic coverage
          }));
      }
      
      // Get explanations topics (if any)
      const savedExplanations = localStorage.getItem('realWorldExplanations');
      let explanationTopics: any[] = [];
      if (savedExplanations) {
        const explanations = JSON.parse(savedExplanations);
        explanationTopics = explanations
          .slice(-1) // Get 1 most recent explanation
          .map((exp: any) => ({
            subject: exp.topic.length > 8 ? exp.topic.substring(0, 8) + '...' : exp.topic,
            A: 90 // Explanations contribute 90% to topic coverage
          }));
      }
      
      // Combine all topics
      return [...planTopics, ...notesTopics, ...explanationTopics];
    } catch (error) {
      console.error("Error loading topic radar data:", error);
      
      // Fallback to study plan topics only
      return studyPlan?.topics
        .filter(topic => !topic.isBreak)
        .slice(0, 6)
        .map((topic, index) => ({
          subject: topic.name.length > 8 ? topic.name.substring(0, 8) + '...' : topic.name,
          A: getTopicStatus(index) ? 100 : 0
        })) || [];
    }
  };
  
  const topicsRadarData = loadTopicsRadarData();

  // Calculate remaining time for exam
  const parseExamDate = (dateString: string) => {
    // Parse a date string like "27/04/2025 12:00 PM"
    if (!dateString) return new Date();
    
    try {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/').map(num => parseInt(num, 10));
      
      let [hourMinute, amPm] = ['12:00', 'AM']; // Default values
      
      if (timePart) {
        if (timePart.includes('AM') || timePart.includes('PM')) {
          const amPmSplit = timePart.split(' ');
          hourMinute = amPmSplit[0];
          amPm = amPmSplit[1];
        } else {
          hourMinute = timePart;
        }
      }
      
      const [hour, minute] = hourMinute.split(':').map(num => parseInt(num, 10));
      
      // Create a date object with the parsed values
      const date = new Date(year, month - 1, day);
      
      // Add the time
      let hourValue = hour;
      // Convert to 24-hour format if PM
      if (amPm === 'PM' && hour < 12) {
        hourValue += 12;
      } else if (amPm === 'AM' && hour === 12) {
        hourValue = 0;
      }
      
      date.setHours(hourValue, minute || 0);
      return date;
    } catch (error) {
      console.error("Error parsing exam date:", error);
      return new Date(); // Return current date as fallback
    }
  };

  // Parse the exam date and calculate time remaining
  const examDate = studyPlan ? parseExamDate(studyPlan.examDate) : new Date();
  const now = new Date();
  const timeRemaining = examDate.getTime() - now.getTime();
  
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  // Calculate overall progress percentage
  const progressPercentage = Math.round((completedTopicsCount / nonBreakTopicsCount) * 100);

  return (
    <div>
      <SectionTitle>DASHBOARD</SectionTitle>
      
      {/* Overall Progress Summary */}
      <Container className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">STUDY PROGRESS SUMMARY</h3>
            <p className="text-muted-foreground">
              You've completed {completedTopicsCount} of {nonBreakTopicsCount} topics ({progressPercentage}% complete)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
        </div>
      </Container>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Countdown */}
        <Container>
          <h3 className="text-lg font-semibold mb-4">EXAM COUNTDOWN</h3>
          <p className="text-muted-foreground mb-2">SUBJECT:</p>
          <p className="font-medium mb-4">{studyPlan?.subject.toUpperCase()}</p>
          <p className="text-muted-foreground mb-2">TIME REMAINING:</p>
          <div className="flex space-x-3 mt-2">
            <div className="countdown-box">
              <span className="text-xl font-bold">{days < 10 ? `0${days}` : days}</span>
            </div>
            <div className="countdown-box">
              <span className="text-xl font-bold">{hours < 10 ? `0${hours}` : hours}</span>
            </div>
            <div className="countdown-box">
              <span className="text-xl font-bold">{minutes < 10 ? `0${minutes}` : minutes}</span>
            </div>
            <div className="countdown-box">
              <span className="text-xl font-bold">{seconds < 10 ? `0${seconds}` : seconds}</span>
            </div>
          </div>
          <div className="flex justify-between text-muted-foreground text-sm mt-1">
            <span>DAYS</span>
            <span>HOURS</span>
            <span>MINS</span>
            <span>SECS</span>
          </div>
        </Container>
        
        {/* Progress */}
        <Container>
          <h3 className="text-lg font-semibold mb-4">PROGRESS</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="progress" fill="hsl(var(--chart-2))" />
                <Bar dataKey="target" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Container>
        
        {/* Quiz Results */}
        <Container>
          <h3 className="text-lg font-semibold mb-4">QUIZ</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Container>
        
        {/* Topic Coverage */}
        <Container>
          <h3 className="text-lg font-semibold mb-4">TOPICS</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={topicsRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Coverage"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Container>
      </div>
      
      {/* Study Plan */}
      <Container className="mt-6">
        <h3 className="text-lg font-semibold mb-4">STUDY PLAN</h3>
        <div className="relative">
          <div className="timeline-line"></div>
          
          {studyPlan?.topics.map((topic, index) => (
            <div 
              key={index} 
              className="ml-12 pb-8 relative"
            >
              {topic.isBreak ? (
                <>
                  <div className="timeline-dot bg-gray-500">
                    <i className="fas fa-coffee text-xs"></i>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-muted-foreground">Break</h4>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
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
                  <div className="timeline-dot">
                    {index + 1}
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-primary">{topic.name}</h4>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
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

export default Dashboard;