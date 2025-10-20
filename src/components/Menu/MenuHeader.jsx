import {
  ShoppingCart,
  User,
  Bell,
  CreditCard,
  ChefHat,
  Table,
} from "lucide-react";

export default function MenuHeader({
  cartItemCount,
  onPersonalize,
  onViewOrders,
  onCallStaff,
  onCheckout,
  tableId,
  customerId,
}) {
  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Table Info */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">
                  Restaurant
                </h1>
                <p className="text-xs text-neutral-600">Fine Dining</p>
              </div>
            </button>

            {/* Table Information */}
            {tableId && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <Table className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Bàn {tableId}
                </span>
                {customerId && (
                  <span className="text-xs text-blue-600">
                    (ID: {customerId})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onPersonalize}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <User className="h-4 w-4" />
              <span className="font-medium">Cá nhân hóa</span>
            </button>

            <button
              onClick={onViewOrders}
              className="relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">Xem đơn đã đặt</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              onClick={onCallStaff}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Bell className="h-4 w-4" />
              <span className="font-medium">Gọi nhân viên</span>
            </button>

            <button
              onClick={onCheckout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Thanh toán</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
