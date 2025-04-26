import { useState } from "react";
import { useLocation } from "wouter";
import { Container, SectionTitle } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { generateStudyPlan } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { useStudyPlan } from "@/hooks/useStudyPlan";

const StudyPlanGenerator = () => {
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState("");
  const [examDate, setExamDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { setStudyPlan } = useStudyPlan();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const handleGenerateStudyPlan = async () => {
    if (!subject || !topics || !examDate) {
      toast({
        title: "Missing fields",
        description: "Please fill all fields before generating a study plan",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const plan = await generateStudyPlan(subject, topics, examDate);
      setStudyPlan(plan);
      toast({
        title: "Study plan generated",
        description: "Your study plan has been successfully generated!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error generating study plan",
        description: "There was an error generating your study plan. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <SectionTitle>STUDY PLAN</SectionTitle>

      <Container className="max-w-2xl mx-auto">
        <div className="space-y-5">
          <div>
            <Label htmlFor="subject" className="text-muted-foreground">SUBJECT</Label>
            <Input
              id="subject"
              placeholder="ENTER YOUR SUBJECT"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="topics" className="text-muted-foreground">TOPIC [ COMMA SEPARATED ]</Label>
            <Input
              id="topics"
              placeholder="ENTER TOPIC"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="examDate" className="text-muted-foreground">EXAM DATE & TIME</Label>
            <Input
              id="examDate"
              placeholder="DD/MM/YYYY   HH:MM AM"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="pt-4 flex justify-center">
            <Button
              onClick={handleGenerateStudyPlan}
              className="bg-primary hover:bg-secondary text-white"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  GENERATING...
                </>
              ) : (
                "GENERATE STUDY PLAN"
              )}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default StudyPlanGenerator;
