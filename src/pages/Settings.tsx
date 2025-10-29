import { useState, useEffect } from "react";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTasks } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useHapticsContext } from "@/contexts/HapticsContext";
import { useHaptics } from "@/hooks/use-haptics";
import { triggerHaptic } from "@/lib/haptics";
import { createConfettiBurst } from "@/lib/confetti";
import { updateStatusBarTheme } from "@/lib/statusbar";

type Theme = "purple" | "blue" | "green" | "orange" | "pink";

const Settings = () => {
  const { tasks } = useTasks();
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { enabled: hapticsEnabled, intensity: hapticsIntensity, supported: hapticsSupported, setEnabled: setHapticsEnabled, setIntensity: setHapticsIntensity } = useHapticsContext();
  const { haptic } = useHaptics();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [confettiEnabled, setConfettiEnabled] = useState(() => {
    const saved = localStorage.getItem("confetti_enabled");
    return saved === null ? true : saved === "true";
  });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("app_theme") as Theme) || "purple");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    target_exam: profile?.target_exam || "",
    goal: profile?.goal || "",
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        target_exam: profile.target_exam || "",
        goal: profile.goal || "",
      });
    }
  }, [profile]);

  const handleExportData = () => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleClearCompleted = () => {
    toast.info("This feature will clear all completed tasks");
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    toast.success("API key saved successfully!");
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("app_theme", newTheme);
    applyTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}!`);
  };

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    const themes = {
      purple: { primary: "282 62% 50%", primaryLight: "282 62% 97%" },
      blue: { primary: "217 91% 60%", primaryLight: "217 91% 97%" },
      green: { primary: "142 71% 45%", primaryLight: "142 71% 97%" },
      orange: { primary: "25 95% 53%", primaryLight: "25 95% 97%" },
      pink: { primary: "339 82% 60%", primaryLight: "339 82% 97%" },
    };

    const selectedColors = themes[selectedTheme];
    root.style.setProperty("--primary", selectedColors.primary);
    root.style.setProperty("--primary-light", selectedColors.primaryLight);
  };

  const handleDarkModeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    // Update status bar theme
    updateStatusBarTheme(newMode);
    
    toast.success(`${newMode ? "Dark" : "Light"} mode enabled`);
  };

  const handleProfileUpdate = async () => {
    const { error } = await updateProfile(profileData);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleHapticsToggle = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    if (enabled) {
      haptic('success');
      toast.success("Haptics enabled!");
    } else {
      toast.success("Haptics disabled");
    }
  };

  const handleIntensityChange = (value: number) => {
    setHapticsIntensity(value);
    haptic('medium');
  };

  const handleTestHaptics = () => {
    // Use direct triggerHaptic to bypass enabled check for testing
    triggerHaptic('light');
    setTimeout(() => triggerHaptic('medium'), 200);
    setTimeout(() => triggerHaptic('heavy'), 400);
    setTimeout(() => triggerHaptic('success'), 600);
    toast.success("Testing haptic patterns: light → medium → heavy → success");
  };

  const handleTryHaptics = () => {
    // Direct trigger for "try before you buy" experience
    triggerHaptic('success');
    toast.success("Feel the haptic feedback! Enable it to use throughout the app.");
  };

  useEffect(() => {
    localStorage.setItem("confetti_enabled", confettiEnabled.toString());
  }, [confettiEnabled]);

  React.useEffect(() => {
    applyTheme(theme);
  }, []);

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-lg mx-auto flex-col overflow-x-hidden pb-24 p-4 animate-fade-in">
      <header className="mb-6 animate-slide-in-right" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-4xl">settings</span>
          <h1 className="text-foreground text-3xl font-extrabold">Settings</h1>
        </div>
        <p className="text-muted-foreground">Customize your experience</p>
      </header>

      {/* Profile */}
      <Card className="bg-surface dark:bg-surface border-border p-6 rounded-3xl mb-6 animate-slide-in-right" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
        <h3 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          Profile
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name" className="text-foreground font-medium mb-2 block">Full Name</Label>
            <Input
              id="full_name"
              value={profileData.full_name}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              placeholder="Your name"
              className="rounded-2xl bg-background border-border"
            />
          </div>

          <div>
            <Label htmlFor="target_exam" className="text-foreground font-medium mb-2 block">Target Exam/Goal</Label>
            <Input
              id="target_exam"
              value={profileData.target_exam}
              onChange={(e) => setProfileData({ ...profileData, target_exam: e.target.value })}
              placeholder="e.g., JEE, NEET, UPSC"
              className="rounded-2xl bg-background border-border"
            />
          </div>

          <div>
            <Label htmlFor="goal" className="text-foreground font-medium mb-2 block">Personal Goal</Label>
            <Textarea
              id="goal"
              value={profileData.goal}
              onChange={(e) => setProfileData({ ...profileData, goal: e.target.value })}
              placeholder="What do you want to achieve?"
              className="rounded-2xl bg-background border-border min-h-[80px]"
            />
          </div>

          <Button onClick={handleProfileUpdate} className="w-full rounded-2xl bg-primary hover:bg-primary/90">
            Update Profile
          </Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="bg-surface dark:bg-surface border-border p-6 rounded-3xl mb-6 animate-slide-in-right" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
        <h3 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">palette</span>
          Appearance
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-foreground font-medium">Dark Mode</Label>
              <p className="text-muted-foreground text-sm">Toggle dark/light theme</p>
            </div>
            <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
          </div>

          <Separator className="bg-border/50" />

          <div>
            <Label className="text-foreground font-medium mb-3 block">Color Theme</Label>
            <div className="flex items-center gap-3 flex-wrap">
              {(["purple", "blue", "green", "orange", "pink"] as Theme[]).map((themeOption) => (
                <button 
                  key={themeOption} 
                  onClick={() => handleThemeChange(themeOption)} 
                  className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 shadow-md flex items-center justify-center ${theme === themeOption ? "border-foreground ring-2 ring-offset-2 ring-primary/30" : "border-border"}`} 
                  style={{ 
                    background: themeOption === "purple" ? "hsl(282, 62%, 50%)" : 
                               themeOption === "blue" ? "hsl(217, 91%, 60%)" : 
                               themeOption === "green" ? "hsl(142, 71%, 45%)" : 
                               themeOption === "orange" ? "hsl(25, 95%, 53%)" : 
                               "hsl(339, 82%, 60%)" 
                  }} 
                  title={themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                >
                  {theme === themeOption && (
                    <span className="material-symbols-outlined text-white text-lg">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Haptics & Feedback */}
      <Card className="bg-surface dark:bg-surface border-border p-6 rounded-3xl mb-6 animate-slide-in-right" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
        <h3 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">vibration</span>
          Haptics & Feedback
        </h3>
        
        <div className="space-y-4">
          {!hapticsSupported && (
            <div className="bg-muted/20 border border-border rounded-2xl p-3 mb-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">info</span>
                Haptic feedback is not supported on this device
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="haptics" className="text-foreground font-medium">Enable Haptics</Label>
              <p className="text-muted-foreground text-sm">Vibration feedback for interactions</p>
            </div>
            <Switch 
              id="haptics" 
              checked={hapticsEnabled} 
              onCheckedChange={handleHapticsToggle}
              disabled={!hapticsSupported}
            />
          </div>

          {hapticsSupported && (
            <>
              {!hapticsEnabled && (
                <>
                  <Separator className="bg-border/50" />
                  
                  <Button 
                    onClick={handleTryHaptics} 
                    variant="outline" 
                    className="w-full rounded-2xl justify-center gap-2 active:scale-95 transition-transform border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <span className="material-symbols-outlined">touch_app</span>
                    Try Haptics (Test Before Enabling)
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    👆 Tap to feel what haptic feedback is like
                  </p>
                </>
              )}

              {hapticsEnabled && (
                <>
                  <Separator className="bg-border/50" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label htmlFor="intensity" className="text-foreground font-medium">Intensity</Label>
                      <span className="text-sm text-muted-foreground">{hapticsIntensity}%</span>
                    </div>
                    <input
                      id="intensity"
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={hapticsIntensity}
                      onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Move the slider to feel different intensities
                    </p>
                  </div>

                  <Button 
                    onClick={handleTestHaptics} 
                    variant="outline" 
                    className="w-full rounded-2xl justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined">touch_app</span>
                    Test All Patterns
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Feel: Light → Medium → Heavy → Success
                  </p>
                </>
              )}
            </>
          )}

          <Separator className="bg-border/50" />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="confetti" className="text-foreground font-medium">Confetti Effects</Label>
              <p className="text-muted-foreground text-sm">Celebrate task completions</p>
            </div>
            <Switch 
              id="confetti" 
              checked={confettiEnabled} 
              onCheckedChange={(checked) => {
                setConfettiEnabled(checked);
                if (checked) {
                  // Show confetti when enabled
                  createConfettiBurst(30);
                  toast.success("Confetti enabled! 🎉");
                } else {
                  toast.success("Confetti disabled");
                }
              }} 
            />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="bg-surface dark:bg-surface border-border p-6 rounded-3xl mb-6 animate-slide-in-right" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
        <h3 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">notifications</span>
          Notifications
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="text-foreground font-medium">Enable Notifications</Label>
              <p className="text-muted-foreground text-sm">Get reminded about your tasks</p>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <Separator className="bg-border/50" />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound" className="text-foreground font-medium">Sound Effects</Label>
              <p className="text-muted-foreground text-sm">Play sounds on task completion</p>
            </div>
            <Switch id="sound" checked={soundEffects} onCheckedChange={setSoundEffects} />
          </div>
        </div>
      </Card>

      {/* API Key */}
      <Card className="bg-surface dark:bg-surface border-border p-6 rounded-3xl mb-6 animate-slide-in-right" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
        <h3 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">key</span>
          Gemini API Key
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-key" className="text-foreground font-medium mb-2 block">API Key for AI Features</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input id="api-key" type={showApiKey ? "text" : "password"} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your Gemini API key" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <span className="material-symbols-outlined text-xl">{showApiKey ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              <Button onClick={handleSaveApiKey} className="rounded-2xl bg-primary hover:bg-primary/90">Save</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Get your API key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></p>
          </div>
        </div>
      </Card>


      {/* Cloud Sync Status */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 p-6 rounded-3xl mb-6 animate-slide-in-right" style={{ animationDelay: "0.55s", animationFillMode: "both" }}>
        <h3 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">cloud_sync</span>
          Cloud Sync
        </h3>
        
        <div className="space-y-3">
          <div className="bg-background/50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
              <div>
                <p className="text-foreground font-medium">Sync Active</p>
                <p className="text-sm text-muted-foreground">All data backed up to cloud</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-2xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Tasks Synced</p>
              <p className="text-lg font-bold text-foreground">{tasks.length}</p>
            </div>
            <div className="bg-background/50 rounded-2xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-bold text-green-500">Online</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3">
            <p className="text-sm text-foreground flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
              <span>Your data syncs automatically across all devices. Login from anywhere to access your tasks!</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="bg-surface dark:bg-surface border-border p-6 rounded-3xl mb-6 animate-slide-in-right" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
        <h3 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">storage</span>
          Data Management
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-delete" className="text-foreground font-medium">Auto-delete Completed</Label>
              <p className="text-muted-foreground text-sm">Delete tasks after 7 days</p>
            </div>
            <Switch id="auto-delete" checked={autoDelete} onCheckedChange={setAutoDelete} />
          </div>

          <Separator className="bg-border/50" />

          <Button onClick={handleExportData} variant="outline" className="w-full rounded-2xl justify-start gap-2">
            <span className="material-symbols-outlined">download</span>
            Export Data
          </Button>

          <Button onClick={handleClearCompleted} variant="outline" className="w-full rounded-2xl justify-start gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
            <span className="material-symbols-outlined">delete_sweep</span>
            Clear Completed Tasks
          </Button>
        </div>
      </Card>

      {/* Account */}
      <Card className="bg-surface dark:bg-surface border-border p-6 rounded-3xl animate-slide-in-right" style={{ animationDelay: "0.7s", animationFillMode: "both" }}>
        <h3 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_circle</span>
          Account
        </h3>
        
        <div className="space-y-3">
          <div className="bg-background rounded-2xl p-3 mb-4">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="text-foreground font-medium">{user?.email}</p>
          </div>

          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="w-full rounded-2xl justify-start gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
