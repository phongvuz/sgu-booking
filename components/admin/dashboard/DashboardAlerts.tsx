import type { DashboardStats } from "@/types";

export function DashboardAlerts({ stats }: { stats: DashboardStats | null }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-base">Cảnh báo hệ thống</h3>
          <span className="text-[11px] font-semibold text-gray-400">Khi tải dữ liệu</span>
        </div>

        <div className="space-y-4 mt-4">
          {stats?.systemAlerts?.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3">
              <div
                className={`w-2.5 h-2.5 mt-1 rounded-full shrink-0 ${
                  alert.type === "warning"
                    ? "bg-amber-500"
                    : alert.type === "success"
                    ? "bg-emerald-500"
                    : alert.type === "danger"
                    ? "bg-rose-500"
                    : "bg-blue-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800">{alert.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                  {alert.message}
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {alert.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex items-center justify-between">
          <span className="font-medium">Tổng chuyến xe trong cơ sở dữ liệu:</span>
          <span className="font-bold text-gray-900 text-sm">
            {stats?.totalTrips || 0}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 flex items-center justify-between mt-2">
          <span className="font-medium">Tổng người dùng đăng ký:</span>
          <span className="font-bold text-gray-900 text-sm">
            {stats?.totalUsers || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
