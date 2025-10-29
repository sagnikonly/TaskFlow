import { Card } from "@/components/ui/card";
import { useTasks } from "@/contexts/TaskContext";
import { Brain, AlertCircle, TrendingUp, Clock, Target, Zap } from "lucide-react";
import { useBackButton } from "@/hooks/use-back-button";
import { useHaptics } from "@/hooks/use-haptics";

interface AdvancedInsightsProps {
  onClose: () => void;
}

export const AdvancedInsights = ({ onClose }: AdvancedInsightsProps) => {
  const { tasks, getTaskStats } = useTasks();
  const stats = getTaskStats();
  const { haptic } = useHaptics();

  // Handle back button
  useBackButton({
    onBack: () => {
      onClose();
      return true;
    },
    priority: 20,
  });

  // Analyze completion patterns by day of week
  const getDayOfWeekPattern = () => {
    const dayStats = Array(7).fill(0).map(() => ({ completed: 0, total: 0 }));
    
    tasks.forEach((task) => {
      if (task.completionHistory) {
        task.completionHistory.forEach((entry) => {
          if (entry.completed) {
            const date = new Date(entry.date);
            const dayOfWeek = date.getDay();
            dayStats[dayOfWeek].completed++;
          }
        });
      }
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayStats.map((stat, index) => ({
      day: dayNames[index],
      count: stat.completed,
      rate: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
  };

  // Analyze priority distribution
  const getPriorityAnalysis = () => {
    const priorities = { high: 0, medium: 0, low: 0 };
    const completed = { high: 0, medium: 0, low: 0 };

    tasks.forEach((task) => {
      const priority = task.priority || 'medium';
      priorities[priority]++;
      if (task.completed) completed[priority]++;
    });

    return [
      { 
        priority: 'High', 
        total: priorities.high, 
        completed: completed.high,
        rate: priorities.high > 0 ? Math.round((completed.high / priorities.high) * 100) : 0,
        color: 'from-red-500/20 to-orange-500/20',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-600',
        bgColor: 'bg-red-500/10'
      },
      { 
        priority: 'Medium', 
        total: priorities.medium, 
        completed: completed.medium,
        rate: priorities.medium > 0 ? Math.round((completed.medium / priorities.medium) * 100) : 0,
        color: 'from-yellow-500/20 to-amber-500/20',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-500/10'
      },
      { 
        priority: 'Low', 
        total: priorities.low, 
        completed: completed.low,
        rate: priorities.low > 0 ? Math.round((completed.low / priorities.low) * 100) : 0,
        color: 'from-green-500/20 to-emerald-500/20',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-600',
        bgColor: 'bg-green-500/10'
      },
    ];
  };

  // Analyze recurrence patterns
  const getRecurrenceAnalysis = () => {
    const patterns = { daily: 0, weekly: 0, monthly: 0, none: 0 };
    const completed = { daily: 0, weekly: 0, monthly: 0, none: 0 };

    tasks.forEach((task) => {
      const recurrence = task.recurrence || 'none';
      patterns[recurrence]++;
      if (task.completed) completed[recurrence]++;
    });

    return Object.entries(patterns).map(([type, total]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      total,
      completed: completed[type as keyof typeof completed],
      rate: total > 0 ? Math.round((completed[type as keyof typeof completed] / total) * 100) : 0,
    })).filter(item => item.total > 0);
  };

  // Calculate burnout risk
  const calculateBurnoutRisk = () => {
    const last7Days = stats.heatMapData.slice(-7);
    const activeDays = last7Days.filter(d => d.count > 0).length;
    const avgTasksPerDay = activeDays > 0 ? last7Days.reduce((sum, d) => sum + d.count, 0) / activeDays : 0;
    
    // High risk if working 7 days straight with high task count
    if (activeDays === 7 && avgTasksPerDay > 10) return { level: 'high', message: 'Take a break! You\'ve been working non-stop.' };
    if (activeDays >= 6 && avgTasksPerDay > 8) return { level: 'medium', message: 'Consider taking a rest day soon.' };
    return { level: 'low', message: 'Great balance! Keep it up.' };
  };

  // Suggest optimal task load
  const suggestOptimalLoad = () => {
    const completedTasks = tasks.filter(t => t.completed);
    const avgCompletionTime = completedTasks.length > 0 ? 7 : 0; // Simplified
    const currentWeeklyAvg = stats.weekCompleted;
    
    if (currentWeeklyAvg < 5) return { suggestion: 7, message: 'Try completing 7 tasks per week for steady progress.' };
    if (currentWeeklyAvg < 10) return { suggestion: 12, message: 'You can handle more! Aim for 12 tasks per week.' };
    if (currentWeeklyAvg < 15) return { suggestion: 15, message: 'Great pace! 15 tasks per week is optimal.' };
    return { suggestion: currentWeeklyAvg, message: 'Excellent! Maintain your current pace.' };
  };

  // Find best time to add tasks
  const findBestTimeToAddTasks = () => {
    const dayPattern = getDayOfWeekPattern();
    const bestDay = dayPattern[0];
    const worstDay = dayPattern[dayPattern.length - 1];
    
    return {
      bestDay: bestDay.day,
      worstDay: worstDay.day,
      message: `You're most productive on ${bestDay.day}s. Consider adding new tasks then.`
    };
  };

  const dayPattern = getDayOfWeekPattern();
  const priorityAnalysis = getPriorityAnalysis();
  const recurrenceAnalysis = getRecurrenceAnalysis();
  const burnoutRisk = calculateBurnoutRisk();
  const optimalLoad = suggestOptimalLoad();
  const bestTime = findBestTimeToAddTasks();

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-slide-in-right">
          <button
            onClick={() => {
              haptic('light');
              onClose();
            }}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <span className="material-symbols-outlined text-foreground">close</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-foreground">Advanced Insights</h2>
            <p className="text-sm text-muted-foreground">AI-powered analytics</p>
          </div>
        </div>

        {/* Burnout Risk */}
        <Card className={`bg-gradient-to-br ${
          burnoutRisk.level === 'high' ? 'from-red-500/20 to-orange-500/20 border-red-500/30' :
          burnoutRisk.level === 'medium' ? 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' :
          'from-green-500/20 to-emerald-500/20 border-green-500/30'
        } border p-6 rounded-[2rem] mb-6 animate-scale-in`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${
              burnoutRisk.level === 'high' ? 'bg-red-500/10' :
              burnoutRisk.level === 'medium' ? 'bg-yellow-500/10' :
              'bg-green-500/10'
            }`}>
              <AlertCircle className={`w-6 h-6 ${
                burnoutRisk.level === 'high' ? 'text-red-600' :
                burnoutRisk.level === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Burnout Risk: {burnoutRisk.level.charAt(0).toUpperCase() + burnoutRisk.level.slice(1)}
              </h3>
              <p className="text-sm text-muted-foreground">{burnoutRisk.message}</p>
            </div>
          </div>
        </Card>

        {/* Optimal Task Load */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Optimal Task Load</h3>
              <p className="text-sm text-muted-foreground">{optimalLoad.message}</p>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 bg-primary/10 rounded-2xl">
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-1">{optimalLoad.suggestion}</div>
              <div className="text-xs text-muted-foreground">tasks per week</div>
            </div>
          </div>
        </Card>

        {/* Best Time to Add Tasks */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 border p-6 rounded-[2rem] mb-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/10">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Best Time to Add Tasks</h3>
              <p className="text-sm text-muted-foreground mb-3">{bestTime.message}</p>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-bold">
                  ✓ {bestTime.bestDay}
                </div>
                <div className="px-3 py-1 bg-red-500/20 text-red-600 rounded-full text-xs font-bold">
                  ✗ {bestTime.worstDay}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Day of Week Pattern */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Productivity by Day</h3>
          </div>
          <div className="space-y-3">
            {dayPattern.slice(0, 5).map((day, index) => {
              const maxCount = dayPattern[0].count;
              const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              
              return (
                <div key={day.day} className="animate-fade-in" style={{ animationDelay: `${0.4 + index * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{day.day}</span>
                    <span className="text-sm font-bold text-primary">{day.count} tasks</span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Priority Analysis */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Priority Distribution</h3>
          </div>
          <div className="space-y-3">
            {priorityAnalysis.map((priority, index) => (
              <Card
                key={priority.priority}
                className={`bg-gradient-to-br ${priority.color} ${priority.borderColor} border p-4 rounded-2xl animate-scale-in`}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${priority.bgColor}`}>
                      <span className={`material-symbols-outlined ${priority.textColor} text-lg`}>
                        {priority.priority === 'High' ? 'priority_high' : 
                         priority.priority === 'Medium' ? 'remove' : 'arrow_downward'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{priority.priority} Priority</span>
                  </div>
                  <span className={`text-lg font-black ${priority.textColor}`}>{priority.rate}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{priority.completed} completed</span>
                  <span>{priority.total} total</span>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Recurrence Pattern Analysis */}
        {recurrenceAnalysis.length > 0 && (
          <Card className="bg-surface border-border p-6 rounded-[2rem] animate-slide-in-right" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Recurrence Patterns</h3>
            </div>
            <div className="space-y-3">
              {recurrenceAnalysis.map((pattern, index) => (
                <div key={pattern.type} className="flex items-center justify-between p-3 bg-muted/20 rounded-2xl animate-fade-in" style={{ animationDelay: `${0.6 + index * 0.05}s` }}>
                  <div>
                    <div className="text-sm font-bold text-foreground">{pattern.type}</div>
                    <div className="text-xs text-muted-foreground">{pattern.total} tasks</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-primary">{pattern.rate}%</div>
                    <div className="text-xs text-muted-foreground">completion</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
