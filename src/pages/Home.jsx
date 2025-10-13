import HeroSection from "../components/Home/HeroSection";
import VisionSection from "../components/Home/VisionSection";
import MenuSection from "../components/Home/MenuSection";
import LoginForm from "../components/Home/LoginForm";
import RegisterForm from "../components/Home/RegisterForm";
import BookingForm from "../components/Home/BookingForm";
import {
  MapPin,
  Phone,
  Mail,
  X,
  Star,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true); // true = login, false = register
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Trạng thái đăng nhập

  const handleBookingSubmit = (formData) => {
    console.log("Booking submitted:", formData);
    alert("Đặt bàn thành công! Chúng tôi sẽ liên hệ lại với bạn.");
    setIsBookingOpen(false);
  };

  const handleLoginSubmit = (formData) => {
    console.log("Login submitted:", formData);
    alert("Đăng nhập thành công!");
    setIsLoggedIn(true); // Set trạng thái đã đăng nhập
    setIsLoginOpen(false);
  };

  const handleRegisterSubmit = (formData) => {
    console.log("Register submitted:", formData);
    alert("Đăng ký thành công!");
    setIsLoginOpen(false);
  };

  const switchToRegister = () => {
    console.log("Switching to register form");
    setIsLoginForm(false);
  };

  const switchToLogin = () => {
    console.log("Switching to login form");
    setIsLoginForm(true);
  };

  const handleLoginFromBooking = () => {
    setIsBookingOpen(false); // Đóng form đặt bàn
    setIsLoginOpen(true); // Mở form đăng nhập
    setIsLoginForm(true); // Đảm bảo hiển thị form đăng nhập
  };

  // Mock menu data for preview
  const menuCategories = {
    "Best Sellers": [
      { name: "Pizza Margherita", price: "299,000đ", image: "🍕" },
      { name: "Pasta Carbonara", price: "189,000đ", image: "🍝" },
      { name: "Beef Steak", price: "599,000đ", image: "🥩" },
    ],
    "Good Deals": [
      { name: "Caesar Salad", price: "149,000đ", image: "🥗" },
      { name: "Chicken Wings", price: "199,000đ", image: "🍗" },
      { name: "Tiramisu", price: "129,000đ", image: "🍰" },
    ],
  };

  return (
    <div className="min-h-screen">
      {/* Home Header */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          {/* Brand Name */}
          <Link
            to="/home"
            className="text-2xl font-bold text-orange-600"
            aria-label="Go to home"
          >
            PersonaDine
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-gray-700 hover:text-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-md px-3 py-1 rounded-lg"
            >
              Về Chúng Tôi
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => setIsLoggedIn(false)}
                className="text-gray-700 hover:text-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-md px-3 py-1 rounded-lg"
              >
                Đăng Xuất
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-gray-700 hover:text-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-md px-3 py-1 rounded-lg"
              >
                Đăng Nhập
              </button>
            )}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="text-gray-700 hover:text-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-md px-3 py-1 rounded-lg"
            >
              Đặt Bàn
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
            >
              Thực Đơn
            </button>
          </nav>
        </div>
      </header>

      {/* Original Home Content */}
      <div className="pt-20">
        <HeroSection />
        <VisionSection />
        <MenuSection />
      </div>

      {/* Location Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Vị trí của chúng tôi
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Ghé thăm nhà hàng của chúng tôi tại vị trí thuận tiện và không
              gian đẹp mắt
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                Thông tin liên hệ
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <span className="text-neutral-700">
                    7 D1, Long Thạnh Mỹ, TP.HCM
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <span className="text-neutral-700">+84 123-456-789</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <span className="text-neutral-700">
                    comqueduongbau@restaurant.com
                  </span>
                </div>
              </div>
            </div>
            {/* Dùng iframe của GG Map */}
            <div className="rounded-2xl overflow-hidden h-64">
              <iframe
                title="Restaurant Map"
                src={
                  "https://www.google.com/maps?q=" +
                  encodeURIComponent(
                    "7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 700000, Việt Nam",
                  ) +
                  "&output=embed"
                }
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Booking Sidebar */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 transition-opacity duration-300">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsBookingOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Đặt Bàn</h2>
                <button
                  onClick={() => setIsBookingOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <BookingForm 
                onSubmit={handleBookingSubmit} 
                isLoggedIn={isLoggedIn}
                onLoginClick={handleLoginFromBooking}
              />
            </div>
          </div>
        </div>
      )}

      {/* Menu Preview Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 transition-opacity duration-300">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300">
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Thực Đơn</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(menuCategories).map(([category, dishes]) => (
                  <div key={category}>
                    <h3 className="text-xl font-bold text-orange-600 mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {dishes.map((dish, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{dish.image}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {dish.name}
                              </h4>
                              <p className="text-orange-600 font-bold text-sm">
                                {dish.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Sidebar */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 transition-opacity duration-300">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsAboutOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300">
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Về Chúng Tôi
                </h2>
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
                <p>
                  Chào mừng bạn đến với nhà hàng của chúng tôi, nơi tinh hoa ẩm
                  thực hòa quện cùng sự hiếu khách nồng ấm. Trong hơn một thập
                  kỷ qua, chúng tôi đã phục vụ những món ăn tuyệt hảo được chế
                  biến từ những nguyên liệu tinh túy nhất.
                </p>

                <p>
                  Những đầu bếp tài hoa của chúng tôi sáng tạo nên thực đơn độc
                  đáo, kết hợp tinh hoa kỹ thuật truyền thống với hương vị hiện
                  đại, mang đến trải nghiệm ẩm thực khó quên trong từng món ăn.
                </p>

                <p>
                  Chúng tôi tự hào mang đến dịch vụ xuất sắc trong một không
                  gian thoải mái và thanh lịch, lý tưởng cho mọi dịp – từ những
                  bữa tối ấm cúng cho đến các buổi tiệc lớn.
                </p>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-orange-600 mb-2">
                    Sứ mệnh của chúng tôi
                  </h3>
                  <p className="text-sm">
                    Tạo nên những trải nghiệm ẩm thực khó quên thông qua món ăn
                    tuyệt hảo, dịch vụ xuất sắc và sự hiếu khách nồng ấm. Đồng
                    thời, chúng tôi mang đến thực đơn đa dạng và cá nhân hóa
                    theo nhu cầu từng người, nhằm phục vụ mục tiêu ăn uống lành
                    mạnh – từ tăng, giảm cho đến duy trì cân nặng một cách bền
                    vững.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login/Register Sidebar */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 transition-opacity duration-300">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsLoginOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300">
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoginForm ? "Đăng Nhập" : "Đăng Ký"}
                </h2>
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              

              {/* Form Container */}
              <div className="transition-all duration-500 ease-in-out">
                {isLoginForm ? (
                  <LoginForm 
                    onSubmit={handleLoginSubmit} 
                    onSwitchToRegister={switchToRegister} 
                  />
                ) : (
                  <RegisterForm 
                    onSubmit={handleRegisterSubmit} 
                    onSwitchToLogin={switchToLogin} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
