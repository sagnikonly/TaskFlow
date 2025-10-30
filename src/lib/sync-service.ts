import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/contexts/TaskContext";

export interface CloudTask {
    id: string;
    user_id: string;
    title: string;
    category: string;
    completed: boolean;
    count_current: number | null;
    count_total: number | null;
    highlighted: boolean;
    created_at: string;
    completed_at: string | null;
    priority: "low" | "medium" | "high" | null;
    recurrence: "none" | "daily" | "weekly" | "monthly" | "custom";
    custom_dates: string[] | null;
    next_occurrence: string | null;
    is_step_up: boolean;
    step_up_date: string | null;
    completion_history: { date: string; completed: boolean }[];
    step_up_history: { oldGoal: number; newGoal: number; date: string }[];
    notes: string | null;
    step_up_suggestion: any | null;
    updated_at: string;
}

export interface CloudCategory {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    created_at: string;
    updated_at: string;
}

export interface CloudUserSettings {
    id: string;
    user_id: string;
    gemini_api_key: string | null;
    theme: string;
    notifications_enabled: boolean;
    haptics_enabled: boolean;
    haptics_intensity: string;
    confetti_enabled: boolean;
    created_at: string;
    updated_at: string;
}

class SyncService {
    private syncInProgress = false;
    private lastSyncTime: Date | null = null;

    // Convert local Task to CloudTask format
    private taskToCloud(task: Task, userId: string): Omit<CloudTask, "id" | "user_id" | "created_at" | "updated_at"> {
        return {
            title: task.title,
            category: task.category,
            completed: task.completed,
            count_current: task.count?.current ?? null,
            count_total: task.count?.total ?? null,
            highlighted: task.highlighted ?? false,
            completed_at: task.completedAt?.toISOString() ?? null,
            priority: task.priority ?? null,
            recurrence: task.recurrence ?? "none",
            custom_dates: task.customDates ?? null,
            next_occurrence: task.nextOccurrence ?? null,
            is_step_up: task.isStepUp ?? false,
            step_up_date: task.stepUpDate ?? null,
            completion_history: task.completionHistory ?? [],
            step_up_history: task.stepUpHistory ?? [],
            notes: task.notes ?? null,
            step_up_suggestion: task.stepUpSuggestion ?? null,
        };
    }

    // Convert CloudTask to local Task format
    public cloudToTask(cloudTask: CloudTask): Task {
        return {
            id: cloudTask.id,
            title: cloudTask.title,
            category: cloudTask.category,
            completed: cloudTask.completed,
            count: cloudTask.count_current !== null && cloudTask.count_total !== null
                ? { current: cloudTask.count_current, total: cloudTask.count_total }
                : undefined,
            highlighted: cloudTask.highlighted,
            createdAt: new Date(cloudTask.created_at),
            completedAt: cloudTask.completed_at ? new Date(cloudTask.completed_at) : undefined,
            priority: cloudTask.priority ?? undefined,
            recurrence: cloudTask.recurrence,
            customDates: cloudTask.custom_dates ?? undefined,
            nextOccurrence: cloudTask.next_occurrence ?? undefined,
            isStepUp: cloudTask.is_step_up,
            stepUpDate: cloudTask.step_up_date ?? undefined,
            completionHistory: cloudTask.completion_history,
            stepUpHistory: cloudTask.step_up_history,
            notes: cloudTask.notes ?? undefined,
            stepUpSuggestion: cloudTask.step_up_suggestion ?? undefined,
        };
    }

    // Sync tasks from cloud to local
    async syncTasksFromCloud(userId: string): Promise<Task[]> {
        try {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return (data as CloudTask[]).map(this.cloudToTask);
        } catch (error) {
            console.error("Error syncing tasks from cloud:", error);
            throw error;
        }
    }

    // Sync tasks to cloud
    async syncTasksToCloud(tasks: Task[], userId: string): Promise<void> {
        if (this.syncInProgress) return;

        try {
            this.syncInProgress = true;

            // Get existing cloud tasks
            const { data: existingTasks } = await supabase
                .from("tasks")
                .select("id, updated_at")
                .eq("user_id", userId);

            const existingIds = new Set((existingTasks || []).map(t => t.id));

            // Separate tasks into insert and update
            const tasksToInsert = tasks.filter(t => !existingIds.has(t.id));
            const tasksToUpdate = tasks.filter(t => existingIds.has(t.id));

            // Insert new tasks
            if (tasksToInsert.length > 0) {
                const insertData = tasksToInsert.map(task => ({
                    id: task.id,
                    user_id: userId,
                    created_at: task.createdAt.toISOString(),
                    ...this.taskToCloud(task, userId),
                }));

                const { error: insertError } = await supabase
                    .from("tasks")
                    .insert(insertData);

                if (insertError) throw insertError;
            }

            // Update existing tasks
            for (const task of tasksToUpdate) {
                const { error: updateError } = await supabase
                    .from("tasks")
                    .update(this.taskToCloud(task, userId))
                    .eq("id", task.id)
                    .eq("user_id", userId);

                if (updateError) throw updateError;
            }

            this.lastSyncTime = new Date();
        } catch (error) {
            console.error("Error syncing tasks to cloud:", error);
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }

    // Add a single task to cloud
    async addTaskToCloud(task: Task, userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from("tasks")
                .insert({
                    id: task.id,
                    user_id: userId,
                    created_at: task.createdAt.toISOString(),
                    ...this.taskToCloud(task, userId),
                });

            if (error) throw error;
        } catch (error) {
            console.error("Error adding task to cloud:", error);
            throw error;
        }
    }

