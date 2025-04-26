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

  // Generate real data based on current study plan
  const progressData = studyPlan?.topics
    .filter(topic => !topic.isBreak)
    .map(topic => ({
      name: topic.name.length > 10 ? topic.name.substring(0, 10) + '...' : topic.name,
      progress: Math.random() * 100 // In a real app, this would come from actual progress tracking
    })) || [];

  // Generate quiz data based on topics
  const quizData = Array.from({ length: 5 }, (_, i) => ({
    name: `Quiz ${i + 1}`,
    score: Math.floor(Math.random() * 30) + 70 // Generate random scores between 70-100
  }));
  
  // Generate radar data for topic coverage
  const topicsRadarData = studyPlan?.topics
    .filter(topic => !topic.isBreak)
    .slice(0, 6) // Take at most 6 topics for the radar chart
    .map(topic => ({
      subject: topic.name.length > 8 ? topic.name.substring(0, 8) + '...' : topic.name,
      A: Math.floor(Math.random() * 40) + 60 // Generate random coverage between 60-100
    })) || [];

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

  // Calculate overall progress
  const completedTopics = studyPlan?.topics.filter((_, index) => getTopicStatus(index)).length || 0;
  const totalTopics = studyPlan?.topics.length || 1;
  const progressPercentage = Math.round((completedTopics / totalTopics) * 100);

  return (
    <div>
      <SectionTitle>DASHBOARD</SectionTitle>
      
      {/* Overall Progress Summary */}
      <Container className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">STUDY PROGRESS SUMMARY</h3>
            <p className="text-muted-foreground">
              You've completed {completedTopics} of {totalTopics} topics ({progressPercentage}% complete)
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
