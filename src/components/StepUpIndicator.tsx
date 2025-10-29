import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTasks } from "@/contexts/TaskContext";
import { toast } from "sonner";

interface StepUpIndicatorProps {
  task: any;
}

const StepUpIndicator = ({ task }: StepUpIndicatorProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const { updateTask } = useTasks();

  if (!task.stepUpSuggestion) return null;

  const handleAcceptStepUp = () => {
    const oldGoal = task.count?.total || 0;
    const newGoal = task.stepUpSuggestion.newGoal;
    const newCount = task.count
      ? { ...task.count, total: newGoal }
      : undefined;

    // Record this step-up in history
    const stepUpHistory = task.stepUpHistory || [];
    const newStepUpHistory = [
      ...stepUpHistory,
      {
        oldGoal,
        newGoal,
        date: new Date().toISOString(),
      }
    ];

    updateTask(task.id, {
      count: newCount,
      isStepUp: true,
      stepUpDate: new Date().toISOString(),
      stepUpHistory: newStepUpHistory,
      stepUpSuggestion: undefined,
    });

    toast.success("Great! You've stepped up your goal! 🎉");
    setShowDialog(false);
  };

  const handleDismiss = () => {
    updateTask(task.id, {
      stepUpSuggestion: undefined,
    });
    setShowDialog(false);
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all hover:scale-110"
        title="Step up suggestion available"
      >
        <span className="material-symbols-outlined text-base">trending_up</span>
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-surface border-border rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">
                trending_up
              </span>
              Step Up Suggestion
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-primary/5 rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Suggested Goal</p>
              <p className="text-2xl font-bold text-foreground">
                {task.stepUpSuggestion.currentGoal} → {task.stepUpSuggestion.newGoal}
              </p>
            </div>

            <div className="space-y-2">
              <div className="bg-background rounded-2xl p-3">
                <p className="text-sm text-foreground">{task.stepUpSuggestion.reason}</p>
              </div>

              <div className="bg-background rounded-2xl p-3">
                <p className="text-sm text-muted-foreground italic">
                  {task.stepUpSuggestion.motivationalMessage}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1 rounded-full border-border"
              >
                Not Now
              </Button>
              <Button
                onClick={handleAcceptStepUp}
                className="flex-1 bg-primary hover:bg-primary/90 rounded-full"
              >
                Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StepUpIndicator;
