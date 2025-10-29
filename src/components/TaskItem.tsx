import { useState, useRef } from "react";
import { Button } from "./ui/button";
import StepUpIndicator from "./StepUpIndicator";
import { TaskEditDialog } from "./TaskEditDialog";
import { useHaptics } from "@/hooks/use-haptics";
import { createConfettiFromElement } from "@/lib/confetti";

interface TaskItemProps {
  id: string;
  title: string;
  category: string;
  completed?: boolean;
  count?: { current: number; total: number };
  highlighted?: boolean;
  onToggle: (id: string) => void;
  onIncrement?: (id: string) => void;
  onDelete?: (id: string) => void;
  task?: any;
}

export const TaskItem = ({
  id,
  title,
  category,
  completed = false,
  count,
  highlighted = false,
  onToggle,
  onIncrement,
  onDelete,
  task,
}: TaskItemProps) => {
  const [isChecked, setIsChecked] = useState(completed);
  const [showDelete, setShowDelete] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { haptic } = useHaptics();
  const checkboxRef = useRef<HTMLLabelElement>(null);

  const handleToggle = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onToggle(id);
    
    // Haptic feedback
    if (newCheckedState) {
      haptic('success');
      // Confetti effect on task completion (if enabled)
      const confettiEnabled = localStorage.getItem("confetti_enabled");
      if ((confettiEnabled === null || confettiEnabled === "true") && checkboxRef.current) {
        createConfettiFromElement(checkboxRef.current, 20);
      }
    } else {
      haptic('medium');
    }
  };

  const handleDelete = () => {
    haptic('error');
    if (window.confirm(`Delete "${title}"?`)) {
      onDelete?.(id);
    }
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    // Don't open edit dialog if clicking on checkbox, buttons, or step-up indicator
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('label')
    ) {
      return;
    }
    haptic('light');
    setEditDialogOpen(true);
  };

  const displayTitle = count ? `${title} (${count.current}/${count.total})` : title;

  return (
    <>
      <div
        className={`
          flex items-center gap-4 rounded-3xl px-5 min-h-[80px] py-3 justify-between 
          transition-all duration-300 cursor-pointer 
          ${highlighted
            ? "bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 dark:from-primary/25 dark:via-primary/15 dark:to-primary/10 border-2 border-primary/30 shadow-lg shadow-primary/20"
            : "bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 shadow-md hover:shadow-xl"
          } 
          ${isChecked ? "opacity-60 scale-[0.98]" : "hover:scale-[1.02] hover:shadow-2xl hover:border-primary/20"}
          backdrop-blur-sm
        `}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        onClick={handleTaskClick}
      >
      <div className="flex items-center gap-4 flex-grow">
        <label ref={checkboxRef} className="relative flex size-8 items-center justify-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleToggle}
            className="h-7 w-7 appearance-none rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 checked:bg-gradient-to-br checked:from-primary checked:to-primary/80 checked:border-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 cursor-pointer transition-all shadow-sm checked:shadow-lg checked:shadow-primary/30"
          />
          {isChecked && (
            <span className="material-symbols-outlined text-white absolute text-lg pointer-events-none font-bold">
              check
            </span>
          )}
        </label>
        <div className="flex flex-col justify-center relative flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-base font-semibold text-gray-900 dark:text-gray-100 transition-all ${
                isChecked ? "line-through opacity-50" : ""
              }`}
            >
              {displayTitle}
            </span>
            {task?.stepUpSuggestion && <StepUpIndicator task={task} />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {category}
            </span>
            {task?.priority && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {count && onIncrement && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              haptic('medium');
              onIncrement(id);
            }}
            className="text-primary h-11 w-11 rounded-2xl hover:bg-primary/15 active:scale-95 transition-all shadow-sm hover:shadow-md border border-primary/20 hover:border-primary/40"
          >
            <span className="material-symbols-outlined text-2xl font-bold">arrow_upward</span>
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className={`text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 h-11 w-11 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm hover:shadow-md border border-transparent hover:border-red-200 dark:hover:border-red-800 ${
              showDelete ? 'opacity-100' : 'opacity-50 md:opacity-0'
            }`}
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </Button>
        )}
      </div>
    </div>

    <TaskEditDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      task={task}
    />
  </>
  );
};
