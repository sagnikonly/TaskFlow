import { TaskItem } from "./TaskItem";

interface Task {
  id: string;
  title: string;
  category: string;
  completed?: boolean;
  count?: { current: number; total: number };
  highlighted?: boolean;
}

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onIncrement?: (id: string) => void;
  onDelete?: (id: string) => void;
  fullTasks?: Task[];
}

export const TaskSection = ({ title, tasks, onToggle, onIncrement, onDelete, fullTasks }: TaskSectionProps) => {
  return (
    <div className="px-4">
      <h3 className="text-primary text-base font-bold leading-tight tracking-[-0.015em] px-2 pb-2 pt-4">
        {title}
      </h3>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => {
          const fullTask = fullTasks?.find(t => t.id === task.id) || task;
          return (
            <TaskItem
              key={task.id}
              {...task}
              onToggle={onToggle}
              onIncrement={onIncrement}
              onDelete={onDelete}
              task={fullTask}
            />
          );
        })}
      </div>
    </div>
  );
};
