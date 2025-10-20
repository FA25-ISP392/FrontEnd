import { useState, useEffect } from "react";
import ChefSidebar from "../components/Chef/ChefSidebar";
import OrdersManagement from "../components/Chef/OrdersManagement";
import DishQuantityManagement from "../components/Chef/DishQuantityManagement";
import { mockChefOrders, mockChefDishes } from "../lib/chefData";
import { getCurrentUser } from "../lib/auth";
import ChefDailyPlan from "../components/Chef/ChefDailyPlan";
import ChefDailyDishes from "../components/Chef/ChefDailyDishes";

export default function Chef() {
  const [chefName, setChefName] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [orders, setOrders] = useState(mockChefOrders);
  const [dishes, setDishes] = useState(mockChefDishes);
  const [dishRequests, setDishRequests] = useState([]); // Requests sent to Manager

  //lấy tên để welcome
  useEffect(() => {
    const u = getCurrentUser();
    const name =
      u?.staff_name ||
      u?.staffName ||
      u?.fullName ||
      u?.name ||
      u?.displayName ||
      u?.username;
    setChefName(name || "Chef");
  }, []);

  // Calculate stats
  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing",
  ).length;
  const availableDishes = dishes.filter(
    (dish) => dish.status === "available",
  ).length;
  const totalRevenue = 1250.5; // Mock total revenue

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  const submitDishRequest = (request) => {
    const newRequest = {
      ...request,
      id: Date.now(),
      createdAt: Date.now(),
      status: "pending",
    };
    setDishRequests((prev) => [...prev, newRequest]);
    // In a real app, this would be sent to backend/server
    console.log("Dish request submitted:", newRequest);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <>
            <OrdersManagement
              orders={orders}
              updateOrderStatus={updateOrderStatus}
            />
          </>
        );
      case "orders":
        return (
          <OrdersManagement
            orders={orders}
            updateOrderStatus={updateOrderStatus}
          />
        );
      case "dishes":
        return (
          <DishQuantityManagement
            dishes={dishes}
            onSubmitRequest={submitDishRequest}
          />
        );
      case "dailyPlan":
        return <ChefDailyPlan />;
      case "dailyDishes":
        return <ChefDailyDishes />;

      case "invoices":
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Quản Lý Hóa Đơn
            </h3>
            <p className="text-neutral-600">
              Chức năng quản lý hóa đơn sẽ được phát triển...
            </p>
          </div>
        );
      case "settings":
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Cài Đặt</h3>
            <p className="text-neutral-600">
              Chức năng cài đặt sẽ được phát triển...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-orange-50 to-red-50">
      <div className="flex">
        <ChefSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className="flex-1 p-6">
          {/* Main Content Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Chào mừng trở lại, {chefName}!
            </h1>
            <p className="text-neutral-600 text-lg">
              Quản lý bếp hiệu quả với dashboard thông minh
            </p>
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
