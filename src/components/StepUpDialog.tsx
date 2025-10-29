import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/contexts/TaskContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useHaptics } from "@/hooks/use-haptics";
import { createConfettiBurst } from "@/lib/confetti";

interface StepUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StepUpDialog = ({ open, onOpenChange }: StepUpDialogProps) => {
  const { addTask, categories } = useTasks();
  const { haptic } = useHaptics();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    title: string;
    category: string;
    priority: "low" | "medium" | "high";
  }>>([]);

  const generateSuggestions = async () => {
    const apiKey = localStorage.getItem("gemini_api_key");
    
    if (!apiKey) {
      toast.error("Please add your Gemini API key in Settings first!");
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a productivity coach. Based on common productivity patterns, suggest 3-5 new tasks that would help someone step up their game. Available categories: ${categories.join(", ")}. 
                
Format your response as a JSON array with objects containing: title (string), category (string - must be one of the available categories), priority (string - "low", "medium", or "high").

Example format:
[
  {"title": "Morning meditation", "category": "Health", "priority": "medium"},
  {"title": "Learn new skill", "category": "Personal Growth", "priority": "high"}
]

Only respond with the JSON array, no additional text.`
              }]
            }],
            generationConfig: {
              temperature: 0.9,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 1024,
            }
          }),
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setSuggestions(parsed);
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        throw new Error("No suggestions received");
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (suggestion: typeof suggestions[0]) => {
    haptic('success');
    addTask({
      title: suggestion.title,
      category: suggestion.category,
      priority: suggestion.priority,
      completed: false,
      isStepUp: true,
      stepUpDate: new Date().toISOString(),
      recurrence: "none",
    });
    toast.success(`Added: ${suggestion.title}`);
  };

  const handleAddAll = () => {
    haptic('success');
    suggestions.forEach((suggestion) => {
      addTask({
        title: suggestion.title,
        category: suggestion.category,
        priority: suggestion.priority,
        completed: false,
        isStepUp: true,
        stepUpDate: new Date().toISOString(),
        recurrence: "none",
      });
    });
    toast.success(`Added ${suggestions.length} tasks!`);
    createConfettiBurst(40);
    onOpenChange(false);
    setSuggestions([]);
  };

  React.useEffect(() => {
    if (open && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-surface border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-xl">
            <span className="material-symbols-outlined text-primary">trending_up</span>
            Step Up Your Game
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating personalized suggestions...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              AI-powered task suggestions to help you level up:
            </p>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-background p-4 rounded-2xl border border-border flex items-start justify-between gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
                >
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{suggestion.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        suggestion.priority === "high" ? "bg-destructive/20 text-destructive" :
                        suggestion.priority === "medium" ? "bg-primary/20 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddTask(suggestion)}
                    className="shrink-0"
                  >
                    <span className="material-symbols-outlined text-primary">add</span>
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddAll}
                className="flex-1 rounded-2xl bg-primary hover:bg-primary/90"
              >
                Add All Tasks
              </Button>
              <Button
                onClick={() => {
                  haptic('medium');
                  generateSuggestions();
                }}
                variant="outline"
                className="rounded-2xl active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">refresh</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No suggestions available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

import * as React from "react";
