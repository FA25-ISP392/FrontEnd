import {
  BarChart3,
  ChefHat,
  ClipboardList,
  CalendarCheck2,
} from "lucide-react";

const sidebarItems = [
  { id: "overview", label: "Tổng Quan", icon: BarChart3 },
  { id: "orders", label: "Đơn Hàng", icon: ChefHat },
  { id: "dailyPlan", label: "Kế Hoạch Trong Ngày", icon: ClipboardList },
  { id: "dailyDishes", label: "Món Trong Ngày", icon: CalendarCheck2 },
];

export default function ChefSidebar({ activeSection, setActiveSection }) {
  return (
    <aside className="w-64 bg-white/60 backdrop-blur-sm border-r border-white/20 min-h-screen sticky top-0">
      <div className="p-6">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                    : "text-neutral-700 hover:bg-white/50 hover:shadow-md"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    activeSection === item.id
                      ? "text-white"
                      : "text-neutral-600 group-hover:text-orange-500"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
