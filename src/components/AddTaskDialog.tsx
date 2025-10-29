import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTasks } from "@/contexts/TaskContext";
import { toast } from "sonner";
import { useHaptics } from "@/hooks/use-haptics";
import { createConfettiBurst } from "@/lib/confetti";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTaskDialog = ({ open, onOpenChange }: AddTaskDialogProps) => {
  const { addTask, categories } = useTasks();
  const { haptic } = useHaptics();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [hasCount, setHasCount] = useState(false);
  const [countTotal, setCountTotal] = useState(10);
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      haptic('error');
      toast.error("Please enter a task title");
      return;
    }

    haptic('success');
    addTask({
      title: title.trim(),
      category,
      completed: false,
      priority,
      recurrence,
      notes: notes.trim() || undefined,
      ...(hasCount && { count: { current: 0, total: countTotal } }),
    });

    toast.success("Task added successfully!");
    
    // Confetti effect (if enabled)
    const confettiEnabled = localStorage.getItem("confetti_enabled");
    if (confettiEnabled === null || confettiEnabled === "true") {
      createConfettiBurst(30);
    }
    
    setTitle("");
    setCategory(categories[0] || "");
    setPriority("medium");
    setHasCount(false);
    setCountTotal(10);
    setRecurrence("none");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface dark:bg-surface border-border max-w-md mx-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl font-bold">Add New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="bg-background dark:bg-background border-border rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background dark:bg-background border-border rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface dark:bg-surface border-border rounded-2xl">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-foreground">Priority</Label>
            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
              <SelectTrigger className="bg-background dark:bg-background border-border rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface dark:bg-surface border-border rounded-2xl">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrence" className="text-foreground">Recurrence</Label>
            <Select value={recurrence} onValueChange={(v: any) => setRecurrence(v)}>
              <SelectTrigger className="bg-background dark:bg-background border-border rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface dark:bg-surface border-border rounded-2xl">
                <SelectItem value="none">One-time task</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {recurrence === "none" && "Task will not repeat"}
              {recurrence === "daily" && "Task repeats every day"}
              {recurrence === "weekly" && "Task repeats every week"}
              {recurrence === "monthly" && "Task repeats every month"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasCount"
              checked={hasCount}
              onChange={(e) => setHasCount(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="hasCount" className="text-foreground cursor-pointer">
              Add progress counter
            </Label>
          </div>

          {hasCount && (
            <div className="space-y-2">
              <Label htmlFor="countTotal" className="text-foreground">Goal Target</Label>
              <Input
                id="countTotal"
                type="number"
                value={countTotal}
                onChange={(e) => {
                  const value = e.target.value;
                  // If empty, set to empty string temporarily
                  if (value === '') {
                    setCountTotal(0);
                  } else {
                    // Parse and set the number, removing leading zeros
                    const num = parseInt(value, 10);
                    if (!isNaN(num) && num >= 1) {
                      setCountTotal(num);
                    }
                  }
                }}
                onFocus={(e) => {
                  // Select all text on focus for easy editing
                  e.target.select();
                }}
                min={1}
                className="bg-background dark:bg-background border-border rounded-2xl"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">Notes (Optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context for AI analysis"
              className="w-full min-h-[60px] px-4 py-3 bg-background dark:bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                haptic('light');
                onOpenChange(false);
              }}
              className="flex-1 rounded-2xl active:scale-95 transition-transform"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-2xl active:scale-95 transition-transform">
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
