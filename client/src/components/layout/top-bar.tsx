import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  subtitle: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary";
  };
  aiButton?: {
    label: string;
    onClick: () => void;
  };
}

export function TopBar({ title, subtitle, actionButton, aiButton }: TopBarProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          {aiButton && (
            <Button
              onClick={aiButton.onClick}
              variant="secondary"
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
              {aiButton.label}
            </Button>
          )}
          {actionButton && (
            <Button
              onClick={actionButton.onClick}
              variant={actionButton.variant || "default"}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {actionButton.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
