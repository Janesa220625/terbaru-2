import { Loader2 } from "lucide-react";

export function LoadingSpinner({
  size = "default",
}: {
  size?: "small" | "default" | "large";
}) {
  const sizeClass = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-8 w-8",
  }[size];

  return <Loader2 className={`animate-spin ${sizeClass}`} />;
}

export function LoadingScreen({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-background">
      <LoadingSpinner size="large" />
      <p className="text-lg">{message}</p>
    </div>
  );
}
