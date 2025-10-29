import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPicker } from "@/components/IconPicker";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const categoryIcons: Record<string, string> = {
  Work: "work",
  Health: "favorite",
  "Personal Growth": "auto_stories",
  Shopping: "shopping_cart",
  Fitness: "fitness_center",
  Study: "school",
  Family: "family_restroom",
  Finance: "payments",
};

const categoryColors = [
  "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  "from-green-500/20 to-emerald-500/20 border-green-500/30",
  "from-orange-500/20 to-red-500/20 border-orange-500/30",
  "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
];

const Subjects = () => {
  const { categories, addCategory, removeCategory, updateCategoryIcon, categoryIcons, tasks } = useTasks();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newIcon, setNewIcon] = useState("label");

  const getCategoryStats = (category: string) => {
    const categoryTasks = tasks.filter((t) => t.category === category);
    const completed = categoryTasks.filter((t) => t.completed).length;
    return {
      total: categoryTasks.length,
      completed,
      pending: categoryTasks.length - completed,
    };
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error("Category already exists");
      return;
    }

    addCategory(newCategory.trim(), newIcon);
    toast.success("Category added successfully!");
    setNewCategory("");
    setNewIcon("label");
    setAddDialogOpen(false);
  };

  const handleRemoveCategory = (category: string) => {
    const stats = getCategoryStats(category);
    if (stats.total > 0) {
      const confirmed = window.confirm(
        `This category has ${stats.total} task(s). Deleting it will also delete all associated tasks. Continue?`
      );
      if (!confirmed) return;
    }
    removeCategory(category);
    toast.success("Category removed");
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-lg mx-auto flex-col overflow-x-hidden pb-24 p-4 animate-fade-in">
      <header className="mb-6 animate-slide-in-right" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">category</span>
            <h1 className="text-foreground text-3xl font-extrabold">Subjects</h1>
          </div>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="rounded-full w-12 h-12 p-0"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </Button>
        </div>
        <p className="text-muted-foreground">Manage your task categories</p>
      </header>

      <div className="space-y-3">
        {categories.map((category, index) => {
          const stats = getCategoryStats(category);
          const colorClass = categoryColors[index % categoryColors.length];
          const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

          return (
            <Card
              key={category}
              className={`bg-gradient-to-br ${colorClass} p-5 rounded-3xl animate-slide-in-right hover:scale-[1.02] transition-all duration-300`}
              style={{ animationDelay: `${0.1 * (index + 2)}s`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setIconPickerOpen(true);
                    }}
                    className="bg-primary/10 p-3 rounded-2xl hover:bg-primary/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-primary text-3xl">
                      {categoryIcons[category] || "label"}
                    </span>
                  </button>
                  
                  <div className="flex-1">
                    <h3 className="text-foreground text-lg font-bold mb-1">{category}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{stats.total} tasks</span>
                      <span>•</span>
                      <span>{completionRate}% complete</span>
                    </div>
                    
                    {/* Progress Bar */}
                    {stats.total > 0 && (
                      <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCategory(category)}
                  className="text-muted-foreground hover:text-destructive rounded-full"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-surface dark:bg-surface border-border max-w-md mx-4 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-2xl font-bold">Add Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">Category Name</Label>
              <Input
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="bg-background dark:bg-background border-border rounded-2xl"
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Icon</Label>
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-primary text-3xl">
                  {newIcon}
                </span>
                <span className="text-muted-foreground">Tap to choose icon</span>
              </button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                className="flex-1 rounded-2xl"
              >
                Cancel
              </Button>
              <Button onClick={handleAddCategory} className="flex-1 rounded-2xl">
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <IconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        onSelectIcon={(icon) => {
          if (addDialogOpen) {
            setNewIcon(icon);
          } else if (selectedCategory) {
            updateCategoryIcon(selectedCategory, icon);
            toast.success("Icon updated!");
          }
        }}
        currentIcon={addDialogOpen ? newIcon : categoryIcons[selectedCategory]}
      />
    </div>
  );
};

export default Subjects;
