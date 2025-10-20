import { useState, useEffect } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminStatsCards from "../components/Admin/AdminStatsCards";
import AdminCharts from "../components/Admin/AdminCharts";
import AdminInvoices from "../components/Admin/Invoices";
import AdminAccountManagement from "../components/Admin/AccountManagement";
import AdminEditAccountModal from "../components/Admin/EditAccountModal";

import {
  mockAdminInvoices,
  mockAdminRevenueData,
  mockAdminDishSalesData,
} from "../lib/adminData";

import { updateStaff, deleteStaff, listStaffPaging } from "../lib/apiStaff";
import { getCurrentUser, getToken, parseJWT } from "../lib/auth";
import { findStaffByUsername, normalizeStaff } from "../lib/apiStaff";

export default function Admin() {
  const [adminName, setAdminName] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [revenuePeriod, setRevenuePeriod] = useState("day");
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingDish, setIsEditingDish] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(false);

  const [settings, setSettings] = useState({
    theme: "light ",
    language: "vi",
    currency: "USD",
    emailNotif: true,
    pushNotif: false,
    compactSidebar: false,
    autoSave: true,
  });

  useEffect(() => {
    const loadName = async () => {
      try {
        const cached = getCurrentUser();
        const cachedName = cached?.fullName;
        if (cachedName) {
          setAdminName(cachedName);
          return;
        }
        let username = cached?.username;
        if (!username) {
          const token = getToken();
          const d = token ? parseJWT(token) : null;
          username = d?.username || "";
        }
        if (!username) {
          setAdminName("Admin");
          return;
        }
        const profile = await findStaffByUsername(username);
        setAdminName(profile?.name);
      } catch (err) {
        console.error(err);
        setAdminName("Admin");
      }
    };
    loadName();
  }, []);

  // Mock data
  // const [accounts, setAccounts] = useState(mockAdminAccounts);
  const [invoices, setInvoices] = useState(mockAdminInvoices);

  //Call API data real
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState("");

  const [page, setPage] = useState(1);
  const [size] = useState(6);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    size: 6,
    totalPages: 1,
    totalElements: 0,
  });

  useEffect(() => {
    if (activeSection === "accounts") setPage(1);
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "accounts") return;
    let cancelled = false;

    (async () => {
      setLoadingAccounts(true);
      setAccountsError("");
      try {
        const { items, pageInfo } = await listStaffPaging({ page, size });
        if (!cancelled) {
          setAccounts(items);
          setPageInfo(pageInfo);
        }
      } catch (err) {
        if (!cancelled)
          setAccountsError(
            err.message || "Không tải được danh sách nhân viên.",
          );
      } finally {
        if (!cancelled) setLoadingAccounts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeSection, page, size]);

  const refetchAccounts = async (toPage = page) => {
    setLoadingAccounts(true);
    try {
      const { items, pageInfo } = await listStaffPaging({ page: toPage, size });
      setAccounts(items);
      setPageInfo(pageInfo);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const updateAccount = async (data) => {
    const staffId = data?.staffId ?? data?.id;
    if (!staffId) return;

    const payload = [
      "fullName",
      "email",
      "phone",
      "dob",
      "role",
      "password",
    ].reduce((object, key) => {
      let value = data[key];
      if (value === "" || value === undefined || value === null) return object;
      if (key === "role") value = String(value).toUpperCase();
      object[key] = value;
      return object;
    }, {});

    try {
      const response = await updateStaff(staffId, payload);
      const updated = normalizeStaff(response?.result ?? response);
      setAccounts((prev) =>
        prev.map((arr) => (arr.id === staffId ? { ...arr, ...updated } : arr)),
      );
    } catch (err) {
      const data = err?.response?.data || err?.data || {};
      const list = data?.result || data?.errors || data?.fieldErrors || [];
      const message =
        (Array.isArray(list) &&
          list
            .map((arrs) => arrs?.defaultMessage || arrs?.message)
            .filter(Boolean)
            .join(" | ")) ||
        data?.message ||
        err.message ||
        "Cập nhật thất bại.";
      alert(message);
      throw err;
    }
  };

  const deleteAccount = async (staffId) => {
    if (!staffId) return;
    const targetDelete = accounts.find(
      (arr) => Number(arr.staffId) === Number(staffId),
    );
    if (!targetDelete) return;
    const me = getCurrentUser() || {};
    const meUsername = String(me.username || "").toLowerCase();
    const isSelf =
      String(targetDelete.username || "").toLowerCase() === meUsername ||
      Number(targetDelete.accountId) === Number(me.accountId) ||
      Number(targetDelete.staffId) === Number(me.staffId || me.id);
    if (isSelf) {
      alert("Không thể xoá tài khoản đang đăng nhập.");
      return;
    }
    const findStaffId = Number(targetDelete.staffId);
    if (!findStaffId) {
      alert("Không tìm thấy StaffId để thực hiện tác vụ.");
      return;
    }
    const prev = accounts;
    setDeletingIds((set) => new Set(set).add(findStaffId));
    setAccounts((cur) => cur.filter((acc) => Number(acc.id) !== findStaffId));
    try {
      await deleteStaff(findStaffId);
      const remaining = accounts.length - 1;
      if (remaining <= 0 && page > 1) setPage((p) => p - 1);
      else await refetchAccounts(page);
    } catch (err) {
      setAccounts(prev);
      const data = err?.response?.data || err?.data || {};
      const list = data?.result || data?.errors || data?.fieldErrors || [];
      const message =
        (Array.isArray(list) &&
          list
            .map((it) => it?.defaultMessage || it?.message)
            .filter(Boolean)
            .join(" | ")) ||
        data?.message ||
        err?.message ||
        "Xoá thất bại.";
      alert(message);
    } finally {
      setDeletingIds((set) => {
        const next = new Set(set);
        next.delete(findStaffId);
        return next;
      });
    }
  };

  // Calculate totals
  const totalRevenue = mockAdminRevenueData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const totalAccounts = accounts.length;
  const totalDishes = dishes.length;
  const totalInvoices = invoices.length;

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <>
            <AdminStatsCards
              totalRevenue={totalRevenue}
              totalAccounts={totalAccounts}
              totalDishes={totalDishes}
              totalInvoices={totalInvoices}
            />
            <AdminCharts
              revenueData={mockAdminRevenueData}
              dishSalesData={mockAdminDishSalesData}
              revenuePeriod={revenuePeriod}
              setRevenuePeriod={setRevenuePeriod}
            />
          </>
        );
      case "accounts":
        return (
          <AdminAccountManagement
            accounts={accounts}
            setAccounts={setAccounts}
            setIsEditingAccount={setIsEditingAccount}
            setEditingItem={setEditingItem}
            deleteAccount={deleteAccount}
            loading={loadingAccounts}
            deletingIds={deletingIds}
            page={page}
            pageInfo={pageInfo}
            onPageChange={setPage}
            currentUser={getCurrentUser()}
          />
        );
      case "dishes":
        return (
          <AdminDishesManagement
            dishes={dishes}
            setDishes={setDishes}
            setIsEditingDish={setIsEditingDish}
            setEditingItem={setEditingItem}
            loading={loadingDishes}
          />
        );
      case "invoices":
        return <AdminInvoices invoices={invoices} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50 to-purple-50">
      <div className="flex">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          compact={settings.compactSidebar}
        />

        <main className="flex-1 p-6">
          {/* Main Content Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Chào mừng trở lại, {adminName}!
            </h1>
            <p className="text-neutral-600 text-lg">
              Quản lý hệ thống nhà hàng hiệu quả với dashboard thông minh
            </p>
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </main>
      </div>

      <AdminEditAccountModal
        isEditingAccount={isEditingAccount}
        setIsEditingAccount={setIsEditingAccount}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        saveAccount={updateAccount}
        setDeletingIds={deletingIds}
        accounts={accounts}
      />
      {/* <AdminEditDishModal
        isEditingDish={isEditingDish}
        setIsEditingDish={setIsEditingDish}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        saveDish={(updatedDish) => {
          if (updatedDish) {
            setDishes((prev) =>
              prev.map((dish) =>
                dish.id === updatedDish.id ? updatedDish : dish,
              ),
            );
          }
        }}
      /> */}
    </div>
  );
}
