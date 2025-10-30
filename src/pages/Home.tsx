import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TaskSection } from "@/components/TaskSection";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { EmptyState } from "@/components/EmptyState";
import { useTasks } from "@/contexts/TaskContext";
import { useStepUpAnalysis } from "@/hooks/use-step-up-analysis";
import { toast } from "sonner";

const Home = () => {
  const { tasks, toggleTask, incrementTask, deleteTask, checkRecurringTasksManually } = useTasks();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Automatically analyze tasks for step-up suggestions in the background
  useStepUpAnalysis();

  // Check for recurring tasks when Home page loads
  useEffect(() => {
    const checkRecurring = async () => {
      try {
        const resetCount = await checkRecurringTasksManually();
        if (resetCount > 0) {
          console.log(`🔄 Reset ${resetCount} recurring tasks`);
        }
      } catch (error) {
        console.error('Error checking recurring tasks:', error);
      }
    };

    // Check after a short delay to ensure tasks are loaded
    const timer = setTimeout(checkRecurring, 1000);
    return () => clearTimeout(timer);
  }, [checkRecurringTasksManually]);

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);

  // Group tasks by date
  const todayTasks = tasks.filter((task) => task.createdAt >= today);
  
  const yesterdayTasks = tasks.filter(
    (task) => task.createdAt < today && task.createdAt >= yesterday
  );

  const twoDaysAgoTasks = tasks.filter(
    (task) => task.createdAt < yesterday && task.createdAt >= twoDaysAgo
  );

  const olderTasks = tasks.filter((task) => task.createdAt < twoDaysAgo);

  // Debug: Log task distribution
  console.log('📊 Task distribution:', {
    total: tasks.length,
    today: todayTasks.length,
    yesterday: yesterdayTasks.length,
    todayDate: today.toDateString(),
    yesterdayDate: yesterday.toDateString()
  });

  const handleIncrement = (id: string) => {
    incrementTask(id);
    const task = tasks.find((t) => t.id === id);
    if (task?.count && task.count.current + 1 === task.count.total) {
      toast.success("Goal completed! 🎉");
    }
  };

  // Check if there are any tasks at all
  const hasAnyTasks = tasks.length > 0;

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-lg mx-auto flex-col overflow-x-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] animate-fade-in">
      <AppHeader currentDate={getCurrentDate()} />

      <main>
        {!hasAnyTasks ? (
          <EmptyState onAddTask={() => setAddDialogOpen(true)} />
        ) : (
          <>
            {/* Older Tasks (3+ days ago) */}
            {olderTasks.length > 0 && (
              <div className="animate-slide-in-right" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
                <TaskSection
                  title="From Earlier"
                  tasks={olderTasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              </div>
            )}

            {/* Two Days Ago */}
            {twoDaysAgoTasks.length > 0 && (
              <div className="animate-slide-in-right" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                <TaskSection
                  title="From 2 Days Ago"
                  tasks={twoDaysAgoTasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              </div>
            )}

            {/* Yesterday */}
            {yesterdayTasks.length > 0 && (
              <div className="animate-slide-in-right" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
                <TaskSection
                  title="From Yesterday"
                  tasks={yesterdayTasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              </div>
            )}

            {/* Today */}
            <div className="mt-4 animate-slide-in-right" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
              <TaskSection
                title="Today"
                tasks={todayTasks}
                onToggle={toggleTask}
                onIncrement={handleIncrement}
                onDelete={deleteTask}
              />
            </div>
          </>
        )}
      </main>

      <FloatingActionButton onClick={() => setAddDialogOpen(true)} />
      <AddTaskDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
};

export default Home;
