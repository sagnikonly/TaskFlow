interface EmptyStateProps {
  onAddTask: () => void;
}

export const EmptyState = ({ onAddTask }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 animate-fade-in">
      {/* Simple Icon */}
      <div className="mb-6">
        <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-8">
          <span className="material-symbols-outlined text-primary text-7xl">
            checklist
          </span>
        </div>
      </div>

      {/* Simple Text */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        No tasks yet
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center">
        Tap the + button to create your first task
      </p>

      {/* Simple Hint */}
      <button
        onClick={onAddTask}
        className="flex items-center gap-2 text-primary font-medium"
      >
        <span className="material-symbols-outlined">add_circle</span>
        <span>Add Task</span>
      </button>
    </div>
  );
};
