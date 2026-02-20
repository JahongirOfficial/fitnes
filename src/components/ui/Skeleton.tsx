import { cn } from "@/lib/utils";

// ─── Base Skeleton ───────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

// ─── Product Card Skeleton ───────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex justify-end mb-2">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex justify-center mb-4">
        <Skeleton className="w-20 h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-7 w-1/2 mx-auto mb-4" />
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Stat Card Skeleton ──────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-7 w-32" />
        </div>
      </div>
    </div>
  );
}

// ─── Table Row Skeleton ──────────────────────────────────────────────────────

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={cn("h-4", i === 0 ? "w-8" : i === 1 ? "w-40" : "w-24")} />
        </td>
      ))}
    </tr>
  );
}

// ─── Chart Skeleton ──────────────────────────────────────────────────────────

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  );
}

// ─── Dashboard Stat Card Skeleton ────────────────────────────────────────────

export function DashStatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <Skeleton className="w-12 h-12 rounded-xl mb-4" />
      <Skeleton className="h-8 w-32 mb-2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}
