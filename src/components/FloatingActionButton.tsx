import { Button } from "./ui/button";
import { useHaptics } from "@/hooks/use-haptics";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  const { haptic } = useHaptics();

  const handleClick = () => {
    haptic('light');
    onClick();
  };

  return (
    <div className="fixed bottom-24 right-6 z-20">
      <Button
        onClick={handleClick}
        className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl shadow-lg active:opacity-80"
        style={{ animation: 'none' }}
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Button>
    </div>
  );
};
