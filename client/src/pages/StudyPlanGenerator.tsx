import { useState } from "react";
import { useLocation } from "wouter";
import { Container, SectionTitle } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, CalendarIcon, Clock } from "lucide-react";
import { generateStudyPlan } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StudyPlanGenerator = () => {
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedAmPm, setSelectedAmPm] = useState<string>("AM");
  const [isGenerating, setIsGenerating] = useState(false);
  const { setStudyPlan } = useStudyPlan();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Format date and time for display and API
  const formattedDate = selectedDate 
    ? format(selectedDate, "dd/MM/yyyy")
    : "";
    
  const examDate = selectedDate 
    ? `${formattedDate} ${selectedHour}:${selectedMinute} ${selectedAmPm}`
    : "";

  const handleGenerateStudyPlan = async () => {
    if (!subject || !topics || !selectedDate) {
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
            <Label htmlFor="examDate" className="text-muted-foreground">EXAM DATE</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full mt-2 flex justify-between text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate ? formattedDate : "Select a date"}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="hour" className="text-muted-foreground">HOUR</Label>
              <Select 
                value={selectedHour} 
                onValueChange={setSelectedHour}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="minute" className="text-muted-foreground">MINUTE</Label>
              <Select 
                value={selectedMinute} 
                onValueChange={setSelectedMinute}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="ampm" className="text-muted-foreground">AM/PM</Label>
              <Select 
                value={selectedAmPm} 
                onValueChange={setSelectedAmPm}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {examDate && (
            <div className="text-sm text-muted-foreground text-center">
              Selected Exam Time: <span className="font-medium">{examDate}</span>
            </div>
          )}

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
