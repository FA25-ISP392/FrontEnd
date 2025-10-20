import { useState } from "react";
import {
  User,
  LogOut,
  Edit3,
  Lock,
  ChevronDown,
  X,
  History,
} from "lucide-react";
import EditAccountModal from "./EditAccountModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function UserAccountDropdown({
  isLoggedIn,
  userInfo,
  onLogout,
  onBookingHistoryClick,
  onEditAccountClick,
  onChangePasswordClick,
  onCloseEditAccount,
  onCloseChangePassword,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  if (!isLoggedIn) return null;

  const handleEditAccount = () => {
    setIsEditAccountOpen(true);
    setIsDropdownOpen(false);
    onEditAccountClick();
  };

  const handleChangePassword = () => {
    setIsChangePasswordOpen(true);
    setIsDropdownOpen(false);
    onChangePasswordClick();
  };

  const handleBookingHistory = () => {
    onBookingHistoryClick();
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-700 font-medium text-sm">
            {userInfo?.fullName || userInfo?.username || "Tài khoản"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {userInfo?.fullName || userInfo?.username || "Người dùng"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {userInfo?.email || "Chưa có email"}
                  </p>
                </div>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleEditAccount}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 text-sm">
                  Sửa thông tin tài khoản
                </span>
              </button>

              <button
                onClick={handleChangePassword}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 text-sm">Đổi mật khẩu</span>
              </button>

              <button
                onClick={handleBookingHistory}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <History className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 text-sm">Lịch sử đặt bàn</span>
              </button>
            </div>

            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <EditAccountModal
        isOpen={isEditAccountOpen}
        onClose={() => {
          setIsEditAccountOpen(false);
          onCloseEditAccount();
        }}
        userInfo={userInfo}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => {
          setIsChangePasswordOpen(false);
          onCloseChangePassword();
        }}
        userInfo={userInfo}
      />
    </>
  );
}
