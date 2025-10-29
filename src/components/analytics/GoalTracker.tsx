import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { Target, TrendingUp, Calendar, Award, Zap } from "lucide-react";
import { useBackButton } from "@/hooks/use-back-button";

interface GoalTrackerProps {
  onClose: () => void;
}

export const GoalTracker = ({ onClose }: GoalTrackerProps) => {
  const { profile } = useAuth();
  const { tasks, getTaskStats } = useTasks();
  const stats = getTaskStats();

  // Handle back button
  useBackButton({
    onBack: () => {
      onClose();
      return true;
    },
    priority: 20,
  });

  // Calculate days until target (assuming exam/goal is in 6 months if not specified)
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 6);
  const today = new Date();
  const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate progress metrics
  const totalTasks = stats.total;
  const completedTasks = stats.completed;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate weekly average
  const weeklyAvg = stats.weekCompleted;

  // Project completion date based on current pace
  const remainingTasks = totalTasks - completedTasks;
  const projectedWeeks = weeklyAvg > 0 ? Math.ceil(remainingTasks / weeklyAvg) : 0;
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + (projectedWeeks * 7));

  // Calculate if on track
  const requiredWeeklyRate = daysUntilTarget > 0 ? Math.ceil(remainingTasks / (daysUntilTarget / 7)) : 0;
  const isOnTrack = weeklyAvg >= requiredWeeklyRate;

  // Milestones
  const milestones = [
    { label: "25% Complete", target: Math.ceil(totalTasks * 0.25), achieved: completedTasks >= Math.ceil(totalTasks * 0.25) },
    { label: "50% Complete", target: Math.ceil(totalTasks * 0.5), achieved: completedTasks >= Math.ceil(totalTasks * 0.5) },
    { label: "75% Complete", target: Math.ceil(totalTasks * 0.75), achieved: completedTasks >= Math.ceil(totalTasks * 0.75) },
    { label: "100% Complete", target: totalTasks, achieved: completedTasks >= totalTasks },
  ];

  // Calculate momentum (comparing last week to previous week)
  const last7Days = stats.heatMapData.slice(-7).reduce((sum, d) => sum + d.count, 0);
  const previous7Days = stats.heatMapData.slice(-14, -7).reduce((sum, d) => sum + d.count, 0);
  const momentum = previous7Days > 0 ? Math.round(((last7Days - previous7Days) / previous7Days) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-slide-in-right">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <span className="material-symbols-outlined text-foreground">close</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-foreground">Goal Tracker</h2>
            <p className="text-sm text-muted-foreground">Track your journey to success</p>
          </div>
        </div>

        {/* Target Goal Card */}
        {profile?.target_exam && (
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 border p-6 rounded-[2rem] mb-6 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/10">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-foreground mb-1">{profile.target_exam}</h3>
                {profile.goal && (
                  <p className="text-sm text-muted-foreground mb-3">{profile.goal}</p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-foreground">{daysUntilTarget} days remaining</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 border p-5 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-col gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 w-fit">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-foreground">{completionRate}%</div>
              <div className="text-xs font-medium text-muted-foreground">Progress</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 border p-5 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col gap-2">
              <div className="p-2 rounded-xl bg-green-500/10 w-fit">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-black text-foreground">{weeklyAvg}</div>
              <div className="text-xs font-medium text-muted-foreground">Weekly Avg</div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Overall Progress</h3>
            <span className="text-2xl font-black text-primary">{completionRate}%</span>
          </div>
          
          <div className="relative w-full h-6 bg-muted/20 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${completionRate}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{completedTasks} completed</span>
            <span className="text-muted-foreground">{remainingTasks} remaining</span>
          </div>
        </Card>

        {/* Status Card */}
        <Card className={`bg-gradient-to-br ${
          isOnTrack 
            ? "from-green-500/20 to-emerald-500/20 border-green-500/30" 
            : "from-orange-500/20 to-red-500/20 border-orange-500/30"
        } border p-6 rounded-[2rem] mb-6 animate-scale-in`} style={{ animationDelay: "0.4s" }}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${isOnTrack ? "bg-green-500/10" : "bg-orange-500/10"}`}>
              {isOnTrack ? (
                <Award className={`w-6 h-6 ${isOnTrack ? "text-green-600" : "text-orange-600"}`} />
              ) : (
                <TrendingUp className="w-6 h-6 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {isOnTrack ? "On Track! 🎉" : "Need to Speed Up"}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isOnTrack 
                  ? `You're doing great! Keep up the pace of ${weeklyAvg} tasks per week.`
                  : `Complete ${requiredWeeklyRate} tasks per week to reach your goal on time.`
                }
              </p>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  momentum > 0 ? "bg-green-500/20 text-green-600" :
                  momentum < 0 ? "bg-red-500/20 text-red-600" :
                  "bg-gray-500/20 text-gray-600"
                }`}>
                  {momentum > 0 ? "↑" : momentum < 0 ? "↓" : "→"} {Math.abs(momentum)}% momentum
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Milestones */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.5s" }}>
          <h3 className="text-lg font-bold text-foreground mb-4">Milestones</h3>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      milestone.achieved 
                        ? "bg-green-500 text-white" 
                        : "bg-muted/30 text-muted-foreground"
                    }`}>
                      {milestone.achieved ? (
                        <span className="material-symbols-outlined text-lg">check</span>
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      milestone.achieved ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {milestone.label}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    milestone.achieved ? "text-green-600" : "text-muted-foreground"
                  }`}>
                    {milestone.target} tasks
                  </span>
                </div>
                {index < milestones.length - 1 && (
                  <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                    milestone.achieved ? "bg-green-500" : "bg-muted/30"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Projection */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] animate-slide-in-right" style={{ animationDelay: "0.6s" }}>
          <h3 className="text-lg font-bold text-foreground mb-4">Projected Completion</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-2xl">
              <span className="text-sm text-muted-foreground">At current pace</span>
              <span className="text-sm font-bold text-foreground">
                {projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-2xl">
              <span className="text-sm text-muted-foreground">Estimated weeks</span>
              <span className="text-sm font-bold text-foreground">{projectedWeeks} weeks</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-2xl">
              <span className="text-sm text-foreground font-medium">Required weekly rate</span>
              <span className="text-sm font-bold text-primary">{requiredWeeklyRate} tasks/week</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
