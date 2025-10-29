import { useEffect } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';

export const useStepUpAnalysis = () => {
  const { tasks, updateTask } = useTasks();
  const { profile } = useAuth();

  useEffect(() => {
    const analyzeTasksForStepUp = async () => {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) return;

      // Only analyze tasks with count/goal that don't already have suggestions
      // Let AI decide if there's enough data - no minimum day requirement
      const eligibleTasks = tasks.filter(
        (task) =>
          task.count &&
          !task.stepUpSuggestion &&
          !task.completed &&
          task.completionHistory &&
          task.completionHistory.length > 0 // At least some history
      );

      for (const task of eligibleTasks) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-step-up`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                task: {
                  id: task.id,
                  title: task.title,
                  category: task.category,
                  count: task.count,
                  completionHistory: task.completionHistory,
                  stepUpHistory: task.stepUpHistory || [],
                  notes: task.notes,
                  stepUpDate: task.stepUpDate,
                  createdAt: task.createdAt,
                  isStepUp: task.isStepUp,
                },
                userProfile: {
                  target_exam: profile?.target_exam,
                  goal: profile?.goal,
                  full_name: profile?.full_name,
                },
              }),
            }
          );

          const result = await response.json();

          if (result.shouldStepUp && result.suggestion) {
            // Update task with step-up suggestion
            updateTask(task.id, {
              stepUpSuggestion: result.suggestion,
            });
          }
        } catch (error) {
          console.error('Error analyzing task for step-up:', error);
        }
      }
    };

    // Run analysis on mount
    analyzeTasksForStepUp();

    // Run analysis every 6 hours (optimal for free tier)
    const interval = setInterval(analyzeTasksForStepUp, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, profile, updateTask]);
};
