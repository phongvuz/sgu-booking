import type { DashboardStats } from "@/types";
import { formatPrice } from "@/lib/trip-display";

export function DashboardOverview({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Doanh thu tháng này */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Doanh thu tháng này
          </span>
          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
            💰
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded-md w-36"></div>
            ) : (
              formatPrice(stats?.revenueThisMonth || 0)
            )}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
            <span>↑ {stats?.revenueGrowthPercent || 0}%</span>
            <span className="text-gray-400">so với tháng trước</span>
          </p>
        </div>
      </div>

      {/* Vé bán hôm nay */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Vé bán hôm nay
          </span>
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
            🎫
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded-md w-20"></div>
            ) : (
              `${stats?.ticketsSoldToday || 0} vé`
            )}
          </div>
          <p className="text-xs text-blue-600 font-medium mt-1.5 flex items-center gap-1">
            <span>↑ {stats?.ticketsGrowthPercent || 0}%</span>
            <span className="text-gray-400">so với hôm qua</span>
          </p>
        </div>
      </div>

      {/* Xe hoạt động */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Xe đang hoạt động
          </span>
          <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold">
            🚐
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded-md w-24"></div>
            ) : (
              `${stats?.activeBuses || 0} / ${stats?.totalBuses || 0}`
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {(stats?.totalBuses || 0) - (stats?.activeBuses || 0)} xe đang bảo dưỡng/nghỉ
          </p>
        </div>
      </div>

      {/* Nhân sự làm việc */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Nhân viên làm việc
          </span>
          <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
            👥
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded-md w-24"></div>
            ) : (
              `${stats?.activeEmployees || 0} / ${stats?.totalEmployees || 0}`
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Tài xế, Phụ xe, Văn phòng vé
          </p>
        </div>
      </div>
    </div>
  );
}
