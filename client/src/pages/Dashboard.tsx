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
  Tooltip,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [location, navigate] = useLocation();
  const { studyPlan, hasStudyPlan, markTopicCompleted, getTopicStatus } = useStudyPlan();
  // State for the timer
  const [countdownDays, setCountdownDays] = useState(0);
  const [countdownHours, setCountdownHours] = useState(0);
  const [countdownMinutes, setCountdownMinutes] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  useEffect(() => {
    if (!hasStudyPlan()) {
      navigate("/study-plan-generator");
    }
  }, [hasStudyPlan, navigate]);

  // Add a real-time countdown effect
  useEffect(() => {
    if (!studyPlan) return;
    
    // Parse exam date function
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

    // Update timer function
    const updateTimer = () => {
      const examDate = parseExamDate(studyPlan.examDate);
      const now = new Date();
      const timeRemaining = examDate.getTime() - now.getTime();
      
      if (timeRemaining <= 0) {
        // Exam date has passed
        setCountdownDays(0);
        setCountdownHours(0);
        setCountdownMinutes(0);
        setCountdownSeconds(0);
        return;
      }
      
      setCountdownDays(Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));
      setCountdownHours(Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      setCountdownMinutes(Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));
      setCountdownSeconds(Math.floor((timeRemaining % (1000 * 60)) / 1000));
    };

    // Initial update
    updateTimer();
    
    // Set interval to update every second
    const interval = setInterval(updateTimer, 1000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [studyPlan]);

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

  // Load real quiz data from localStorage, tracking progress per topic
  const loadQuizData = () => {
    try {
      const savedResults = localStorage.getItem('quizResults');
      if (savedResults) {
        const results = JSON.parse(savedResults);
        
        // Create a map to track attempts per topic
        const topicAttempts: {[key: string]: any[]} = {};
        
        // Group quiz attempts by topic
        results.forEach((result: any) => {
          if (!topicAttempts[result.topic]) {
            topicAttempts[result.topic] = [];
          }
          topicAttempts[result.topic].push({
            score: Math.round((result.score / result.totalQuestions) * 100),
            timestamp: result.timestamp
          });
        });
        
        // Format data for chart - show multiple attempts for the same topics
        // This shows how score improved between attempts
        const chartData: any[] = [];
        
        Object.entries(topicAttempts).forEach(([topic, attempts]) => {
          // Sort attempts by timestamp
          attempts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          // Add each attempt as a point on the chart, showing progression
          attempts.forEach((attempt, index) => {
            const displayName = topic.length > 10 ? topic.substring(0, 10) + '...' : topic;
            chartData.push({
              name: `${displayName} #${index + 1}`,
              score: attempt.score
            });
          });
        });
        
        // Return the most recent 5 entries
        return chartData.slice(-5);
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
            name: topic.name.length > 8 ? topic.name.substring(0, 8) + '...' : topic.name,
            score: 75 // Default score (75%) for completed topics as placeholder
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
          <div className="flex justify-between items-center mt-2">
            <div className="flex flex-col items-center">
              <div className="countdown-box mb-1">
                <span className="text-xl font-bold">{countdownDays < 10 ? `0${countdownDays}` : countdownDays}</span>
              </div>
              <span className="text-xs text-muted-foreground">DAYS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="countdown-box mb-1">
                <span className="text-xl font-bold">{countdownHours < 10 ? `0${countdownHours}` : countdownHours}</span>
              </div>
              <span className="text-xs text-muted-foreground">HOURS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="countdown-box mb-1">
                <span className="text-xl font-bold">{countdownMinutes < 10 ? `0${countdownMinutes}` : countdownMinutes}</span>
              </div>
              <span className="text-xs text-muted-foreground">MINS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="countdown-box mb-1">
                <span className="text-xl font-bold">{countdownSeconds < 10 ? `0${countdownSeconds}` : countdownSeconds}</span>
              </div>
              <span className="text-xs text-muted-foreground">SECS</span>
            </div>
          </div>
        </Container>
        
        {/* Progress */}
        <Container>
          <h3 className="text-lg font-semibold mb-4">PROGRESS</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--muted))' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--muted))' }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '4px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="progress" 
                  name="Completed" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="target" 
                  name="Target" 
                  fill="hsl(var(--chart-1))" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Container>
        
        {/* Quiz Results */}
        <Container>
          <h3 className="text-lg font-semibold mb-4">QUIZ</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--muted))' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--muted))' }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Score']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '4px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  name="Quiz Score"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
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
              <RadarChart outerRadius={80} cx="50%" cy="50%" data={topicsRadarData}>
                <PolarGrid stroke="hsl(var(--muted-foreground))" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--muted))' }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  axisLine={{ stroke: 'hsl(var(--muted))' }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar
                  name="Coverage"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Coverage']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '4px',
                    color: 'hsl(var(--foreground))',
                  }}
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
                  <div className="timeline-dot bg-gray-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center w-full pl-3">
                    <div className="mr-4">
                      <h4 className="font-medium text-muted-foreground">Break</h4>
                    </div>
                    <div className="flex items-center space-x-4 min-w-[120px] justify-end">
                      <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {topic.duration} minutes
                      </span>
                      <div className={`${getTopicStatus(index) ? "study-done" : "study-pending"} w-6 h-6 flex items-center justify-center rounded-sm min-w-[24px]`}>
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
                  <div className="flex justify-between items-center w-full pl-3">
                    <div className="mr-4 max-w-[70%] truncate">
                      <h4 className="font-medium text-primary">{topic.name}</h4>
                    </div>
                    <div className="flex items-center space-x-4 min-w-[120px] justify-end">
                      <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {topic.duration} minutes
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className={`${getTopicStatus(index) ? "study-done" : "study-pending"} w-6 h-6 p-0 flex items-center justify-center rounded-sm min-w-[24px]`}
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