import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const SyncStatus = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!user || !showStatus) return null;

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-slide-in-right",
        isOnline
          ? "bg-green-500/90 text-white"
          : "bg-orange-500/90 text-white"
      )}
    >
      <span className="material-symbols-outlined text-sm">
        {isOnline ? "cloud_done" : "cloud_off"}
      </span>
      <span className="text-sm font-medium">
        {isOnline ? "Synced to cloud" : "Offline mode"}
      </span>
    </div>
  );
};
