import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useTasks } from "@/contexts/TaskContext";
import { Calendar, Filter } from "lucide-react";

interface ProductivityHeatmapProps {
  onClose: () => void;
}

export const ProductivityHeatmap = ({ onClose }: ProductivityHeatmapProps) => {
  const { tasks, categories } = useTasks();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Generate heatmap data for last 90 days
  const generateHeatmapData = () => {
    const data: { date: string; count: number; tasks: string[] }[] = [];
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      let count = 0;
      const completedTasks: string[] = [];
      
      tasks.forEach((task) => {
        // Filter by category if selected
        if (selectedCategory && task.category !== selectedCategory) return;
        
        if (task.completionHistory) {
          task.completionHistory.forEach((entry) => {
            if (entry.completed && entry.date === dateStr) {
              count++;
              completedTasks.push(task.title);
            }
          });
        }
      });
      
      data.push({ date: dateStr, count, tasks: completedTasks });
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();
  const maxCount = Math.max(...heatmapData.map(d => d.count), 1);

  // Group by weeks
  const weeks: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/30";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "bg-primary/20";
    if (intensity < 0.5) return "bg-primary/40";
    if (intensity < 0.75) return "bg-primary/60";
    return "bg-primary";
  };

  // Calculate stats
  const totalCompletions = heatmapData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = heatmapData.filter(d => d.count > 0).length;
  const avgPerDay = activeDays > 0 ? Math.round(totalCompletions / activeDays) : 0;
  const bestDay = heatmapData.reduce((max, d) => d.count > max.count ? d : max, heatmapData[0]);

  // Calculate current streak
  let currentStreak = 0;
  for (let i = heatmapData.length - 1; i >= 0; i--) {
    if (heatmapData[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
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
          <div className="flex-1">
            <h2 className="text-2xl font-black text-foreground">Productivity Heatmap</h2>
            <p className="text-sm text-muted-foreground">Last 90 days activity</p>
          </div>
        </div>

        {/* Filter */}
        <Card className="bg-surface border-border p-4 rounded-[2rem] mb-6 animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Filter by Subject</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/30 border p-4 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-black text-foreground">{activeDays}</div>
              <div className="text-xs font-medium text-muted-foreground">Active Days</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 border p-4 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-black text-foreground">{currentStreak}</div>
              <div className="text-xs font-medium text-muted-foreground">Current Streak</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 border p-4 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-black text-foreground">{avgPerDay}</div>
              <div className="text-xs font-medium text-muted-foreground">Avg Per Day</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 border p-4 rounded-[2rem] animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-black text-foreground">{bestDay.count}</div>
              <div className="text-xs font-medium text-muted-foreground">Best Day</div>
            </div>
          </Card>
        </div>

        {/* Heatmap */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] mb-6 animate-slide-in-right" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Activity Calendar</h3>
          </div>

          {/* Day labels */}
          <div className="flex gap-1 mb-2">
            <div className="w-8" />
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex-1 text-center text-xs text-muted-foreground font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    const date = new Date(day.date);
                    const isToday = day.date === new Date().toISOString().split("T")[0];
                    
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-7 h-7 rounded-lg ${getColor(day.count)} transition-all hover:scale-125 hover:ring-2 hover:ring-primary cursor-pointer relative group ${
                          isToday ? "ring-2 ring-foreground" : ""
                        }`}
                        title={`${date.toLocaleDateString()}: ${day.count} tasks`}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 animate-fade-in">
                          <div className="bg-foreground text-background px-3 py-2 rounded-xl text-xs whitespace-nowrap shadow-lg">
                            <div className="font-bold mb-1">{date.toLocaleDateString()}</div>
                            <div>{day.count} task{day.count !== 1 ? 's' : ''}</div>
                            {day.tasks.length > 0 && (
                              <div className="mt-1 pt-1 border-t border-background/20 max-w-[200px]">
                                {day.tasks.slice(0, 3).map((task, i) => (
                                  <div key={i} className="truncate">{task}</div>
                                ))}
                                {day.tasks.length > 3 && (
                                  <div className="text-background/60">+{day.tasks.length - 3} more</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-muted/30" />
              <div className="w-4 h-4 rounded bg-primary/20" />
              <div className="w-4 h-4 rounded bg-primary/40" />
              <div className="w-4 h-4 rounded bg-primary/60" />
              <div className="w-4 h-4 rounded bg-primary" />
            </div>
            <span>More</span>
          </div>
        </Card>

        {/* Monthly Breakdown */}
        <Card className="bg-surface border-border p-6 rounded-[2rem] animate-slide-in-right" style={{ animationDelay: "0.6s" }}>
          <h3 className="text-lg font-bold text-foreground mb-4">Monthly Breakdown</h3>
          <div className="space-y-3">
            {[0, 1, 2].map((monthOffset) => {
              const date = new Date();
              date.setMonth(date.getMonth() - monthOffset);
              const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              
              const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
              const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
              
              const monthData = heatmapData.filter((d) => {
                const itemDate = new Date(d.date);
                return itemDate >= monthStart && itemDate <= monthEnd;
              });
              
              const monthTotal = monthData.reduce((sum, d) => sum + d.count, 0);
              const monthActive = monthData.filter(d => d.count > 0).length;
              
              return (
                <div key={monthOffset} className="p-4 bg-muted/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">{monthName}</span>
                    <span className="text-xl font-black text-primary">{monthTotal}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {monthActive} active days • {monthActive > 0 ? Math.round(monthTotal / monthActive) : 0} avg/day
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
