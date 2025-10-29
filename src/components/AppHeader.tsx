import { Button } from "./ui/button";

interface AppHeaderProps {
  currentDate: string;
}

export const AppHeader = ({ currentDate }: AppHeaderProps) => {
  return (
    <header className="flex flex-col gap-1 bg-background px-4 pt-[calc(env(safe-area-inset-top)+0.25rem)] pb-2 sticky top-0 z-10">
      <div className="flex items-center h-10 justify-between">
        <div className="text-foreground flex size-12 shrink-0 items-center">
          <span className="material-symbols-outlined text-3xl">event_note</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 text-foreground hover:bg-primary/10"
          >
            <span className="material-symbols-outlined text-2xl">search</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 text-foreground hover:bg-primary/10"
          >
            <span className="material-symbols-outlined text-2xl">more_vert</span>
          </Button>
        </div>
      </div>
      <h1 className="text-foreground tracking-tight text-[32px] font-extrabold leading-tight px-2">
        {currentDate}
      </h1>
    </header>
  );
};
