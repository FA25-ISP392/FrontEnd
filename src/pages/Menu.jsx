import { useState, useEffect } from "react";
import { CheckCircle, Table } from "lucide-react";
import MenuHeader from "../components/Menu/MenuHeader";
import MenuContent from "../components/Menu/MenuContent";
import MenuFooter from "../components/Menu/MenuFooter";
import PersonalizationModal from "../components/Menu/PersonalizationModal";
import CartSidebar from "../components/Menu/CartSidebar";
import PaymentSidebar from "../components/Menu/PaymentSidebar";
import DishOptionsModal from "../components/Menu/DishOptionsModal";
import { mockMenuDishes } from "../lib/menuData";
import { createOrder } from "../lib/apiOrder";

export default function Menu() {
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCallStaffOpen, setIsCallStaffOpen] = useState(false);
  const [isDishOptionsOpen, setIsDishOptionsOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState("all");
  const [selectedDish, setSelectedDish] = useState(null);
  const [cart, setCart] = useState([]);
  const [personalizedMenu, setPersonalizedMenu] = useState([]);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [estimatedCalories, setEstimatedCalories] = useState(2000);

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [tableId, setTableId] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [orderId, setOrderId] = useState(
    () => sessionStorage.getItem("orderId") || null
  );

  useEffect(() => {
    const storedTableId = sessionStorage.getItem("customerTableId");
    const storedCustomerId = sessionStorage.getItem("customerId");

    if (storedTableId) {
      setTableId(storedTableId);
    }

    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    } else {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          const cid = userData.customerId ?? userData.id;
          if (cid != null) {
            setCustomerId(String(cid));
            sessionStorage.setItem("customerId", String(cid));
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const ready = Boolean(customerId) && Boolean(tableId);
    if (!ready) return;

    const existed = sessionStorage.getItem("orderId");

    if (existed) {
      setOrderId(existed);
      return;
    }

    const idemKey = `orderInit_${customerId}_${tableId}`;
    if (sessionStorage.getItem(idemKey) === "1") return;
    sessionStorage.setItem(idemKey, "1");

    (async () => {
      try {
        const order = await createOrder({ customerId, tableId });
        if (order?.orderId) {
          setOrderId(String(order.orderId));
          sessionStorage.setItem("orderId", String(order.orderId));
        }
      } catch (err) {
        console.error("Create order failed:", err?.message || err);
        sessionStorage.removeItem(idemKey);
      }
    })();
  }, [customerId, tableId]);

  const [personalizationForm, setPersonalizationForm] = useState({
    height: 170,
    weight: 70,
    gender: "male",
    age: 25,
    exerciseLevel: "moderate",
    preferences: [],
    goal: "",
  });

  const hiddenNames = (() => {
    try {
      return JSON.parse(localStorage.getItem("hidden_dishes")) || [];
    } catch (_) {
      return [];
    }
  })();

  const filteredDishes = mockMenuDishes.filter(
    (dish) => dish.available && !hiddenNames.includes(dish.name)
  );

  const addToCart = (dish, notes = "") => {
    const existingItem = cart.find(
      (item) => item.id === dish.id && item.notes === notes
    );
    if (existingItem) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === dish.id && item.notes === notes
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((prevCart) => [...prevCart, { ...dish, quantity: 1, notes }]);
    }
    setCaloriesConsumed((prev) => prev + (dish.totalCalories || dish.calories));
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cart.find((item) => item.id === itemId);
    if (item) {
      const quantityDiff = newQuantity - item.quantity;
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      setCaloriesConsumed(
        (prev) => prev + quantityDiff * (item.totalCalories || item.calories)
      );
    }
  };

  const removeFromCart = (itemId) => {
    const item = cart.find((item) => item.id === itemId);
    if (item) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
      setCaloriesConsumed(
        (prev) => prev - (item.totalCalories || item.calories) * item.quantity
      );
    }
  };

  const getPersonalizedDishes = (form) => {
    return mockMenuDishes.filter((dish) => {
      if (form.preferences.includes("spicy") && !dish.spicy) return false;
      if (form.preferences.includes("fatty") && !dish.fatty) return false;
      if (form.preferences.includes("sweet") && !dish.sweet) return false;

      if (form.goal === "lose" && dish.calories > 300) return false;
      if (form.goal === "gain" && dish.calories < 200) return false;

      return dish.available;
    });
  };

  const handlePersonalizationSubmit = (form) => {
    const personalized = getPersonalizedDishes(form);
    setPersonalizedMenu(personalized);
    setIsPersonalizationOpen(false);

    const bmi = form.weight / Math.pow(form.height / 100, 2);
    if (bmi < 18.5) {
      setEstimatedCalories(2200);
    } else if (bmi < 25) {
      setEstimatedCalories(2000);
    } else if (bmi < 30) {
      setEstimatedCalories(1800);
    } else {
      setEstimatedCalories(1600);
    }
  };

  const handleGoalChange = (goalId, checked) => {
    if (checked) {
      const filtered = personalizedMenu.filter((dish) => {
        if (goalId === "lose" && dish.calories > 300) return false;
        if (goalId === "gain" && dish.calories < 200) return false;
        return true;
      });
      setPersonalizedMenu(filtered);
    } else {
      setPersonalizedMenu(getPersonalizedDishes(personalizationForm));
    }
  };

  const handleOrderFood = () => {
    setIsCartOpen(false);
    // Here you would typically send the order to the kitchen
    // console.log("Order sent to kitchen:", cart);
  };

  const handlePayment = () => {
    setIsPaymentOpen(false);
    setIsCallStaffOpen(true);
    // Here you would typically process the payment
    // console.log("Payment processed:", { cart, paymentMethod });
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-orange-50 to-red-50">
      <MenuHeader
        cartItemCount={cartItemCount}
        onPersonalize={() => setIsPersonalizationOpen(true)}
        onViewOrders={() => setIsCartOpen(true)}
        onCallStaff={() => {
          setIsCallStaffOpen(true);
          setTimeout(() => {
            setCart([]);
            setCaloriesConsumed(0);
          }, 2000);
        }}
        onCheckout={() => setIsPaymentOpen(true)}
        tableId={tableId}
        customerId={customerId}
      />
      {orderId ? (
        <div className="px-4 py-2 text-xs text-neutral-600 text-center">
          Mã đơn hiện tại: <span className="font-semibold">{orderId}</span>
        </div>
      ) : null}

      <MenuContent
        activeMenuTab={activeMenuTab}
        setActiveMenuTab={setActiveMenuTab}
        filteredDishes={filteredDishes}
        personalizedMenu={personalizedMenu}
        onDishSelect={(dish) => {
          setSelectedDish(dish);
          setIsDishOptionsOpen(true);
        }}
        caloriesConsumed={caloriesConsumed}
        estimatedCalories={estimatedCalories}
        onGoalChange={handleGoalChange}
      />

      <MenuFooter />

      <PersonalizationModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        personalizationForm={personalizationForm}
        setPersonalizationForm={setPersonalizationForm}
        onSubmit={handlePersonalizationSubmit}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onOrderFood={handleOrderFood}
      />

      <PaymentSidebar
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cart={cart}
        onPayment={handlePayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      <DishOptionsModal
        isOpen={isDishOptionsOpen}
        onClose={() => setIsDishOptionsOpen(false)}
        dish={selectedDish}
        onAddToCart={addToCart}
      />

      {isCallStaffOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Thành công!
              </h3>
              <p className="text-neutral-600 mb-6">
                Nhân viên sẽ đến hỗ trợ bạn ngay! Cảm ơn bạn đã sử dụng dịch vụ.
              </p>
              <button
                onClick={() => setIsCallStaffOpen(false)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
