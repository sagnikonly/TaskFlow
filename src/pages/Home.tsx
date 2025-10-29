import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TaskSection } from "@/components/TaskSection";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { EmptyState } from "@/components/EmptyState";
import { useTasks } from "@/contexts/TaskContext";
import { useStepUpAnalysis } from "@/hooks/use-step-up-analysis";
import { toast } from "sonner";

const Home = () => {
  const { tasks, toggleTask, incrementTask, deleteTask } = useTasks();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Automatically analyze tasks for step-up suggestions in the background
  useStepUpAnalysis();

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterdayTasks = tasks.filter(
    (task) => task.createdAt < today && task.createdAt >= yesterday
  );

  const todayTasks = tasks.filter((task) => task.createdAt >= today);

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
            {yesterdayTasks.length > 0 && (
              <div className="animate-slide-in-right" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                <TaskSection
                  title="From Yesterday"
                  tasks={yesterdayTasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              </div>
            )}

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
