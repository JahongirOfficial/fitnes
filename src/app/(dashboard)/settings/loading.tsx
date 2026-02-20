import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex gap-6">
      <div className="w-64 shrink-0 hidden lg:block">
        <div className="bg-white rounded-2xl p-3 shadow-sm space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
