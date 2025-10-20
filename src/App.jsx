// App.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import Admin from "./pages/Admin.jsx";
import Manager from "./pages/Manager.jsx";
import Chef from "./pages/Chef.jsx";
import ProtectedRoute from "./components/Handle/ProtectedRoute.jsx";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/home/*" element={<Home />} />
      <Route path="*" element={<Home />} />

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <MainLayout
              headerProps={{
                icon: "👥",
                title: "Trang nhân viên",
                subtitle: "Quản lý dịch vụ khách hàng",
                userRole: "staff",
                userName: "staff",
              }}
              showFooter={false}
            >
              <StaffPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <MainLayout
              headerProps={{
                icon: "📊",
                title: "Trang quản trị",
                subtitle: "Quản lý hệ thống",
                userRole: "admin",
                userName: "admin",
              }}
              showFooter={false}
            >
              <Admin />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/chef"
        element={
          <ProtectedRoute allowedRoles={["CHEF"]}>
            <MainLayout
              headerProps={{
                icon: "👨‍🍳",
                title: "Trang bếp",
                subtitle: "Quản lý món ăn và đơn hàng",
                userRole: "chef",
                userName: "chef",
              }}
              showFooter={false}
            >
              <Chef />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <MainLayout
              headerProps={{
                icon: "👔",
                title: "Trang quản lý",
                subtitle: "Quản lý nhà hàng",
                userRole: "manager",
                userName: "manager",
              }}
              showFooter={false}
            >
              <Manager />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
