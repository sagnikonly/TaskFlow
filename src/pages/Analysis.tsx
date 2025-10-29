import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/contexts/TaskContext";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Flame, TrendingUp, BarChart3, Target, Calendar, Brain, Sparkles, ChevronRight } from "lucide-react";
import { SubjectAnalytics } from "@/components/analytics/SubjectAnalytics";
import { StepUpDashboard } from "@/components/analytics/StepUpDashboard";
import { ProductivityHeatmap } from "@/components/analytics/ProductivityHeatmap";
import { GoalTracker } from "@/components/analytics/GoalTracker";
import { AdvancedInsights } from "@/components/analytics/AdvancedInsights";
import { useBackButton } from "@/hooks/use-back-button";
import { useHaptics } from "@/hooks/use-haptics";

type AnalyticsView = "overview" | "subjects" | "stepup" | "heatmap" | "goals" | "insights";

const Analysis = () => {
  const navigate = useNavigate();
  const { getTaskStats } = useTasks();
  const stats = getTaskStats();
  const [currentView, setCurrentView] = useState<AnalyticsView>("overview");
  const [renderKey, setRenderKey] = useState(0);
  const isReturningRef = useRef(false);
  const { haptic } = useHaptics();

  // Handle back button
  useBackButton({
    onBack: () => {
      if (currentView !== "overview") {
        // If in a subsection, go back to overview
        isReturningRef.current = true;
        setCurrentView("overview");
        setRenderKey(prev => prev + 1); // Force re-render without animations
        return true; // Handled
      }
      // If in overview, let default handler take over (go to home)
      navigate('/');
      return true;
    },
    priority: 10, // Higher priority than default
  });

  // Reset isReturning flag when view changes to non-overview
  useEffect(() => {
    if (currentView !== "overview") {
      isReturningRef.current = false;
    }
  }, [currentView]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Get weekly completion data (last 7 days)
  const getWeeklyData = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();
    const weekData = [];
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = (today - 6 + i + 7) % 7;
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      
      // Count actual completions from heatMapData
      const dayData = stats.heatMapData.find(d => d.date === dateStr);
      const tasksCompleted = dayData ? dayData.count : 0;
      
      weekData.push({
        day: days[dayIndex],
        count: tasksCompleted,
      });
    }
    return weekData;
  };

  const weeklyData = getWeeklyData();
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

  // Helper function to conditionally apply animations
  const getAnimationClass = (baseClass: string) => {
    return isReturningRef.current ? '' : baseClass;
  };

  // Get category distribution with actual data
  const categoryData = stats.categoryStats
    .filter((cat) => cat.total > 0)
    .sort((a, b) => b.total - a.total) // Sort by most tasks
    .slice(0, 5) // Take top 5 categories
    .map((cat, index) => {
      const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];
      return {
        name: cat.category,
        total: cat.total,
        percentage: stats.total > 0 ? Math.round((cat.total / stats.total) * 100) : 0,
        color: colors[index % colors.length],
      };
    });

  const totalPercentage = categoryData.reduce((sum, cat) => sum + cat.percentage, 0);
  const hasData = stats.total > 0;

  // Render different views
  if (currentView === "subjects") {
    return <SubjectAnalytics onClose={() => setCurrentView("overview")} />;
  }
  if (currentView === "stepup") {
    return <StepUpDashboard onClose={() => setCurrentView("overview")} />;
  }
  if (currentView === "heatmap") {
    return <ProductivityHeatmap onClose={() => setCurrentView("overview")} />;
  }
  if (currentView === "goals") {
    return <GoalTracker onClose={() => setCurrentView("overview")} />;
  }
  if (currentView === "insights") {
    return <AdvancedInsights onClose={() => setCurrentView("overview")} />;
  }

  return (
    <div key={renderKey} className="relative flex h-auto min-h-screen w-full max-w-lg mx-auto flex-col overflow-x-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] bg-background touch-manipulation">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${getAnimationClass('animate-slide-in-right')}`}>
        <div>
          <h1 className="text-3xl font-black text-foreground">Analysis</h1>
          <p className="text-sm text-muted-foreground">Track your progress & insights</p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className={`bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-950/30 dark:to-violet-900/20 border-0 p-5 rounded-[2rem] shadow-sm ${getAnimationClass('animate-scale-in')} active:scale-95 transition-transform cursor-pointer select-none`}>
          <div className="flex flex-col items-start gap-2">
            <div className="p-2 rounded-xl bg-violet-600/10">
              <CheckCircle2 className="w-6 h-6 text-violet-600" />
            </div>
            <div className="text-3xl font-black text-foreground">{stats.completed}</div>
            <div className="text-xs font-medium text-muted-foreground">Completed</div>
          </div>
        </Card>

        <Card className={`bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-950/30 dark:to-pink-900/20 border-0 p-5 rounded-[2rem] shadow-sm ${getAnimationClass('animate-scale-in')} active:scale-95 transition-transform cursor-pointer select-none`} style={!isReturningRef.current ? { animationDelay: "0.1s" } : {}}>
          <div className="flex flex-col items-start gap-2">
            <div className="p-2 rounded-xl bg-pink-600/10">
              <Flame className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-3xl font-black text-foreground">{stats.weekCompleted}</div>
            <div className="text-xs font-medium text-muted-foreground">This Week</div>
          </div>
        </Card>

        <Card className={`bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-950/30 dark:to-cyan-900/20 border-0 p-5 rounded-[2rem] shadow-sm ${getAnimationClass('animate-scale-in')} active:scale-95 transition-transform cursor-pointer select-none`} style={!isReturningRef.current ? { animationDelay: "0.2s" } : {}}>
          <div className="flex flex-col items-start gap-2">
            <div className="p-2 rounded-xl bg-cyan-600/10">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="text-3xl font-black text-foreground">{stats.stepUpStats.totalStepUps}</div>
            <div className="text-xs font-medium text-muted-foreground">Step-ups</div>
          </div>
        </Card>
      </div>

      {/* Daily Completion Chart - Moved here */}
      {hasData && (
        <Card className={`bg-surface border-border p-6 rounded-[2rem] mb-6 shadow-sm ${getAnimationClass('animate-slide-in-right')}`} style={!isReturningRef.current ? { animationDelay: "0.3s" } : {}}>
          <div className="mb-4">
            <h2 className="text-xl font-black text-foreground mb-1">Daily Completion</h2>
            <p className="text-xs text-muted-foreground">Tasks completed this week</p>
          </div>
          
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: `${0.4 + index * 0.05}s` }}>
                <div className="w-full bg-muted/20 rounded-full overflow-hidden flex items-end justify-center relative group cursor-pointer hover:bg-muted/30 transition-colors" style={{ height: '100px' }}>
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/80 rounded-full transition-all duration-700 hover:from-primary/90 hover:to-primary/70"
                    style={{ 
                      height: `${(day.count / maxCount) * 100}%`,
                      minHeight: day.count > 0 ? '15px' : '0'
                    }}
                  />
                  {day.count > 0 && (
                    <span className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.count}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Access Analytics Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card 
          onClick={() => {
            haptic('light');
            setCurrentView("subjects");
          }}
          className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 border p-5 rounded-[2rem] cursor-pointer active:scale-95 transition-all ${getAnimationClass('animate-slide-in-right')} select-none`}
          style={!isReturningRef.current ? { animationDelay: "0.75s" } : {}}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Subject Analytics</h3>
          <p className="text-xs text-muted-foreground">Deep dive by subject</p>
        </Card>

        <Card 
          onClick={() => {
            haptic('light');
            setCurrentView("stepup");
          }}
          className={`bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 border p-5 rounded-[2rem] cursor-pointer active:scale-95 transition-all ${getAnimationClass('animate-slide-in-right')} select-none`}
          style={!isReturningRef.current ? { animationDelay: "0.85s" } : {}}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Step-Up Dashboard</h3>
          <p className="text-xs text-muted-foreground">Track your growth</p>
        </Card>

        <Card 
          onClick={() => {
            haptic('light');
            setCurrentView("heatmap");
          }}
          className={`bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 border p-5 rounded-[2rem] cursor-pointer active:scale-95 transition-all ${getAnimationClass('animate-slide-in-right')} select-none`}
          style={!isReturningRef.current ? { animationDelay: "0.95s" } : {}}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Heatmap</h3>
          <p className="text-xs text-muted-foreground">90-day activity view</p>
        </Card>

        <Card 
          onClick={() => {
            haptic('light');
            setCurrentView("goals");
          }}
          className={`bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 border p-5 rounded-[2rem] cursor-pointer active:scale-95 transition-all ${getAnimationClass('animate-slide-in-right')} select-none`}
          style={!isReturningRef.current ? { animationDelay: "1.05s" } : {}}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-orange-500/10">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Goal Tracker</h3>
          <p className="text-xs text-muted-foreground">Progress to target</p>
        </Card>
      </div>

      {/* AI Insights Card */}
      <Card 
        onClick={() => {
          haptic('light');
          setCurrentView("insights");
        }}
        className={`bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/30 border p-6 rounded-[2rem] mb-6 cursor-pointer active:scale-95 transition-all ${getAnimationClass('animate-scale-in')} select-none`}
        style={!isReturningRef.current ? { animationDelay: "1.15s" } : {}}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10">
            <Brain className="w-7 h-7 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">Advanced Insights</h3>
            <p className="text-sm text-muted-foreground">AI-powered analytics & recommendations</p>
          </div>
          <ChevronRight className="w-6 h-6 text-amber-600" />
        </div>
      </Card>

      {hasData ? (
        <>

          {/* Subject Distribution */}
          <Card className={`bg-surface border-border p-6 rounded-[2rem] shadow-sm mb-6 ${getAnimationClass('animate-slide-in-right')}`} style={!isReturningRef.current ? { animationDelay: "1.25s" } : {}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-foreground">Subject Distribution</h2>
              <button
                onClick={() => {
                  haptic('light');
                  setCurrentView("subjects");
                }}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {categoryData.length > 0 ? (
              <>
                {/* Donut Chart */}
                <div className={`flex items-center justify-center mb-6 ${getAnimationClass('animate-scale-in')}`} style={!isReturningRef.current ? { animationDelay: "1.3s" } : {}}>
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 200 200" className="transform -rotate-90">
                      {categoryData.map((cat, index) => {
                        const prevPercentages = categoryData.slice(0, index).reduce((sum, c) => sum + c.percentage, 0);
                        const circumference = 2 * Math.PI * 70;
                        const offset = circumference - (cat.percentage / 100) * circumference;
                        const rotation = (prevPercentages / 100) * 360;
                        
                        return (
                          <circle
                            key={cat.name}
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke={cat.color}
                            strokeWidth="28"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-700 hover:stroke-width-32 cursor-pointer"
                            style={{
                              transformOrigin: '100px 100px',
                              transform: `rotate(${rotation}deg)`,
                            }}
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-black text-foreground animate-fade-in" style={{ animationDelay: "1.4s" }}>{totalPercentage}%</div>
                      <div className="text-xs font-medium text-muted-foreground">of Tasks</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  {categoryData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/20 transition-colors cursor-pointer animate-fade-in" style={{ animationDelay: `${1.5 + index * 0.05}s` }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full transition-transform hover:scale-125" 
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-base font-semibold text-foreground">{cat.name}</span>
                      </div>
                      <span className="text-base font-bold text-foreground">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No category data yet</p>
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card className={`bg-surface border-border p-8 rounded-[2rem] shadow-sm ${getAnimationClass('animate-scale-in')}`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4 animate-pulse">
              <span className="material-symbols-outlined text-primary text-5xl">analytics</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start completing tasks to see your progress and analytics here!
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-muted/20 rounded-2xl">
                <div className="text-2xl font-black text-foreground mb-1">0</div>
                <div className="text-xs text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="p-4 bg-muted/20 rounded-2xl">
                <div className="text-2xl font-black text-foreground mb-1">0</div>
                <div className="text-xs text-muted-foreground">Active Streak</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analysis;
