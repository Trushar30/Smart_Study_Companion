import { useState } from "react";
import { Container, SectionTitle } from "@/components/ui/container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { generateQuiz } from "@/lib/gemini";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

const Quiz = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const handleGenerateQuiz = async () => {
    if (!topic || !difficulty || !questionCount) {
      toast({
        title: "Missing fields",
        description: "Please select all options before generating a quiz",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setQuizQuestions(null);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    
    try {
      const questions = await generateQuiz(topic, difficulty, parseInt(questionCount));
      setQuizQuestions(questions);
    } catch (error) {
      toast({
        title: "Error generating quiz",
        description: "There was an error generating your quiz. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (questionId: number, option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: option,
    });
  };

  const handleSubmitQuiz = () => {
    if (!quizQuestions) return;
    
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      toast({
        title: "Incomplete quiz",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      });
      return;
    }
    
    let correctAnswers = 0;
    
    quizQuestions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore(correctAnswers);
    setShowResults(true);
    
    // Save quiz result to local storage to persist between sessions
    try {
      // Get existing results or initialize empty array
      const savedResults = localStorage.getItem('quizResults');
      const quizResults = savedResults ? JSON.parse(savedResults) : [];
      
      // Add new result
      quizResults.push({
        id: Date.now(),
        topic: topic,
        difficulty: difficulty,
        score: correctAnswers,
        totalQuestions: quizQuestions.length,
        timestamp: new Date().toISOString(),
      });
      
      // Save back to local storage
      localStorage.setItem('quizResults', JSON.stringify(quizResults));
      
      toast({
        title: "Quiz Submitted",
        description: `You scored ${correctAnswers} out of ${quizQuestions.length}. Results saved.`,
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast({
        title: "Quiz Submitted",
        description: `You scored ${correctAnswers} out of ${quizQuestions.length}`,
      });
    }
  };

  const alphaOptions = ['A', 'B', 'C', 'D', 'E'];
  
  return (
    <div>
      <SectionTitle>Quiz</SectionTitle>

      <Container className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Array & String">Array & String</SelectItem>
                <SelectItem value="Stack & Queue">Stack & Queue</SelectItem>
                <SelectItem value="Linked List">Linked List</SelectItem>
                <SelectItem value="Tree & Graph">Tree & Graph</SelectItem>
                <SelectItem value="Sorting">Sorting</SelectItem>
                <SelectItem value="Dynamic Programming">Dynamic Programming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionCount">Numbers of Questions</Label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue placeholder="Select number of questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleGenerateQuiz}
            className="bg-primary hover:bg-secondary text-white"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </div>
      </Container>

      {quizQuestions && quizQuestions.length > 0 && (
        <Container>
          <h3 className="text-xl font-bold mb-6">Quiz</h3>

          {quizQuestions.map((question, questionIndex) => (
            <div key={question.id} className="mb-8">
              <div className="flex mb-4">
                <div className="bg-primary text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-3">
                  {questionIndex + 1}
                </div>
                <h4 className="text-lg font-medium pt-2">{question.question}</h4>
              </div>

              <div className="ml-14 space-y-4">
                {question.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex}
                    className="quiz-option"
                    onClick={() => handleOptionSelect(question.id, option)}
                  >
                    <div 
                      className={cn("quiz-option-circle", {
                        "selected": selectedAnswers[question.id] === option,
                        "bg-green-500 border-green-500": showResults && option === question.correctAnswer,
                        "bg-red-500 border-red-500": showResults && selectedAnswers[question.id] === option && option !== question.correctAnswer,
                      })}
                    >
                      {alphaOptions[optionIndex]}
                    </div>
                    <p className="pt-1">{option}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!showResults && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleSubmitQuiz}
                className="bg-primary hover:bg-secondary text-white"
              >
                Submit Quiz
              </Button>
            </div>
          )}

          {showResults && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Quiz Results</h3>
              <p>You scored {score} out of {quizQuestions.length} ({Math.round((score / quizQuestions.length) * 100)}%)</p>
              <Button 
                onClick={handleGenerateQuiz}
                className="mt-4 bg-primary hover:bg-secondary text-white"
              >
                Take Another Quiz
              </Button>
            </div>
          )}
        </Container>
      )}
    </div>
  );
};

export default Quiz;
