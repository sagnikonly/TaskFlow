import { NavLink } from "react-router-dom";
import { useHaptics } from "@/hooks/use-haptics";

const navItems = [
  { path: "/", icon: "home", label: "Home" },
  { path: "/analysis", icon: "bar_chart", label: "Analysis" },
  { path: "/subjects", icon: "category", label: "Subjects" },
  { path: "/settings", icon: "settings", label: "Settings" },
];

export const BottomNav = () => {
  const { haptic } = useHaptics();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface dark:bg-surface border-t border-border/50 z-30 max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            onClick={() => haptic('selection')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-300 active:scale-95 ${
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-2xl transition-transform duration-300 ${isActive ? 'animate-bounce-once' : ''}`}>
                  {item.icon}
                </span>
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