    // Update a single task in cloud
    async updateTaskInCloud(taskId: string, updates: Partial<Task>, userId: string): Promise<void> {
        try {
            const cloudUpdates: any = {};

            if (updates.title !== undefined) cloudUpdates.title = updates.title;
            if (updates.category !== undefined) cloudUpdates.category = updates.category;
            if (updates.completed !== undefined) cloudUpdates.completed = updates.completed;
            if (updates.count !== undefined) {
                cloudUpdates.count_current = updates.count.current;
                cloudUpdates.count_total = updates.count.total;
            }
            if (updates.highlighted !== undefined) cloudUpdates.highlighted = updates.highlighted;
            if (updates.completedAt !== undefined) cloudUpdates.completed_at = updates.completedAt?.toISOString() ?? null;
            if (updates.priority !== undefined) cloudUpdates.priority = updates.priority;
            if (updates.recurrence !== undefined) cloudUpdates.recurrence = updates.recurrence;
            if (updates.customDates !== undefined) cloudUpdates.custom_dates = updates.customDates;
            if (updates.nextOccurrence !== undefined) cloudUpdates.next_occurrence = updates.nextOccurrence;
            if (updates.isStepUp !== undefined) cloudUpdates.is_step_up = updates.isStepUp;
            if (updates.stepUpDate !== undefined) cloudUpdates.step_up_date = updates.stepUpDate;
            if (updates.completionHistory !== undefined) cloudUpdates.completion_history = updates.completionHistory;
            if (updates.stepUpHistory !== undefined) cloudUpdates.step_up_history = updates.stepUpHistory;
            if (updates.notes !== undefined) cloudUpdates.notes = updates.notes;
            if (updates.stepUpSuggestion !== undefined) cloudUpdates.step_up_suggestion = updates.stepUpSuggestion;

            const { error } = await supabase
                .from("tasks")
                .update(cloudUpdates)
                .eq("id", taskId)
                .eq("user_id", userId);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating task in cloud:", error);
            throw error;
        }
    }

    // Delete a task from cloud
    async deleteTaskFromCloud(taskId: string, userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", taskId)
                .eq("user_id", userId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting task from cloud:", error);
            throw error;
        }
    }

    // Sync categories from cloud
    async syncCategoriesFromCloud(userId: string, retries = 3): Promise<{ categories: string[]; icons: Record<string, string> }> {
        try {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: true });

            if (error) throw error;

            // If no categories found and we have retries left, wait and retry
            // (This handles the case where trigger hasn't completed yet)
            if ((!data || data.length === 0) && retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.syncCategoriesFromCloud(userId, retries - 1);
            }

            const categories = (data as CloudCategory[]).map(c => c.name);
            const icons = (data as CloudCategory[]).reduce((acc, c) => {
                acc[c.name] = c.icon;
                return acc;
            }, {} as Record<string, string>);

