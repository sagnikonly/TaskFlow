import { Card } from "@/components/ui/card";
import { useTasks } from "@/contexts/TaskContext";
import { TrendingUp, Award, Target, Sparkles, CheckCircle2, Clock } from "lucide-react";

interface StepUpDashboardProps {
  onClose: () => void;
}

export const StepUpDashboard = ({ onClose }: StepUpDashboardProps) => {
  const { tasks } = useTasks();

  // Get all step-up tasks
  const stepUpTasks = tasks.filter((t) => t.isStepUp || t.stepUpHistory?.length);
  const activeStepUps = stepUpTasks.filter((t) => !t.completed);
  const completedStepUps = stepUpTasks.filter((t) => t.completed);
  
  // Calculate success rate
  const totalStepUps = stepUpTasks.length;
  const successRate = totalStepUps > 0 ? Math.round((completedStepUps.length / totalStepUps) * 100) : 0;

  // Get step-up timeline
  const stepUpTimeline = stepUpTasks
    .filter((t) => t.stepUpHistory && t.stepUpHistory.length > 0)
    .flatMap((task) =>
      task.stepUpHistory!.map((history) => ({
        taskTitle: task.title,
        category: task.category,
        oldGoal: history.oldGoal,
        newGoal: history.newGoal,
        date: new Date(history.date),
        increase: history.newGoal - history.oldGoal,
        percentIncrease: Math.round(((history.newGoal - history.oldGoal) / history.oldGoal) * 100),
      }))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  // Calculate total growth
  const totalGrowth = stepUpTimeline.reduce((sum, item) => sum + item.increase, 0);

  // Get tasks with suggestions
  const tasksWithSuggestions = tasks.filter((t) => t.stepUpSuggestion);

  // Calculate average increase
  const avgIncrease = stepUpTimeline.length > 0
    ? Math.round(stepUpTimeline.reduce((sum, item) => sum + item.percentIncrease, 0) / stepUpTimeline.length)
    : 0;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-24">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-slide-in-right">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <span className="material-symbols-outlined text-foreground">close</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-foreground">Step-Up Dashboard</h2>
            <p className="text-sm text-muted-foreground">Track your growth journey</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 border p-5 rounded-[2rem] animate-scale-in">
            <div className="flex flex-col gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 w-fit">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-foreground">{totalStepUps}</div>
              <div className="text-xs font-medium text-muted-foreground">Total Step-Ups</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 border p-5 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-col gap-2">
              <div className="p-2 rounded-xl bg-green-500/10 w-fit">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-black text-foreground">{successRate}%</div>
              <div className="text-xs font-medium text-muted-foreground">Success Rate</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 border p-5 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 w-fit">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-foreground">{totalGrowth}</div>
              <div className="text-xs font-medium text-muted-foreground">Total Growth</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 border p-5 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 w-fit">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-black text-foreground">{avgIncrease}%</div>
              <div className="text-xs font-medium text-muted-foreground">Avg Increase</div>
            </div>
          </Card>
        </div>

        {/* Active vs Completed */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-lg font-bold text-foreground mb-4">Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-foreground font-medium">Active Step-Ups</span>
              </div>
              <span className="text-2xl font-black text-orange-600">{activeStepUps.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-foreground font-medium">Completed</span>
              </div>
              <span className="text-2xl font-black text-green-600">{completedStepUps.length}</span>
            </div>
            <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Pending Suggestions */}
        {tasksWithSuggestions.length > 0 && (
          <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/30 border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">AI Suggestions</h3>
                <p className="text-xs text-muted-foreground">Ready to level up</p>
              </div>
            </div>
            <div className="space-y-2">
              {tasksWithSuggestions.slice(0, 3).map((task) => (
                <div key={task.id} className="bg-background/50 p-3 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{task.title}</span>
                    <span className="text-xs font-bold text-amber-600">
                      {task.stepUpSuggestion?.currentGoal} → {task.stepUpSuggestion?.newGoal}
                    </span>
                  </div>
                </div>
              ))}
              {tasksWithSuggestions.length > 3 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  +{tasksWithSuggestions.length - 3} more suggestions
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Growth Timeline */}
        {stepUpTimeline.length > 0 && (
          <Card className="bg-surface border-border p-6 rounded-[2rem] animate-slide-in-right" style={{ animationDelay: "0.6s" }}>
            <h3 className="text-lg font-bold text-foreground mb-4">Growth Timeline</h3>
            <div className="space-y-3">
              {stepUpTimeline.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/20 rounded-2xl hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${0.7 + index * 0.05}s` }}
                >
                  <div className="p-2 rounded-xl bg-primary/10 mt-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-foreground">{item.taskTitle}</span>
                      <span className="text-xs font-bold text-green-600">+{item.percentIncrease}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-1 bg-background rounded-lg">{item.category}</span>
                      <span>•</span>
                      <span>{item.oldGoal} → {item.newGoal}</span>
                      <span>•</span>
                      <span>{item.date.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {totalStepUps === 0 && (
          <Card className="bg-surface border-border p-8 rounded-[2rem] animate-scale-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Step-Ups Yet</h3>
              <p className="text-muted-foreground">
                Complete tasks consistently to unlock AI-powered step-up suggestions!
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
