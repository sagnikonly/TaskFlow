import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { syncService } from "@/lib/sync-service";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  count?: { current: number; total: number };
  highlighted?: boolean;
  createdAt: Date;
  completedAt?: Date;
  priority?: "low" | "medium" | "high";
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "custom";
  customDates?: string[];
  nextOccurrence?: string;
  isStepUp?: boolean;
  stepUpDate?: string;
  completionHistory?: { date: string; completed: boolean }[];
  stepUpHistory?: { oldGoal: number; newGoal: number; date: string }[];
  notes?: string;
  stepUpSuggestion?: {
    currentGoal: number;
    newGoal: number;
    reason: string;
    motivationalMessage: string;
    confidence?: number;
  };
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  incrementTask: (id: string) => void;
  importTasks: (importedTasks: Task[], mergeMode: "replace" | "merge") => Promise<void>;
  categories: string[];
  categoryIcons: { [key: string]: string };
  addCategory: (category: string, icon?: string) => void;
  removeCategory: (category: string) => void;
  updateCategoryIcon: (category: string, icon: string) => void;
  getTaskStats: () => {
    total: number;
    completed: number;
    pending: number;
    todayCompleted: number;
    weekCompleted: number;
    categoryStats: { category: string; total: number; completed: number }[];
    stepUpStats: { totalStepUps: number; activeStepUps: number; completedStepUps: number };
    heatMapData: { date: string; count: number }[];
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryIcons, setCategoryIcons] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial sync when user logs in
  useEffect(() => {
    const initializeData = async () => {
      if (!user) {
        // Load from localStorage if not logged in
        console.log("👤 No user logged in, loading from localStorage");
        const saved = localStorage.getItem("tasks");
        if (saved) {
          const parsed = JSON.parse(saved);
          const loadedTasks = parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          }));
          setTasks(loadedTasks);
          console.log(`📦 Loaded ${loadedTasks.length} tasks from localStorage`);
        } else {
          console.log("📦 No tasks found in localStorage");
        }
        
        const savedCategories = localStorage.getItem("categories");
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        }
        
        const savedIcons = localStorage.getItem("categoryIcons");
        if (savedIcons) {
          setCategoryIcons(JSON.parse(savedIcons));
        }
        
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // First, load from localStorage immediately for faster UI
        console.log("👤 User logged in, loading from localStorage first...");
        const saved = localStorage.getItem("tasks");
        if (saved) {
          const parsed = JSON.parse(saved);
          const loadedTasks = parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          }));
          setTasks(loadedTasks);
          console.log(`📦 Loaded ${loadedTasks.length} tasks from localStorage`);
        } else {
          console.log("📦 No tasks in localStorage");
        }
        
        const savedCategories = localStorage.getItem("categories");
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        }
        
        const savedIcons = localStorage.getItem("categoryIcons");
        if (savedIcons) {
          setCategoryIcons(JSON.parse(savedIcons));
        }
        
        // Then sync with cloud in the background
        try {
          // Migrate local data to cloud if needed
          await syncService.migrateLocalDataToCloud(user.id);
          
          // Sync from cloud
          const [cloudTasks, cloudCategories] = await Promise.all([
            syncService.syncTasksFromCloud(user.id),
            syncService.syncCategoriesFromCloud(user.id),
          ]);

          setTasks(cloudTasks);
          setCategories(cloudCategories.categories);
          setCategoryIcons(cloudCategories.icons);
          
          console.log(`✅ Data synced from cloud successfully (${cloudTasks.length} tasks)`);
        } catch (cloudError: any) {
          console.error("⚠️ Cloud sync failed, using local data:", cloudError);
          
          // Check if it's a table not found error
          const errorMessage = cloudError?.message || String(cloudError);
          if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
            console.warn("⚠️ Database tables not created yet");
            toast.error("Database not set up", {
              description: "Using local storage. Contact support if this persists.",
              duration: 5000,
            });
          } else if (errorMessage.includes('JWT') || errorMessage.includes('auth')) {
            toast.error("Authentication issue", {
              description: "Using local storage. Try signing in again.",
              duration: 3000,
            });
          } else {
            toast.error("Cloud sync failed", {
              description: "Using local storage instead",
              duration: 3000,
            });
          }
          
          // Keep the localStorage data we already loaded
          // If no localStorage data, set defaults
          if (!saved) {
            setCategories(["Work", "Health", "Personal Growth", "Shopping", "Fitness"]);
            setCategoryIcons({
              "Work": "work",
              "Health": "favorite",
              "Personal Growth": "auto_stories",
              "Shopping": "shopping_cart",
              "Fitness": "fitness_center",
            });
          }
        }
      } catch (error: any) {
        console.error("❌ Error initializing data:", error);
        
        // Fall back to localStorage
        const saved = localStorage.getItem("tasks");
        if (saved) {
          const parsed = JSON.parse(saved);
          setTasks(parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          })));
        }
        
        const savedCategories = localStorage.getItem("categories");
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          setCategories(["Work", "Health", "Personal Growth", "Shopping", "Fitness"]);
        }
        
        const savedIcons = localStorage.getItem("categoryIcons");
        if (savedIcons) {
          setCategoryIcons(JSON.parse(savedIcons));
        } else {
          setCategoryIcons({
            "Work": "work",
            "Health": "favorite",
            "Personal Growth": "auto_stories",
            "Shopping": "shopping_cart",
            "Fitness": "fitness_center",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [user]);

  // Real-time sync subscriptions
  useEffect(() => {
    if (!user) return;

    const tasksSubscription = syncService.subscribeToTasks(user.id, (payload) => {
      console.log("Real-time task update:", payload);
      
      if (payload.eventType === "INSERT") {
        const newTask = syncService.cloudToTask(payload.new);
        setTasks(prev => {
          // Avoid duplicates
          if (prev.some(t => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });
      } else if (payload.eventType === "UPDATE") {
        const updatedTask = syncService.cloudToTask(payload.new);
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      } else if (payload.eventType === "DELETE") {
        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
      }
    });

    const categoriesSubscription = syncService.subscribeToCategories(user.id, async (payload) => {
      console.log("Real-time category update:", payload);
      
      // Refresh categories from cloud
      try {
        const cloudCategories = await syncService.syncCategoriesFromCloud(user.id);
        setCategories(cloudCategories.categories);
        setCategoryIcons(cloudCategories.icons);
      } catch (error) {
        console.error("Error refreshing categories:", error);
      }
    });

    return () => {
      tasksSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  }, [user]);

  // Backup to localStorage (offline support)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      console.log(`💾 Saved ${tasks.length} tasks to localStorage`);
    }
  }, [tasks, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("categories", JSON.stringify(categories));
    }
  }, [categories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("categoryIcons", JSON.stringify(categoryIcons));
    }
  }, [categoryIcons, isLoading]);

  useEffect(() => {
    const checkRecurringTasks = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (!task.recurrence || task.recurrence === "none" || !task.completed) return task;
          
          const completedDate = task.completedAt ? new Date(task.completedAt) : null;
          if (!completedDate) return task;
          completedDate.setHours(0, 0, 0, 0);
          
          if (completedDate.getTime() === today.getTime()) return task;
          
          const shouldReset = checkIfShouldRecur(task, today, completedDate);
          if (shouldReset) {
            return { ...task, completed: false, completedAt: undefined };
          }
          return task;
        })
      );
    };

    checkRecurringTasks();
    const interval = setInterval(checkRecurringTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkIfShouldRecur = (task: Task, today: Date, completedDate: Date): boolean => {
    const daysDiff = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (task.recurrence) {
      case "daily":
        return daysDiff >= 1;
      case "weekly":
        return daysDiff >= 7;
      case "monthly":
        return completedDate.getMonth() !== today.getMonth();
      case "custom":
        const todayStr = today.toISOString().split("T")[0];
        return task.customDates?.includes(todayStr) || false;
      default:
        return false;
    }
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    // Generate a unique ID for the task (UUID format for cloud compatibility)
    const taskId = crypto.randomUUID();
    
    const newTask: Task = {
      ...task,
      id: taskId,
      createdAt: new Date(),
      completionHistory: task.completionHistory || [],
      recurrence: task.recurrence || "none",
    };
    
    setTasks((prev) => [newTask, ...prev]);
    
    // Sync to cloud if user is logged in
    if (user) {
      try {
        await syncService.addTaskToCloud(newTask, user.id);
        console.log("✅ Task synced to cloud successfully");
      } catch (error) {
        console.error("❌ Error syncing new task to cloud:", error);
        toast.error("Failed to sync task to cloud", {
          description: "Task saved locally only",
        });
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
    
    // Sync to cloud if user is logged in
    if (user) {
      try {
        await syncService.updateTaskInCloud(id, updates, user.id);
      } catch (error) {
        console.error("Error syncing task update to cloud:", error);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    
    // Sync to cloud if user is logged in
    if (user) {
      try {
        await syncService.deleteTaskFromCloud(id, user.id);
      } catch (error) {
        console.error("Error syncing task deletion to cloud:", error);
      }
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    const today = new Date().toISOString().split("T")[0];
    const newHistory = [
      ...(task.completionHistory || []),
      { date: today, completed: newCompleted }
    ];
    
    const updates = {
      completed: newCompleted,
      completedAt: newCompleted ? new Date() : undefined,
      completionHistory: newHistory,
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    
    // Sync to cloud if user is logged in
    if (user) {
      try {
        await syncService.updateTaskInCloud(id, updates, user.id);
      } catch (error) {
        console.error("Error syncing task toggle to cloud:", error);
      }
    }
  };

  const incrementTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !task.count) return;

    const newCurrent = Math.min(task.count.current + 1, task.count.total);
    const isComplete = newCurrent === task.count.total;
    const today = new Date().toISOString().split("T")[0];
    const newHistory = isComplete ? [
      ...(task.completionHistory || []),
      { date: today, completed: true }
    ] : task.completionHistory;
    
    const updates = {
      count: { ...task.count, current: newCurrent },
      completed: isComplete,
      completedAt: isComplete ? new Date() : task.completedAt,
      completionHistory: newHistory,
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    
    // Sync to cloud if user is logged in
    if (user) {
      try {
        await syncService.updateTaskInCloud(id, updates, user.id);
      } catch (error) {
        console.error("Error syncing task increment to cloud:", error);
      }
    }
  };

  const importTasks = async (importedTasks: Task[], mergeMode: "replace" | "merge") => {
    try {
      // Validate and normalize imported tasks
      const normalizedTasks = importedTasks.map(task => ({
        ...task,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        completionHistory: task.completionHistory || [],
        stepUpHistory: task.stepUpHistory || [],
        recurrence: task.recurrence || "none",
      }));

      // Extract unique categories from imported tasks
      const importedCategories = [...new Set(normalizedTasks.map(t => t.category))];
      
      if (mergeMode === "replace") {
        // Replace all tasks
        setTasks(normalizedTasks);
        
        // Update categories
        const newCategories = [...new Set([...categories, ...importedCategories])];
        setCategories(newCategories);
        
        // Sync to cloud if user is logged in
        if (user) {
          // Delete all existing tasks
          for (const task of tasks) {
            await syncService.deleteTaskFromCloud(task.id, user.id);
          }
          // Add all imported tasks
          for (const task of normalizedTasks) {
            await syncService.addTaskToCloud(task, user.id);
          }
        }
      } else {
        // Merge mode: add tasks that don't exist, update existing ones
        const existingIds = new Set(tasks.map(t => t.id));
        const tasksToAdd = normalizedTasks.filter(t => !existingIds.has(t.id));
        const tasksToUpdate = normalizedTasks.filter(t => existingIds.has(t.id));
        
        setTasks(prev => {
          const updated = prev.map(task => {
            const importedTask = tasksToUpdate.find(t => t.id === task.id);
            return importedTask || task;
          });
          return [...updated, ...tasksToAdd];
        });
        
        // Update categories
        const newCategories = [...new Set([...categories, ...importedCategories])];
        setCategories(newCategories);
        
        // Sync to cloud if user is logged in
        if (user) {
          for (const task of tasksToAdd) {
            await syncService.addTaskToCloud(task, user.id);
          }
          for (const task of tasksToUpdate) {
            await syncService.updateTaskInCloud(task.id, task, user.id);
          }
        }
      }
      
      toast.success(`Successfully imported ${normalizedTasks.length} tasks!`);
    } catch (error) {
      console.error("Error importing tasks:", error);
      toast.error("Failed to import tasks");
      throw error;
    }
  };

  const addCategory = async (category: string, icon: string = "label") => {
    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
      setCategoryIcons(prev => ({ ...prev, [category]: icon }));
      
      // Sync to cloud if user is logged in
      if (user) {
        try {
          await syncService.addCategoryToCloud(category, icon, user.id);
        } catch (error) {
          console.error("Error syncing category to cloud:", error);
        }
      }
    }
  };

  const removeCategory = async (category: string) => {
    setCategories((prev) => prev.filter((cat) => cat !== category));
    setCategoryIcons(prev => {
      const newIcons = { ...prev };
      delete newIcons[category];
      return newIcons;
    });
    setTasks(prev => prev.filter(task => task.category !== category));
    
    // Sync to cloud if user is logged in
    if (user) {
      try {
        await syncService.deleteCategoryFromCloud(category, user.id);
      } catch (error) {
        console.error("Error syncing category deletion to cloud:", error);
      }
    }
  };

  const updateCategoryIcon = async (category: string, icon: string) => {
    setCategoryIcons(prev => ({ ...prev, [category]: icon }));
    
    // Sync to cloud if user is logged in
    if (user) {
      try {
        await syncService.updateCategoryIconInCloud(category, icon, user.id);
      } catch (error) {
        console.error("Error syncing category icon to cloud:", error);
      }
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCompleted = tasks.filter(
      (t) => t.completedAt && new Date(t.completedAt) >= today
    ).length;

    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const weekCompleted = tasks.filter(
      (t) => t.completedAt && new Date(t.completedAt) >= weekAgo
    ).length;

    const categoryStats = categories.map((category) => {
      const categoryTasks = tasks.filter((t) => t.category === category);
      return {
        category,
        total: categoryTasks.length,
        completed: categoryTasks.filter((t) => t.completed).length,
      };
    });

    const stepUpStats = {
      totalStepUps: tasks.filter((t) => t.isStepUp).length,
      activeStepUps: tasks.filter((t) => t.isStepUp && !t.completed).length,
      completedStepUps: tasks.filter((t) => t.isStepUp && t.completed).length,
    };

    // Generate heat map data for last 60 days
    const heatMapData: { date: string; count: number }[] = [];
    for (let i = 59; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      let count = 0;
      tasks.forEach((task) => {
        if (task.completionHistory) {
          task.completionHistory.forEach((entry) => {
            if (entry.completed && entry.date === dateStr) {
              count++;
            }
          });
        }
      });
      
      heatMapData.push({ date: dateStr, count });
    }

    return {
      total,
      completed,
      pending,
      todayCompleted,
      weekCompleted,
      categoryStats,
      stepUpStats,
      heatMapData,
    };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        incrementTask,
        importTasks,
        categories,
        categoryIcons,
        addCategory,
        removeCategory,
        updateCategoryIcon,
        getTaskStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
};
