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
  
  // If no study plan exists, redirect to study plan generator
  useEffect(() => {
    if (!hasStudyPlan()) {
      navigate("/study-plan-generator");
    }
  }, [hasStudyPlan, navigate]);

  if (!hasStudyPlan()) {
    return null;
  }

  // Mock data for charts - in a real app, this would come from API/database
  const progressData = [
    { name: "Arrays", progress: 75 },
    { name: "Strings", progress: 90 },
    { name: "Recursion", progress: 60 },
    { name: "Trees", progress: 70 },
    { name: "Graphs", progress: 80 },
  ];

  const quizData = [
    { name: "Quiz 1", score: 70 },
    { name: "Quiz 2", score: 85 },
    { name: "Quiz 3", score: 75 },
    { name: "Quiz 4", score: 90 },
    { name: "Quiz 5", score: 80 },
  ];
  
  const topicsRadarData = [
    { subject: "Array", A: 80 },
    { subject: "String", A: 90 },
    { subject: "Recursion", A: 65 },
    { subject: "Trees", A: 70 },
    { subject: "Graphs", A: 85 },
    { subject: "DP", A: 60 },
  ];

  // Calculate remaining time for exam
  const examDate = studyPlan ? new Date(studyPlan.examDate) : new Date();
  const now = new Date();
  const timeRemaining = examDate.getTime() - now.getTime();
  
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return (
    <div>
      <SectionTitle>DASHBOARD</SectionTitle>
      
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
