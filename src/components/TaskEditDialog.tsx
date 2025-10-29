import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTasks, Task } from "@/contexts/TaskContext";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export const TaskEditDialog = ({ open, onOpenChange, task }: TaskEditDialogProps) => {
  const { updateTask, categories } = useTasks();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly" | "custom">("none");
  const [notes, setNotes] = useState("");
  const [hasCount, setHasCount] = useState(false);
  const [countTotal, setCountTotal] = useState(10);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCategory(task.category);
      setPriority(task.priority || "medium");
      setRecurrence(task.recurrence || "none");
      setNotes(task.notes || "");
      setHasCount(!!task.count);
      setCountTotal(task.count?.total || 10);
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    updateTask(task.id, {
      title: title.trim(),
      category,
      priority,
      recurrence,
      notes: notes.trim() || undefined,
      ...(hasCount && { count: { current: task.count?.current || 0, total: countTotal } }),
      ...(!hasCount && { count: undefined }),
    });

    toast.success("Task updated successfully!");
    onOpenChange(false);
  };

  const handleManualStepUp = () => {
    if (!task || !task.count) {
      toast.error("This task doesn't have a goal counter");
      return;
    }

    const currentGoal = task.count.total;
    const suggestedIncrease = Math.ceil(currentGoal * 0.15); // 15% increase
    const newGoal = currentGoal + suggestedIncrease;

    // Record in step-up history
    const stepUpHistory = task.stepUpHistory || [];
    const newStepUpHistory = [
      ...stepUpHistory,
      {
        oldGoal: currentGoal,
        newGoal: newGoal,
        date: new Date().toISOString(),
      }
    ];

    updateTask(task.id, {
      count: { ...task.count, total: newGoal },
      isStepUp: true,
      stepUpDate: new Date().toISOString(),
      stepUpHistory: newStepUpHistory,
      stepUpSuggestion: undefined, // Clear any AI suggestion
    });

    setCountTotal(newGoal);
    toast.success(`Goal increased from ${currentGoal} to ${newGoal}! 🎉`);
  };

  const handleCustomStepUp = () => {
    if (!task || !task.count) return;

    const currentGoal = task.count.total;
    const newGoalInput = prompt(`Current goal: ${currentGoal}\n\nEnter new goal:`, String(currentGoal + 5));
    
    if (!newGoalInput) return;
    
    const newGoal = parseInt(newGoalInput);
    
    if (isNaN(newGoal) || newGoal <= currentGoal) {
      toast.error("New goal must be greater than current goal");
      return;
    }

    if (newGoal > currentGoal * 1.5) {
      const confirm = window.confirm(
        `That's a ${Math.round((newGoal - currentGoal) / currentGoal * 100)}% increase! Are you sure?`
      );
      if (!confirm) return;
    }

    // Record in step-up history
    const stepUpHistory = task.stepUpHistory || [];
    const newStepUpHistory = [
      ...stepUpHistory,
      {
        oldGoal: currentGoal,
        newGoal: newGoal,
        date: new Date().toISOString(),
      }
    ];

    updateTask(task.id, {
      count: { ...task.count, total: newGoal },
      isStepUp: true,
      stepUpDate: new Date().toISOString(),
      stepUpHistory: newStepUpHistory,
      stepUpSuggestion: undefined,
    });

    setCountTotal(newGoal);
    toast.success(`Goal updated to ${newGoal}! 🎉`);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface dark:bg-surface border-border max-w-md rounded-t-3xl rounded-b-none sm:rounded-3xl fixed bottom-0 left-1/2 -translate-x-1/2 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-y-1/2 w-[calc(100%-2rem)] sm:w-full animate-slide-up">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit</span>
            Edit Task
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-foreground font-medium">Task Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="bg-background dark:bg-background border-border rounded-2xl"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category" className="text-foreground font-medium">Category</Label>
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

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="edit-priority" className="text-foreground font-medium">Priority</Label>
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

          {/* Recurrence */}
          <div className="space-y-2">
            <Label htmlFor="edit-recurrence" className="text-foreground font-medium">Recurrence</Label>
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
          </div>

          {/* Goal Counter */}
          {hasCount && (
            <>
              <Separator className="bg-border/50" />
              
              <div className="space-y-3 bg-primary/5 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Goal Target</Label>
                  <span className="text-sm text-muted-foreground">
                    Current: {task.count?.current || 0}/{task.count?.total || 0}
                  </span>
                </div>
                
                <Input
                  type="number"
                  value={countTotal}
                  onChange={(e) => setCountTotal(Number(e.target.value))}
                  min={1}
                  className="bg-background dark:bg-background border-border rounded-2xl"
                />

                {/* Manual Step-Up Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Quick Step-Up</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleManualStepUp}
                      variant="outline"
                      className="flex-1 rounded-2xl border-primary/50 hover:bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                      +15% ({Math.ceil((task.count?.total || 0) * 0.15)})
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCustomStepUp}
                      variant="outline"
                      className="flex-1 rounded-2xl border-primary/50 hover:bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">edit</span>
                      Custom
                    </Button>
                  </div>
                </div>

                {/* Step-Up History */}
                {task.stepUpHistory && task.stepUpHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Step-Up History
                    </Label>
                    <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                      {task.stepUpHistory.slice(-3).reverse().map((su, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="material-symbols-outlined text-xs text-primary">trending_up</span>
                          <span>{su.oldGoal} → {su.newGoal}</span>
                          <span className="text-xs opacity-60">
                            ({new Date(su.date).toLocaleDateString()})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-foreground font-medium">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context for AI analysis"
              className="bg-background dark:bg-background border-border rounded-2xl min-h-[80px] resize-none"
            />
          </div>

          {/* Task Info */}
          <div className="bg-background rounded-2xl p-3 space-y-1">
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Created:</span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            {task.stepUpDate && (
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Last Step-Up:</span>
                <span>{new Date(task.stepUpDate).toLocaleDateString()}</span>
              </div>
            )}
            {task.completionHistory && (
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Completion Rate:</span>
                <span>
                  {task.completionHistory.filter(h => h.completed).length}/
                  {task.completionHistory.length} days
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-2xl"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 rounded-2xl bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
