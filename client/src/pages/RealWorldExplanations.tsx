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
import { Download, Loader2 } from "lucide-react";
import { generateRealWorldExplanation } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

const RealWorldExplanations = () => {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateExplanation = async () => {
    if (!topic) {
      toast({
        title: "Missing topic",
        description: "Please select a topic before generating an explanation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const content = await generateRealWorldExplanation(topic);
      setExplanation(content);
    } catch (error) {
      toast({
        title: "Error generating explanation",
        description: "There was an error generating your explanation. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!explanation) return;
    
    // Save explanation to local storage before downloading
    try {
      // Get existing explanations or initialize empty array
      const savedExplanations = localStorage.getItem('realWorldExplanations');
      const explanationsArray = savedExplanations ? JSON.parse(savedExplanations) : [];
      
      // Add new explanation
      explanationsArray.push({
        id: `exp-${Date.now()}`,
        topic: topic,
        content: explanation,
        createdAt: new Date().toISOString()
      });
      
      // Save back to local storage
      localStorage.setItem('realWorldExplanations', JSON.stringify(explanationsArray));
      
      // Create download
      const element = document.createElement("a");
      const file = new Blob([explanation], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${topic}_explanation.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Show success message
      toast({
        title: "Explanation saved",
        description: "Explanation has been saved to your history and downloaded"
      });
    } catch (error) {
      console.error("Error saving explanation:", error);
      
      // Just download if saving fails
      const element = document.createElement("a");
      const file = new Blob([explanation], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${topic}_explanation.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div>
      <SectionTitle>Real-World Explanation</SectionTitle>

      <Container className="mb-6">
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Linked List">Linked List</SelectItem>
              <SelectItem value="Array & String">Array & String</SelectItem>
              <SelectItem value="Stack & Queue">Stack & Queue</SelectItem>
              <SelectItem value="Tree & Graph">Tree & Graph</SelectItem>
              <SelectItem value="Hashing">Hashing</SelectItem>
              <SelectItem value="Dynamic Programming">Dynamic Programming</SelectItem>
              <SelectItem value="Recursion">Recursion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleGenerateExplanation}
            className="bg-primary hover:bg-secondary text-white"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Notes"
            )}
          </Button>
        </div>
      </Container>

      {explanation && (
        <Container>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Explanation</h3>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div>
            <h4 className="text-2xl font-bold mb-4">{topic}</h4>
            <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: explanation }} />
          </div>
        </Container>
      )}
    </div>
  );
};

export default RealWorldExplanations;
