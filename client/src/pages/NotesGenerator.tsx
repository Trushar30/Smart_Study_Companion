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
import { Download } from "lucide-react";
import { generateNotesContent } from "@/lib/gemini";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NotesGenerator = () => {
  const [topic, setTopic] = useState("");
  const [detailLevel, setDetailLevel] = useState("");
  const [format, setFormat] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [notesContent, setNotesContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateNotes = async () => {
    if (!topic || !detailLevel || !format) {
      toast({
        title: "Missing fields",
        description: "Please select all options before generating notes",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const content = await generateNotesContent(topic, detailLevel, format);
      setNotesContent(content);
    } catch (error) {
      toast({
        title: "Error generating notes",
        description: "There was an error generating your notes. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!notesContent) return;
    
    // Save note to local storage before downloading
    try {
      // Get existing notes or initialize empty array
      const savedNotes = localStorage.getItem('generatedNotes');
      const notesArray = savedNotes ? JSON.parse(savedNotes) : [];
      
      // Add new note
      notesArray.push({
        id: `note-${Date.now()}`,
        topic: topic,
        detailLevel: detailLevel,
        format: format,
        content: notesContent,
        createdAt: new Date().toISOString()
      });
      
      // Save back to local storage
      localStorage.setItem('generatedNotes', JSON.stringify(notesArray));
      
      // Create download
      const element = document.createElement("a");
      const file = new Blob([notesContent], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${topic}_notes.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Show success message
      toast({
        title: "Notes saved",
        description: "Notes have been saved to your history and downloaded"
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      
      // Just download if saving fails
      const element = document.createElement("a");
      const file = new Blob([notesContent], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${topic}_notes.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div>
      <SectionTitle>NOTES GENERATOR</SectionTitle>

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
            <Label htmlFor="detailLevel">Detail Level</Label>
            <Select value={detailLevel} onValueChange={setDetailLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select detail level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select a format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bullet points">Bullet points</SelectItem>
                <SelectItem value="Paragraphs">Paragraphs</SelectItem>
                <SelectItem value="Q&A Format">Q&A Format</SelectItem>
                <SelectItem value="Summary">Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleGenerateNotes}
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

      {notesContent && (
        <Container>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">NOTES</h3>
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
            <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: notesContent }} />
          </div>
        </Container>
      )}
    </div>
  );
};

export default NotesGenerator;
