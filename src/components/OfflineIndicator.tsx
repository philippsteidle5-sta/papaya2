import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[200] flex items-center gap-2 rounded-xl bg-amber-500/95 px-3 py-1.5 text-xs font-mono font-bold text-slate-950 shadow-xl border border-amber-300 animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>OFFLINE-MODUS // PWA GECACHT</span>
    </div>
  );
};
