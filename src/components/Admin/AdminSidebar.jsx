import { BarChart3, Users, Package, FileText, LogOut } from "lucide-react";

const sidebarItems = [
  { id: "overview", label: "Tổng Quan", icon: BarChart3 },
  { id: "accounts", label: "Tài Khoản", icon: Users },
  { id: "invoices", label: "Hóa Đơn", icon: FileText },
];

export default function AdminSidebar({ activeSection, setActiveSection }) {
  return (
    <aside className="w-64 bg-white/60 backdrop-blur-sm border-r border-white/20 min-h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8"></div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                    : "text-neutral-700 hover:bg-white/50 hover:shadow-md"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    activeSection === item.id
                      ? "text-white"
                      : "text-neutral-600 group-hover:text-blue-500"
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
