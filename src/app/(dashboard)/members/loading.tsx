import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

export default function MembersLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["#", "Ism", "Telefon", "Abonement", "Holat", "Muddat", "Amallar"].map((h) => (
                <th key={h} className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={7} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
