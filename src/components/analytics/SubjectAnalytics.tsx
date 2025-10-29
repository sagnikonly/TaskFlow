import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useTasks } from "@/contexts/TaskContext";
import { TrendingUp, TrendingDown, Minus, Target, Zap, Calendar } from "lucide-react";

interface SubjectAnalyticsProps {
  onClose: () => void;
}

export const SubjectAnalytics = ({ onClose }: SubjectAnalyticsProps) => {
  const { tasks, categories, categoryIcons } = useTasks();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const getSubjectStats = (category: string) => {
    const categoryTasks = tasks.filter((t) => t.category === category);
    const completed = categoryTasks.filter((t) => t.completed).length;
    const total = categoryTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const hasCompletion = categoryTasks.some((task) =>
        task.completionHistory?.some((h) => h.date === dateStr && h.completed)
      );
      
      if (hasCompletion) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Get last 7 days trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const count = categoryTasks.reduce((sum, task) => {
        const dayCompletions = task.completionHistory?.filter(
          (h) => h.date === dateStr && h.completed
        ).length || 0;
        return sum + dayCompletions;
      }, 0);
      
      last7Days.push(count);
    }

    // Calculate trend
    const firstHalf = last7Days.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const secondHalf = last7Days.slice(4, 7).reduce((a, b) => a + b, 0) / 3;
    const trend = secondHalf > firstHalf ? "up" : secondHalf < firstHalf ? "down" : "stable";

    // Step-up stats
    const stepUpTasks = categoryTasks.filter((t) => t.isStepUp);
    const stepUpCount = stepUpTasks.length;
    const completedStepUps = stepUpTasks.filter((t) => t.completed).length;

    return {
      total,
      completed,
      completionRate,
      currentStreak,
      last7Days,
      trend,
      stepUpCount,
      completedStepUps,
    };
  };

  const subjectColors = [
    { bg: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30", text: "text-violet-600", icon: "bg-violet-500/10" },
    { bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-600", icon: "bg-blue-500/10" },
    { bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", text: "text-green-600", icon: "bg-green-500/10" },
    { bg: "from-orange-500/20 to-red-500/20", border: "border-orange-500/30", text: "text-orange-600", icon: "bg-orange-500/10" },
    { bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", text: "text-pink-600", icon: "bg-pink-500/10" },
  ];

  if (selectedSubject) {
    const stats = getSubjectStats(selectedSubject);
    const colorIndex = categories.indexOf(selectedSubject) % subjectColors.length;
    const colors = subjectColors[colorIndex];
    const maxValue = Math.max(...stats.last7Days, 1);

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 animate-slide-in-right">
            <button
              onClick={() => setSelectedSubject(null)}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <span className="material-symbols-outlined text-foreground">arrow_back</span>
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-foreground">{selectedSubject}</h2>
              <p className="text-sm text-muted-foreground">Detailed Analytics</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className={`bg-gradient-to-br ${colors.bg} ${colors.border} border p-5 rounded-[2rem] animate-scale-in`}>
              <div className="flex flex-col gap-2">
                <div className={`p-2 rounded-xl ${colors.icon} w-fit`}>
                  <Target className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="text-3xl font-black text-foreground">{stats.completionRate}%</div>
                <div className="text-xs font-medium text-muted-foreground">Completion Rate</div>
              </div>
            </Card>

            <Card className={`bg-gradient-to-br ${colors.bg} ${colors.border} border p-5 rounded-[2rem] animate-scale-in`} style={{ animationDelay: "0.1s" }}>
              <div className="flex flex-col gap-2">
                <div className={`p-2 rounded-xl ${colors.icon} w-fit`}>
                  <Zap className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="text-3xl font-black text-foreground">{stats.currentStreak}</div>
                <div className="text-xs font-medium text-muted-foreground">Day Streak</div>
              </div>
            </Card>
          </div>

          {/* Trend Card */}
          <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">7-Day Trend</h3>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                stats.trend === "up" ? "bg-green-500/10 text-green-600" :
                stats.trend === "down" ? "bg-red-500/10 text-red-600" :
                "bg-gray-500/10 text-gray-600"
              }`}>
                {stats.trend === "up" ? <TrendingUp className="w-4 h-4" /> :
                 stats.trend === "down" ? <TrendingDown className="w-4 h-4" /> :
                 <Minus className="w-4 h-4" />}
                <span className="text-xs font-bold capitalize">{stats.trend}</span>
              </div>
            </div>

            <div className="flex items-end justify-between h-32 gap-2">
              {stats.last7Days.map((count, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-muted/20 rounded-full overflow-hidden flex items-end justify-center relative" style={{ height: '100px' }}>
                    <div 
                      className={`w-full bg-gradient-to-t ${colors.bg.replace('/20', '/60')} rounded-full transition-all duration-700`}
                      style={{ 
                        height: `${(count / maxValue) * 100}%`,
                        minHeight: count > 0 ? '15px' : '0',
                        animationDelay: `${index * 0.1}s`
                      }}
                    />
                    {count > 0 && (
                      <span className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-foreground">
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][(new Date().getDay() - 6 + index + 7) % 7]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Step-Up Progress */}
          {stats.stepUpCount > 0 && (
            <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
              <h3 className="text-lg font-bold text-foreground mb-4">Step-Up Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Step-Ups</span>
                  <span className="text-2xl font-black text-foreground">{stats.stepUpCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="text-2xl font-black text-green-600">{stats.completedStepUps}</span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${stats.stepUpCount > 0 ? (stats.completedStepUps / stats.stepUpCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Task Breakdown */}
          <Card className="bg-surface border-border p-6 rounded-[2rem] animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-lg font-bold text-foreground mb-4">Task Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-2xl">
                <span className="text-foreground font-medium">Completed</span>
                <span className="text-xl font-black text-green-600">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-2xl">
                <span className="text-foreground font-medium">Pending</span>
                <span className="text-xl font-black text-orange-600">{stats.total - stats.completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-2xl">
                <span className="text-foreground font-medium">Total Tasks</span>
                <span className="text-xl font-black text-primary">{stats.total}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-black text-foreground">Subject Analytics</h2>
            <p className="text-sm text-muted-foreground">Deep dive into each subject</p>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="space-y-3">
          {categories.map((category, index) => {
            const stats = getSubjectStats(category);
            const colors = subjectColors[index % subjectColors.length];

            return (
              <Card
                key={category}
                onClick={() => setSelectedSubject(category)}
                className={`bg-gradient-to-br ${colors.bg} ${colors.border} border p-5 rounded-[2rem] cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-slide-in-right`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${colors.icon}`}>
                      <span className={`material-symbols-outlined ${colors.text} text-2xl`}>
                        {categoryIcons[category] || "label"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{category}</h3>
                      <p className="text-xs text-muted-foreground">{stats.total} tasks</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-black text-foreground">{stats.completionRate}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-foreground">{stats.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-black ${
                      stats.trend === "up" ? "text-green-600" :
                      stats.trend === "down" ? "text-red-600" :
                      "text-gray-600"
                    }`}>
                      {stats.trend === "up" ? "↑" : stats.trend === "down" ? "↓" : "→"}
                    </div>
                    <div className="text-xs text-muted-foreground">Trend</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