            return { categories, icons };
        } catch (error) {
            console.error("Error syncing categories from cloud:", error);
            throw error;
        }
    }

    // Add category to cloud
    async addCategoryToCloud(category: string, icon: string, userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from("categories")
                .insert({
                    user_id: userId,
                    name: category,
                    icon: icon,
                });

            if (error) throw error;
        } catch (error) {
            console.error("Error adding category to cloud:", error);
            throw error;
        }
    }

    // Update category icon in cloud
    async updateCategoryIconInCloud(category: string, icon: string, userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from("categories")
                .update({ icon })
                .eq("user_id", userId)
                .eq("name", category);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating category icon in cloud:", error);
            throw error;
        }
    }

    // Delete category from cloud
    async deleteCategoryFromCloud(category: string, userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from("categories")
                .delete()
                .eq("user_id", userId)
                .eq("name", category);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting category from cloud:", error);
            throw error;
        }
    }

    // User Settings Methods
    async getUserSettings(userId: string): Promise<CloudUserSettings | null> {
        try {
            const { data, error } = await supabase
                .from("user_settings")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
            return data as CloudUserSettings | null;
        } catch (error: any) {
            console.error("Error getting user settings:", error);
            
            // Check if it's a table not found error
            const errorMessage = error?.message || String(error);
            if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
                console.warn("⚠️ user_settings table not found. Please run: supabase db push");
                return null; // Return null instead of throwing
            }
            
            throw error;
        }
    }

    async saveUserSettings(userId: string, settings: Partial<CloudUserSettings>): Promise<void> {
        try {
            const { error } = await supabase
                .from("user_settings")
                .upsert({
                    user_id: userId,
                    ...settings,
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;
        } catch (error) {
            console.error("Error saving user settings:", error);
            throw error;
        }
    }

    async updateGeminiApiKey(userId: string, apiKey: string): Promise<void> {
        try {
            // First, try to get existing settings
            const { data: existingSettings } = await supabase
                .from("user_settings")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (existingSettings) {
                // Update existing record
                const { error } = await supabase
                    .from("user_settings")
                    .update({ gemini_api_key: apiKey })
                    .eq("user_id", userId);

                if (error) throw error;
            } else {
                // Insert new record
                const { error } = await supabase
                    .from("user_settings")
                    .insert({
                        user_id: userId,
                        gemini_api_key: apiKey,
                    });

                if (error) throw error;
            }

            console.log("✅ Gemini API key synced to cloud");
        } catch (error: any) {
            console.error("❌ Error syncing Gemini API key:", error);
            
            // Check if it's a table not found error
            const errorMessage = error?.message || String(error);
            if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
                throw new Error("Database not set up. Please run: supabase db push");
            } else if (errorMessage.includes('JWT') || errorMessage.includes('auth')) {
                throw new Error("Authentication issue. Please sign in again.");
            } else {
                throw new Error(`Failed to sync API key: ${errorMessage}`);
            }
        }
    }

    // Subscribe to real-time changes
    subscribeToTasks(userId: string, callback: (payload: any) => void) {
        return supabase
            .channel(`tasks:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks",
                    filter: `user_id=eq.${userId}`,
                },
                callback
            )
            .subscribe();
    }

    subscribeToCategories(userId: string, callback: (payload: any) => void) {
        return supabase
            .channel(`categories:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "categories",
                    filter: `user_id=eq.${userId}`,
                },
                callback
            )
            .subscribe();
    }

    // Test database connection and table existence
    async testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
        try {
            // Test basic connection
            const { data, error } = await supabase
                .from("profiles")
                .select("id")
                .limit(1);

            if (error) {
                return { success: false, message: `Database connection failed: ${error.message}` };
            }

            // Test user_settings table
            const { error: settingsError } = await supabase
                .from("user_settings")
                .select("id")
                .limit(1);

            if (settingsError) {
                if (settingsError.message.includes('relation') && settingsError.message.includes('does not exist')) {
                    return { success: false, message: "user_settings table not found. Click 'Fix DB' to create it." };
                }
                return { success: false, message: `user_settings table error: ${settingsError.message}` };
            }

            return { success: true, message: "Database connection and tables OK" };
        } catch (error: any) {
            return { success: false, message: `Connection test failed: ${error.message}` };
        }
    }

    // Create user_settings table directly (simplified approach)
    async createUserSettingsTable(): Promise<void> {
        throw new Error("Please create the table manually. Go to Supabase Dashboard > SQL Editor and run the SQL from create_user_settings_table.sql file");
    }

    // Migrate localStorage data to cloud
    async migrateLocalDataToCloud(userId: string): Promise<void> {
        try {
            // Check if migration already done
            const migrationKey = `migration_done_${userId}`;
            if (localStorage.getItem(migrationKey)) {
                return;
            }

            // Get local data
            const localTasks = localStorage.getItem("tasks");
            const localCategories = localStorage.getItem("categories");
            const localCategoryIcons = localStorage.getItem("categoryIcons");

            // Migrate tasks
            if (localTasks) {
                const tasks: Task[] = JSON.parse(localTasks).map((t: any) => ({
                    ...t,
                    createdAt: new Date(t.createdAt),
                    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
                }));

                await this.syncTasksToCloud(tasks, userId);
            }

            // Migrate categories
            if (localCategories && localCategoryIcons) {
                const categories: string[] = JSON.parse(localCategories);
                const icons: Record<string, string> = JSON.parse(localCategoryIcons);

                for (const category of categories) {
                    try {
                        await this.addCategoryToCloud(category, icons[category] || "label", userId);
                    } catch (error) {
                        // Ignore duplicate errors
                        console.log(`Category ${category} already exists`);
                    }
                }
            }

            // Mark migration as done
            localStorage.setItem(migrationKey, "true");
            console.log("✅ Local data migrated to cloud successfully");
        } catch (error) {
            console.error("Error migrating local data:", error);
            throw error;
        }
    }
}

export const syncService = new SyncService();
