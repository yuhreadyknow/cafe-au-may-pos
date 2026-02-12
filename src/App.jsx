import { useState, useEffect, useRef, useMemo } from "react";

const DEFAULT_MENU = [
  { id: 1, name: "Matcha (M)", price: 6.00, category: "Drinks", cost: 1.80, emoji: "🍵" },
  { id: 2, name: "Matcha (L)", price: 8.00, category: "Drinks", cost: 2.40, emoji: "🍵" },
  { id: 3, name: "Raspberry Wht Choc Matcha (M)", price: 7.00, category: "Drinks", cost: 2.30, emoji: "🫧" },
  { id: 4, name: "Raspberry Wht Choc Matcha (L)", price: 9.00, category: "Drinks", cost: 3.00, emoji: "🫧" },
  { id: 5, name: "Vietnamese Coffee (M)", price: 6.00, category: "Drinks", cost: 1.20, emoji: "☕" },
  { id: 6, name: "Vietnamese Coffee (L)", price: 8.00, category: "Drinks", cost: 1.60, emoji: "☕" },
  { id: 7, name: "Corn Cookie", price: 5.00, category: "Sweet", cost: 1.50, emoji: "🍪" },
  { id: 8, name: "Strawberry Matcha Pudding (M)", price: 6.00, category: "Sweet", cost: 2.20, emoji: "🍓" },
  { id: 9, name: "Strawberry Matcha Pudding (L)", price: 8.00, category: "Sweet", cost: 3.00, emoji: "🍓" },
  { id: 10, name: "Earl Grey Basque Cheesecake", price: 7.00, category: "Sweet", cost: 2.50, emoji: "🍰" },
  { id: 11, name: "Earl Grey Macaron", price: 5.00, category: "Sweet", cost: 1.60, emoji: "🫖" },
  { id: 12, name: "Black Sesame Butter Cake Bar", price: 5.00, category: "Sweet", cost: 1.40, emoji: "🖤" },
  { id: 13, name: "Pistachio Choc Kadayif Crispy", price: 5.00, category: "Sweet", cost: 1.70, emoji: "💚" },
  { id: 14, name: "Tomato Basil Focaccia (M)", price: 5.00, category: "Savory", cost: 1.80, emoji: "🍅" },
  { id: 15, name: "Tomato Basil Focaccia (L)", price: 10.00, category: "Savory", cost: 3.50, emoji: "🍅" },
  { id: 16, name: "Chili Oil Scallion Focaccia (M)", price: 5.00, category: "Savory", cost: 1.60, emoji: "🌶️" },
  { id: 17, name: "Chili Oil Scallion Focaccia (L)", price: 10.00, category: "Savory", cost: 3.20, emoji: "🌶️" },
  { id: 18, name: "Dill Pickle Popcorn", price: 0.00, category: "Savory", cost: 0.50, emoji: "🍿" },
  { id: 19, name: "+ Burrata", price: 1.00, category: "Add-Ons", cost: 0.60, emoji: "🧀" },
  { id: 20, name: "Oat Milk", price: 0.00, category: "Add-Ons", cost: 0.50, emoji: "🥛" },
  { id: 21, name: "Skim Milk", price: 0.00, category: "Add-Ons", cost: 0.20, emoji: "🥛" },
  { id: 22, name: "Whole Milk", price: 0.00, category: "Add-Ons", cost: 0.15, emoji: "🥛" },
];

const CATEGORIES = ["Drinks", "Sweet", "Savory", "Add-Ons"];
const PAYMENT_METHODS = ["Cash", "Venmo", "Zelle"];
const PAYMENT_COLORS = { Cash: "#2d6a4f", Venmo: "#008CFF", Zelle: "#6C1CD1" };
const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap";
const marginColor = (m) => (m >= 70 ? "#2d6a4f" : m >= 50 ? "#b08c18" : "#c1121f");

const getDayId = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
const todayId = () => getDayId(new Date());

const inputBase = {
  padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #e0d5c8",
  fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
};

const downloadCSV = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const escCSV = (val) => {
  const s = String(val ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
};

const exportBtnStyle = {
  padding: "10px 20px", borderRadius: "10px", border: "1.5px solid #2b2118",
  background: "#fff", color: "#2b2118", cursor: "pointer", fontSize: "13px",
  fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: "inline-flex",
  alignItems: "center", gap: "6px", transition: "all 0.15s",
};

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};

const formatDayLabel = (dayId) => {
  const [y, m, d] = dayId.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function HomeCafePOS() {
  // ─── Viewport ───
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const isPortrait = viewportWidth < 850;

  // ─── Core State ───
  const [menu, setMenu] = useState(() => loadJSON("cafeaumay_menu", DEFAULT_MENU));
  const [order, setOrder] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Drinks");
  const [view, setView] = useState("register");
  const [dailySales, setDailySales] = useState(() =>
    loadJSON("cafeaumay_sales", []).map((s) => ({
      ...s, time: new Date(s.time), dayId: s.dayId || getDayId(new Date(s.time)),
    }))
  );
  const [flash, setFlash] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", price: "", cost: "", category: "Drinks", emoji: "☕" });
  const [customerName, setCustomerName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef(null);

  // ─── New State ───
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [closedDays, setClosedDays] = useState(() => loadJSON("cafeaumay_closed_days", []));
  const [viewingDayId, setViewingDayId] = useState(null);
  const [orderPanelOpen, setOrderPanelOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [importData, setImportData] = useState(null);
  const fileInputRef = useRef(null);

  // ─── Effects ───
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_LINK;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { localStorage.setItem("cafeaumay_sales", JSON.stringify(dailySales)); }, [dailySales]);
  useEffect(() => { localStorage.setItem("cafeaumay_menu", JSON.stringify(menu)); }, [menu]);
  useEffect(() => { localStorage.setItem("cafeaumay_closed_days", JSON.stringify(closedDays)); }, [closedDays]);

  // ─── Derived: Customers (from ALL sales) ───
  const knownCustomers = useMemo(() => {
    const map = {};
    dailySales.forEach((sale) => {
      if (!sale.customer) return;
      const key = sale.customer.toLowerCase();
      if (!map[key]) map[key] = { name: sale.customer, visits: 0, totalSpent: 0, lastVisit: null, items: {} };
      map[key].visits += 1;
      map[key].totalSpent += sale.total;
      map[key].lastVisit = sale.time;
      sale.items.forEach((it) => {
        map[key].items[it.name] = (map[key].items[it.name] || 0) + it.qty;
      });
    });
    return map;
  }, [dailySales]);

  const recentCustomers = useMemo(() =>
    Object.values(knownCustomers).sort((a, b) => b.lastVisit - a.lastVisit),
  [knownCustomers]);

  const suggestions = useMemo(() => {
    if (!customerName.trim()) return recentCustomers.slice(0, 6);
    const q = customerName.toLowerCase();
    return recentCustomers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5);
  }, [customerName, recentCustomers]);

  const topCustomers = useMemo(() =>
    Object.values(knownCustomers).sort((a, b) => b.totalSpent - a.totalSpent),
  [knownCustomers]);

  const currentCustomerData = customerName.trim() ? knownCustomers[customerName.trim().toLowerCase()] : null;

  // ─── Derived: Day-scoped ───
  const isTodayClosed = closedDays.some((d) => d.dayId === todayId());
  const displayDayId = viewingDayId || todayId();
  const isViewingToday = displayDayId === todayId();

  const displaySales = useMemo(() =>
    dailySales.filter((s) => s.dayId === displayDayId),
  [dailySales, displayDayId]);

  const allDayIds = useMemo(() => {
    const days = new Set(dailySales.map((s) => s.dayId));
    days.add(todayId());
    return [...days].sort().reverse();
  }, [dailySales]);

  const dailyRevenue = displaySales.reduce((s, o) => s + o.total, 0);
  const dailyCost = displaySales.reduce((s, o) => s + o.cost, 0);
  const dailyProfit = dailyRevenue - dailyCost;
  const uniqueCustomersDisplay = new Set(displaySales.filter((s) => s.customer).map((s) => s.customer.toLowerCase())).size;

  const paymentBreakdown = useMemo(() => {
    const breakdown = {};
    PAYMENT_METHODS.forEach((m) => { breakdown[m] = { total: 0, count: 0 }; });
    displaySales.forEach((s) => {
      const method = s.paymentMethod || "Cash";
      if (!breakdown[method]) breakdown[method] = { total: 0, count: 0 };
      breakdown[method].total += s.total;
      breakdown[method].count += 1;
    });
    return breakdown;
  }, [displaySales]);

  // ─── Order Logic ───
  const addToOrder = (item) => {
    setOrder((prev) => {
      const existing = prev.find((o) => o.id === item.id);
      if (existing) return prev.map((o) => (o.id === item.id ? { ...o, qty: o.qty + 1 } : o));
      return [...prev, { ...item, qty: 1 }];
    });
    setFlash(item.id);
    setTimeout(() => setFlash(null), 200);
  };

  const removeFromOrder = (id) => {
    setOrder((prev) => {
      const existing = prev.find((o) => o.id === id);
      if (existing && existing.qty > 1) return prev.map((o) => (o.id === id ? { ...o, qty: o.qty - 1 } : o));
      return prev.filter((o) => o.id !== id);
    });
  };

  const orderTotal = order.reduce((sum, o) => sum + o.price * o.qty, 0);
  const orderCost = order.reduce((sum, o) => sum + o.cost * o.qty, 0);
  const orderProfit = orderTotal - orderCost;
  const orderMargin = orderTotal > 0 ? ((orderProfit / orderTotal) * 100).toFixed(0) : 0;
  const orderItemCount = order.reduce((s, o) => s + o.qty, 0);

  const completeOrder = () => {
    if (order.length === 0 || isTodayClosed) return;
    setDailySales((prev) => [...prev, {
      items: [...order], total: orderTotal, cost: orderCost,
      time: new Date(), customer: customerName.trim() || null,
      dayId: todayId(), paymentMethod,
    }]);
    setOrder([]);
    setCustomerName("");
    if (isPortrait) setOrderPanelOpen(false);
  };

  // ─── Day Management ───
  const closeDay = () => {
    setClosedDays((prev) => [...prev, { dayId: todayId(), closedAt: new Date().toISOString(), label: todayId() }]);
    setShowCloseConfirm(false);
  };

  // ─── Menu Management ───
  const saveEditItem = () => {
    if (!editingItem) return;
    setMenu((prev) => prev.map((m) => (m.id === editingItem.id ? editingItem : m)));
    setEditingItem(null);
  };
  const addNewItem = () => {
    if (!newItem.name || !newItem.price) return;
    const id = Math.max(...menu.map((m) => m.id), 0) + 1;
    setMenu((prev) => [...prev, { ...newItem, id, price: parseFloat(newItem.price), cost: parseFloat(newItem.cost) || 0 }]);
    setNewItem({ name: "", price: "", cost: "", category: "Drinks", emoji: "☕" });
  };
  const deleteItem = (id) => {
    setMenu((prev) => prev.filter((m) => m.id !== id));
    setEditingItem(null);
  };

  // ─── Export / Import ───
  const exportData = () => {
    const data = { version: 1, exportedAt: new Date().toISOString(), sales: dailySales, menu, closedDays };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cafe-au-may-backup-${todayId()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setImportData(JSON.parse(ev.target.result));
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!importData) return;
    const sales = (importData.sales || []).map((s) => ({
      ...s, time: new Date(s.time), dayId: s.dayId || getDayId(new Date(s.time)),
    }));
    setDailySales(sales);
    setMenu(importData.menu || DEFAULT_MENU);
    setClosedDays(importData.closedDays || []);
    setImportData(null);
  };

  // ─── CSV Exports ───
  const exportOrdersCSV = () => {
    if (displaySales.length === 0) return;
    const header = "Order #,Time,Customer,Items,Revenue,Cost,Profit,Payment";
    const rows = displaySales.map((sale, i) => [
      i + 1,
      sale.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      escCSV(sale.customer || "Walk-in"),
      escCSV(sale.items.map((it) => `${it.qty}x ${it.name}`).join("; ")),
      sale.total.toFixed(2),
      sale.cost.toFixed(2),
      (sale.total - sale.cost).toFixed(2),
      sale.paymentMethod || "Cash",
    ].join(","));
    downloadCSV(`cafe-au-may-orders-${displayDayId}.csv`, [header, ...rows].join("\n"));
  };

  const exportCustomersCSV = () => {
    if (topCustomers.length === 0) return;
    const header = "Customer,Visits,Total Spent,Avg Order,Favorite Item,Favorite Item Count";
    const rows = topCustomers.map((c) => {
      const fave = Object.entries(c.items).sort((a, b) => b[1] - a[1])[0];
      return [
        escCSV(c.name), c.visits, c.totalSpent.toFixed(2),
        (c.totalSpent / c.visits).toFixed(2),
        escCSV(fave?.[0] || ""), fave?.[1] || 0,
      ].join(",");
    });
    downloadCSV(`cafe-au-may-customers-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows].join("\n"));
  };

  // ─── Shared Order Panel Content ───
  const orderPanelContent = (
    <>
      {/* Customer Input */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #f0ebe4", position: "relative" }}>
        <label style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9a8b7c", fontWeight: 500, display: "block", marginBottom: "6px" }}>
          Customer
        </label>
        <div style={{ position: "relative" }}>
          <input
            ref={nameInputRef}
            value={customerName}
            onChange={(e) => { setCustomerName(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Name (optional)"
            style={{
              ...inputBase, width: "100%", fontSize: "15px", fontWeight: 500, padding: "10px 14px",
              background: customerName ? "#fdfaf6" : "#fff",
              borderColor: customerName ? "#c9a96e" : "#e0d5c8",
            }}
          />
          {customerName && (
            <button onClick={() => { setCustomerName(""); nameInputRef.current?.focus(); }}
              style={{
                position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#9a8b7c", padding: "4px",
              }}>×</button>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: "absolute", left: "20px", right: "20px", top: "100%",
            background: "#fff", border: "1.5px solid #e8e0d6", borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(43,33,24,0.1)", zIndex: 60, overflow: "hidden", marginTop: "4px",
          }}>
            <div style={{ padding: "8px 12px 4px", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#b8a99a" }}>
              {customerName.trim() ? "Matches" : "Recent Customers"}
            </div>
            {suggestions.map((c) => (
              <button key={c.name}
                onMouseDown={(e) => { e.preventDefault(); setCustomerName(c.name); setShowSuggestions(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "14px", textAlign: "left", borderTop: "1px solid #f7f3ee",
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#faf6f1"}
                onMouseOut={(e) => e.currentTarget.style.background = "none"}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: "12px", color: "#9a8b7c", marginLeft: "8px" }}>
                    {c.visits} visit{c.visits !== 1 ? "s" : ""}
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "#9a8b7c" }}>${c.totalSpent.toFixed(0)} total</span>
              </button>
            ))}
          </div>
        )}
        {currentCustomerData && (
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", flexWrap: "wrap" }}>
            <span style={{ background: "#2d6a4f15", color: "#2d6a4f", padding: "2px 8px", borderRadius: "100px", fontWeight: 600 }}>
              Returning
            </span>
            <span style={{ color: "#9a8b7c" }}>
              {currentCustomerData.visits} visit{currentCustomerData.visits !== 1 ? "s" : ""} · Fave: {
                Object.entries(currentCustomerData.items).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
              }
            </span>
          </div>
        )}
      </div>

      {/* Order Header */}
      <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #f0ebe4" }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "22px" }}>Current Order</span>
        <span style={{
          marginLeft: "10px", fontSize: "12px", background: "#f0ebe4",
          padding: "3px 10px", borderRadius: "100px", fontWeight: 500,
        }}>
          {orderItemCount} items
        </span>
      </div>

      {/* Order Items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
        {order.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#b8a99a", fontSize: "14px", fontStyle: "italic" }}>
            {isTodayClosed ? "Today is closed — no new orders" : "Tap menu items to start an order"}
          </div>
        )}
        {order.map((item) => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 0", borderBottom: "1px solid #f7f3ee",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{item.emoji} {item.name}</div>
              <div style={{ fontSize: "12px", color: "#9a8b7c", marginTop: "2px" }}>
                {item.price > 0 ? `$${item.price.toFixed(2)} each` : "FREE"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={() => removeFromOrder(item.id)} style={{
                width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid #e0d5c8",
                background: "#fff", cursor: "pointer", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#2b2118", fontFamily: "'DM Sans', sans-serif",
              }}>−</button>
              <span style={{ fontSize: "15px", fontWeight: 700, minWidth: "18px", textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => addToOrder(item)} style={{
                width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid #2b2118",
                background: "#2b2118", cursor: "pointer", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#faf6f1", fontFamily: "'DM Sans', sans-serif",
              }}>+</button>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "16px", minWidth: "58px", textAlign: "right" }}>
                ${(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #f0ebe4" }}>
        <div style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#9a8b7c", fontWeight: 500, marginBottom: "8px" }}>
          Payment Method
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {PAYMENT_METHODS.map((method) => (
            <button key={method} onClick={() => setPaymentMethod(method)} style={{
              flex: 1, padding: "8px", borderRadius: "8px",
              border: paymentMethod === method ? `2px solid ${PAYMENT_COLORS[method]}` : "2px solid #e0d5c8",
              background: paymentMethod === method ? `${PAYMENT_COLORS[method]}15` : "#fff",
              color: paymentMethod === method ? PAYMENT_COLORS[method] : "#9a8b7c",
              cursor: "pointer", fontSize: "13px", fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
            }}>
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div style={{ padding: "16px 20px", borderTop: "2px solid #2b2118", background: "#fdfcfa" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "13px", color: "#9a8b7c" }}>Subtotal</span>
          <span style={{ fontSize: "13px", color: "#9a8b7c" }}>${orderTotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "13px", color: "#9a8b7c" }}>Your cost</span>
          <span style={{ fontSize: "13px", color: "#9a8b7c" }}>−${orderCost.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: marginColor(orderMargin) }}>
            Profit ({orderMargin}% margin)
          </span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: marginColor(orderMargin) }}>
            ${orderProfit.toFixed(2)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "14px", color: "#9a8b7c" }}>Total</span>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "36px", letterSpacing: "-1px" }}>
            ${orderTotal.toFixed(2)}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => { setOrder([]); setCustomerName(""); }} style={{
            flex: 1, padding: "14px", borderRadius: "12px", border: "1.5px solid #e0d5c8",
            background: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", color: "#2b2118",
          }}>Clear</button>
          <button onClick={completeOrder} style={{
            flex: 2, padding: "14px", borderRadius: "12px", border: "none",
            background: order.length > 0 && !isTodayClosed ? "#2b2118" : "#d5cbc0", color: "#faf6f1",
            cursor: order.length > 0 && !isTodayClosed ? "pointer" : "default", fontSize: "15px", fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", letterSpacing: "0.5px",
          }}>Complete Sale ✓</button>
        </div>
      </div>
    </>
  );

  // ─── Tab config ───
  const tabs = [
    { key: "register", label: "Register", shortLabel: "Register" },
    { key: "menu-editor", label: "Menu & Pricing", shortLabel: "Menu" },
    { key: "daily-summary", label: "P&L", shortLabel: "P&L" },
    { key: "customers", label: "Customers", shortLabel: "Customers" },
  ];

  const gearBtnStyle = {
    width: "36px", height: "36px", borderRadius: "8px", border: "none", cursor: "pointer",
    background: view === "settings" ? "rgba(250,246,241,0.15)" : "transparent",
    color: view === "settings" ? "#faf6f1" : "rgba(250,246,241,0.5)",
    fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
  };

  const contentPad = isPortrait ? "16px" : "24px 32px";
  const maxW = isPortrait ? "none" : "900px";

  return (
    <div style={{
      minHeight: "100vh", background: "#faf6f1", fontFamily: "'DM Sans', sans-serif",
      color: "#2b2118", display: "flex", flexDirection: "column",
    }}>
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, #2b2118 0%, #3d2e22 100%)", color: "#faf6f1",
        padding: isPortrait ? "12px 16px" : "16px 24px",
        display: "flex", flexDirection: isPortrait ? "column" : "row",
        alignItems: isPortrait ? "stretch" : "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 20px rgba(43,33,24,0.15)",
        gap: isPortrait ? "10px" : "0",
        position: "relative", zIndex: 40,
      }}>
        <div style={{ display: "flex", alignItems: isPortrait ? "center" : "baseline", gap: "12px", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: isPortrait ? "24px" : "28px", fontWeight: 400, letterSpacing: "-0.5px" }}>
            Cafe Au May
          </span>
          {!isPortrait && (
            <span style={{ fontSize: "12px", opacity: 0.5, letterSpacing: "2px", textTransform: "uppercase" }}>POS · March 2026</span>
          )}
          {isPortrait && (
            <button onClick={() => setView("settings")} style={gearBtnStyle}>⚙</button>
          )}
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setView(tab.key)} style={{
              padding: isPortrait ? "6px 12px" : "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
              fontSize: isPortrait ? "12px" : "13px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              background: view === tab.key ? "rgba(250,246,241,0.15)" : "transparent",
              color: view === tab.key ? "#faf6f1" : "rgba(250,246,241,0.5)", transition: "all 0.2s",
            }}>
              {isPortrait ? tab.shortLabel : tab.label}
            </button>
          ))}
          {!isPortrait && (
            <button onClick={() => setView("settings")} style={gearBtnStyle}>⚙</button>
          )}
        </div>
      </div>

      {/* ═══════════════════ REGISTER ═══════════════════ */}
      {view === "register" && (
        <div style={{ display: "flex", flexDirection: isPortrait ? "column" : "row", flex: 1, overflow: "hidden", position: "relative" }}>
          {/* Menu Grid */}
          <div style={{ flex: 1, padding: isPortrait ? "16px" : "20px 24px", overflowY: "auto", paddingBottom: isPortrait ? "80px" : undefined }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  padding: isPortrait ? "8px 16px" : "10px 20px", borderRadius: "100px",
                  border: activeCategory === cat ? "2px solid #2b2118" : "2px solid #e0d5c8",
                  background: activeCategory === cat ? "#2b2118" : "transparent",
                  color: activeCategory === cat ? "#faf6f1" : "#2b2118",
                  cursor: "pointer", fontSize: isPortrait ? "13px" : "14px", fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                }}>
                  {cat}
                </button>
              ))}
            </div>

            {isTodayClosed && (
              <div style={{
                padding: "12px 16px", borderRadius: "12px", background: "#c1121f10", border: "1.5px solid #c1121f33",
                marginBottom: "16px", fontSize: "14px", color: "#c1121f", fontWeight: 500, textAlign: "center",
              }}>
                Today is closed — no new orders can be added
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "12px" }}>
              {menu.filter((item) => item.category === activeCategory).map((item) => {
                const itemMargin = item.price > 0 ? ((item.price - item.cost) / item.price * 100).toFixed(0) : "FREE";
                return (
                  <button key={item.id} onClick={() => addToOrder(item)} style={{
                    background: flash === item.id ? "#2b2118" : "#fff",
                    color: flash === item.id ? "#faf6f1" : "#2b2118",
                    border: "1.5px solid #e8e0d6", borderRadius: "16px", padding: "18px 14px 14px",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    display: "flex", flexDirection: "column", gap: "6px", fontFamily: "'DM Sans', sans-serif",
                    boxShadow: flash === item.id ? "0 4px 20px rgba(43,33,24,0.2)" : "0 1px 4px rgba(43,33,24,0.04)",
                    transform: flash === item.id ? "scale(0.97)" : "scale(1)",
                    opacity: isTodayClosed ? 0.5 : 1,
                  }}>
                    <span style={{ fontSize: "28px" }}>{item.emoji}</span>
                    <span style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.2 }}>{item.name}</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                      <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px" }}>
                        {item.price > 0 ? `$${item.price.toFixed(2)}` : "FREE"}
                      </span>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.5px",
                        color: itemMargin === "FREE" ? "#6b5e50" : marginColor(itemMargin),
                        background: itemMargin === "FREE" ? "#e8e0d615" : `${marginColor(itemMargin)}15`,
                      }}>
                        {itemMargin === "FREE" ? "FREE" : `${itemMargin}%`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Landscape: Order Panel Sidebar */}
          {!isPortrait && (
            <div style={{
              width: "340px", background: "#fff", borderLeft: "1.5px solid #e8e0d6",
              display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(43,33,24,0.04)",
            }}>
              {orderPanelContent}
            </div>
          )}

          {/* Portrait: Floating order bar */}
          {isPortrait && !orderPanelOpen && (
            <button onClick={() => setOrderPanelOpen(true)} style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 45,
              padding: "16px 20px", background: "#2b2118", color: "#faf6f1",
              border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderRadius: "16px 16px 0 0", boxShadow: "0 -4px 20px rgba(43,33,24,0.15)",
            }}>
              <span style={{ fontSize: "15px", fontWeight: 600 }}>
                Current Order · {orderItemCount} item{orderItemCount !== 1 ? "s" : ""}
              </span>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px" }}>
                ${orderTotal.toFixed(2)}
              </span>
            </button>
          )}

          {/* Portrait: Backdrop */}
          {isPortrait && orderPanelOpen && (
            <div onClick={() => setOrderPanelOpen(false)} style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 49,
            }} />
          )}

          {/* Portrait: Bottom sheet */}
          {isPortrait && orderPanelOpen && (
            <div style={{
              position: "fixed", bottom: 0, left: 0, right: 0, maxHeight: "70vh",
              background: "#fff", borderRadius: "16px 16px 0 0",
              boxShadow: "0 -4px 20px rgba(43,33,24,0.15)",
              display: "flex", flexDirection: "column", zIndex: 50,
            }}>
              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 0" }}>
                <div style={{ width: "40px", height: "4px", background: "#d5cbc0", borderRadius: "2px" }} />
              </div>
              {orderPanelContent}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ MENU EDITOR ═══════════════════ */}
      {view === "menu-editor" && (
        <div style={{ flex: 1, padding: contentPad, overflowY: "auto", maxWidth: maxW }}>
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: isPortrait ? "24px" : "28px", margin: "0 0 4px" }}>Menu & Pricing</h2>
            <p style={{ color: "#9a8b7c", fontSize: "14px", margin: 0 }}>
              Edit prices and ingredient costs. Aim for 65%+ margins on drinks, 50%+ on food.
            </p>
          </div>
          {CATEGORIES.map((cat) => (
            <div key={cat} style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8b7c", marginBottom: "12px", fontWeight: 500 }}>
                {cat}
              </h3>
              {menu.filter((m) => m.category === cat).map((item) => {
                const margin = item.price > 0 ? ((item.price - item.cost) / item.price * 100).toFixed(0) : "FREE";
                const isEditing = editingItem?.id === item.id;
                return (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: isPortrait ? "10px" : "16px", padding: isPortrait ? "12px" : "14px 16px",
                    background: isEditing ? "#fff8f0" : "#fff", borderRadius: "12px", marginBottom: "8px",
                    border: isEditing ? "1.5px solid #c9a96e" : "1.5px solid #f0ebe4",
                    flexWrap: isPortrait ? "wrap" : "nowrap",
                  }}>
                    <span style={{ fontSize: "22px" }}>{item.emoji}</span>
                    {!isEditing ? (
                      <>
                        <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, minWidth: isPortrait ? "100px" : "auto" }}>{item.name}</span>
                        {!isPortrait && <span style={{ fontSize: "13px", color: "#9a8b7c", minWidth: "80px" }}>Cost: ${item.cost.toFixed(2)}</span>}
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "18px", minWidth: "65px", textAlign: "right" }}>
                          ${item.price.toFixed(2)}
                        </span>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", minWidth: "40px", textAlign: "center",
                          color: margin === "FREE" ? "#6b5e50" : marginColor(margin),
                          background: margin === "FREE" ? "#e8e0d620" : `${marginColor(margin)}15`,
                        }}>
                          {margin === "FREE" ? "FREE" : `${margin}%`}
                        </span>
                        <button onClick={() => setEditingItem({ ...item })} style={{
                          padding: "6px 12px", borderRadius: "8px", border: "1px solid #e0d5c8",
                          background: "#fff", cursor: "pointer", fontSize: "12px",
                          fontFamily: "'DM Sans', sans-serif", color: "#9a8b7c",
                        }}>Edit</button>
                      </>
                    ) : (
                      <>
                        <input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          style={{ ...inputBase, flex: 1, minWidth: "100px" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#9a8b7c" }}>Cost $</span>
                          <input type="number" step="0.05" value={editingItem.cost}
                            onChange={(e) => setEditingItem({ ...editingItem, cost: parseFloat(e.target.value) || 0 })}
                            style={{ ...inputBase, width: "65px" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#9a8b7c" }}>Price $</span>
                          <input type="number" step="0.50" value={editingItem.price}
                            onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                            style={{ ...inputBase, width: "65px" }} />
                        </div>
                        <button onClick={saveEditItem} style={{
                          padding: "6px 14px", borderRadius: "8px", border: "none",
                          background: "#2b2118", color: "#faf6f1", cursor: "pointer",
                          fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                        }}>Save</button>
                        <button onClick={() => deleteItem(item.id)} style={{
                          padding: "6px 10px", borderRadius: "8px", border: "1px solid #c1121f33",
                          background: "#fff", color: "#c1121f", cursor: "pointer",
                          fontSize: "12px", fontFamily: "'DM Sans', sans-serif",
                        }}>✕</button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ padding: "20px", background: "#fff", borderRadius: "16px", border: "1.5px dashed #d5cbc0" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 12px" }}>Add New Item</h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#9a8b7c", display: "block", marginBottom: "4px" }}>Emoji</label>
                <input value={newItem.emoji} onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
                  style={{ ...inputBase, width: "45px", fontSize: "18px", textAlign: "center" }} />
              </div>
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label style={{ fontSize: "11px", color: "#9a8b7c", display: "block", marginBottom: "4px" }}>Name</label>
                <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name" style={{ ...inputBase, width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#9a8b7c", display: "block", marginBottom: "4px" }}>Category</label>
                <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  style={{ ...inputBase, background: "#fff" }}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#9a8b7c", display: "block", marginBottom: "4px" }}>Cost ($)</label>
                <input type="number" step="0.05" value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                  placeholder="0.00" style={{ ...inputBase, width: "75px" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#9a8b7c", display: "block", marginBottom: "4px" }}>Price ($)</label>
                <input type="number" step="0.50" value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0.00" style={{ ...inputBase, width: "75px" }} />
              </div>
              <button onClick={addNewItem} style={{
                padding: "8px 20px", borderRadius: "8px", border: "none",
                background: "#2b2118", color: "#faf6f1", cursor: "pointer",
                fontSize: "14px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}>+ Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ P&L ═══════════════════ */}
      {view === "daily-summary" && (
        <div style={{ flex: 1, padding: contentPad, overflowY: "auto", maxWidth: maxW }}>
          {/* Day Selector Strip */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
            {allDayIds.map((dayId) => {
              const isToday = dayId === todayId();
              const isClosed = closedDays.some((d) => d.dayId === dayId);
              const isActive = dayId === displayDayId;
              const label = isToday
                ? `Today ${isClosed ? "(Closed)" : "(Open)"}`
                : formatDayLabel(dayId);
              return (
                <button key={dayId} onClick={() => setViewingDayId(isToday ? null : dayId)} style={{
                  padding: "8px 16px", borderRadius: "100px", whiteSpace: "nowrap", flexShrink: 0,
                  border: isActive ? "2px solid #2b2118" : "2px solid #e0d5c8",
                  background: isActive ? "#2b2118" : "transparent",
                  color: isActive ? "#faf6f1" : "#2b2118",
                  cursor: "pointer", fontSize: "13px", fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                }}>
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: isPortrait ? "24px" : "28px", margin: 0 }}>
                {isViewingToday ? "Today's P&L" : `P&L — ${formatDayLabel(displayDayId)}`}
              </h2>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {isViewingToday && !isTodayClosed && (
                <button onClick={() => setShowCloseConfirm(true)} style={{
                  padding: "10px 20px", borderRadius: "10px",
                  border: "1.5px solid #c1121f33", background: "#fff",
                  color: "#c1121f", cursor: "pointer", fontSize: "13px",
                  fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}>
                  Close Day
                </button>
              )}
              {displaySales.length > 0 && (
                <button onClick={exportOrdersCSV} style={exportBtnStyle}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#2b2118"; e.currentTarget.style.color = "#faf6f1"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2b2118"; }}
                >
                  ↓ Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: isPortrait ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "Revenue", value: `$${dailyRevenue.toFixed(2)}`, color: "#2b2118" },
              { label: "Ingredient Cost", value: `$${dailyCost.toFixed(2)}`, color: "#c1121f" },
              { label: "Gross Profit", value: `$${dailyProfit.toFixed(2)}`, color: "#2d6a4f" },
              { label: "Customers", value: uniqueCustomersDisplay, color: "#2b2118" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: "#fff", borderRadius: "16px", padding: isPortrait ? "16px" : "20px", border: "1.5px solid #f0ebe4" }}>
                <div style={{ fontSize: "12px", color: "#9a8b7c", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>{stat.label}</div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: isPortrait ? "26px" : "32px", color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Payment Breakdown */}
          {displaySales.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
              {PAYMENT_METHODS.map((method) => (
                <div key={method} style={{
                  background: "#fff", borderRadius: "12px", padding: "14px 16px",
                  border: "1.5px solid #f0ebe4", display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: PAYMENT_COLORS[method], flexShrink: 0,
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{method}</div>
                    <div style={{ fontSize: "12px", color: "#9a8b7c" }}>
                      ${paymentBreakdown[method].total.toFixed(2)} · {paymentBreakdown[method].count} order{paymentBreakdown[method].count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders List */}
          <h3 style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8b7c", marginBottom: "12px", fontWeight: 500 }}>
            Completed Orders ({displaySales.length})
          </h3>
          {displaySales.length === 0 && (
            <div style={{
              textAlign: "center", padding: "48px", color: "#b8a99a", fontSize: "14px", fontStyle: "italic",
              background: "#fff", borderRadius: "16px", border: "1.5px solid #f0ebe4",
            }}>
              {isViewingToday ? "No sales yet today. Go to Register to ring up orders." : "No sales recorded for this day."}
            </div>
          )}
          {displaySales.map((sale, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: "12px", padding: "16px 20px", marginBottom: "8px",
              border: "1.5px solid #f0ebe4", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>Order #{i + 1}</span>
                  {sale.customer && (
                    <span style={{
                      fontSize: "12px", fontWeight: 600, background: "#f0ebe4",
                      padding: "2px 10px", borderRadius: "100px", color: "#5a4a3a",
                    }}>{sale.customer}</span>
                  )}
                  {!sale.customer && (
                    <span style={{ fontSize: "12px", color: "#c9b9a8", fontStyle: "italic" }}>Walk-in</span>
                  )}
                  <span style={{
                    fontSize: "11px", fontWeight: 600,
                    background: `${PAYMENT_COLORS[sale.paymentMethod || "Cash"]}15`,
                    color: PAYMENT_COLORS[sale.paymentMethod || "Cash"],
                    padding: "2px 8px", borderRadius: "100px",
                  }}>
                    {sale.paymentMethod || "Cash"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#9a8b7c" }}>
                    {sale.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#9a8b7c", marginTop: "4px" }}>
                  {sale.items.map((it) => `${it.qty}× ${it.name}`).join(", ")}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "18px" }}>${sale.total.toFixed(2)}</div>
                <div style={{ fontSize: "11px", color: "#2d6a4f", fontWeight: 600 }}>+${(sale.total - sale.cost).toFixed(2)} profit</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════ CUSTOMERS ═══════════════════ */}
      {view === "customers" && (
        <div style={{ flex: 1, padding: contentPad, overflowY: "auto", maxWidth: maxW }}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: isPortrait ? "24px" : "28px", margin: 0 }}>Customers</h2>
              {topCustomers.length > 0 && (
                <button onClick={exportCustomersCSV} style={exportBtnStyle}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#2b2118"; e.currentTarget.style.color = "#faf6f1"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2b2118"; }}
                >
                  ↓ Export Customers CSV
                </button>
              )}
            </div>
            <p style={{ color: "#9a8b7c", fontSize: "14px", margin: 0 }}>
              {topCustomers.length > 0
                ? `${topCustomers.length} customer${topCustomers.length !== 1 ? "s" : ""} tracked across ${dailySales.filter(s => s.customer).length} orders`
                : "Customer data will appear here as you complete orders with names attached."}
            </p>
          </div>

          {topCustomers.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: "16px", border: "1.5px solid #f0ebe4",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>👤</div>
              <div style={{ fontSize: "16px", fontWeight: 500, marginBottom: "6px" }}>No customers yet</div>
              <div style={{ fontSize: "14px", color: "#9a8b7c" }}>
                Type a customer name when ringing up an order and their history will appear here.
              </div>
            </div>
          )}

          {topCustomers.length > 0 && (
            <>
              {/* Top 3 Leaderboard */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isPortrait
                  ? `repeat(${Math.min(topCustomers.length, 2)}, 1fr)`
                  : `repeat(${Math.min(topCustomers.length, 3)}, 1fr)`,
                gap: "16px", marginBottom: "28px",
              }}>
                {topCustomers.slice(0, isPortrait ? 2 : 3).map((c, i) => {
                  const faveItem = Object.entries(c.items).sort((a, b) => b[1] - a[1])[0];
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={c.name} style={{
                      background: "#fff", borderRadius: "16px", padding: isPortrait ? "16px" : "20px",
                      border: i === 0 ? "1.5px solid #c9a96e" : "1.5px solid #f0ebe4",
                      boxShadow: i === 0 ? "0 4px 16px rgba(201,169,110,0.12)" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "22px" }}>{medals[i]}</span>
                        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: isPortrait ? "18px" : "20px" }}>{c.name}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#9a8b7c" }}>Total Spent</span>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>${c.totalSpent.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#9a8b7c" }}>Visits</span>
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>{c.visits}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#9a8b7c" }}>Avg Order</span>
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>${(c.totalSpent / c.visits).toFixed(2)}</span>
                      </div>
                      {faveItem && (
                        <div style={{
                          marginTop: "8px", padding: "8px 10px", background: "#faf6f1",
                          borderRadius: "8px", fontSize: "12px", color: "#5a4a3a",
                        }}>
                          Favorite: <strong>{faveItem[0]}</strong> ({faveItem[1]}×)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Remaining customers list */}
              {topCustomers.length > (isPortrait ? 2 : 3) && (
                <>
                  <h3 style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#9a8b7c", marginBottom: "12px", fontWeight: 500 }}>
                    All Customers
                  </h3>
                  {topCustomers.slice(isPortrait ? 2 : 3).map((c) => {
                    const faveItem = Object.entries(c.items).sort((a, b) => b[1] - a[1])[0];
                    return (
                      <div key={c.name} style={{
                        background: "#fff", borderRadius: "12px", padding: "14px 20px", marginBottom: "8px",
                        border: "1.5px solid #f0ebe4", display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <div>
                          <span style={{ fontSize: "14px", fontWeight: 600 }}>{c.name}</span>
                          <span style={{ fontSize: "12px", color: "#9a8b7c", marginLeft: "10px" }}>
                            {c.visits} visit{c.visits !== 1 ? "s" : ""}
                          </span>
                          {faveItem && (
                            <span style={{ fontSize: "12px", color: "#9a8b7c", marginLeft: "10px" }}>
                              Fave: {faveItem[0]}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontSize: "13px", color: "#9a8b7c" }}>Avg ${(c.totalSpent / c.visits).toFixed(2)}</span>
                          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "16px", fontWeight: 500 }}>
                            ${c.totalSpent.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════ SETTINGS ═══════════════════ */}
      {view === "settings" && (
        <div style={{ flex: 1, padding: contentPad, overflowY: "auto", maxWidth: maxW }}>
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: isPortrait ? "24px" : "28px", margin: "0 0 4px" }}>Settings</h2>
            <p style={{ color: "#9a8b7c", fontSize: "14px", margin: 0 }}>Data management and backup</p>
          </div>

          {/* Data Summary */}
          <div style={{ display: "grid", gridTemplateColumns: isPortrait ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
            {[
              { label: "Total Sales", value: dailySales.length, color: "#2b2118" },
              { label: "Menu Items", value: menu.length, color: "#2b2118" },
              { label: "Known Customers", value: Object.keys(knownCustomers).length, color: "#2b2118" },
              { label: "Closed Days", value: closedDays.length, color: "#2b2118" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: "#fff", borderRadius: "16px", padding: isPortrait ? "16px" : "20px", border: "1.5px solid #f0ebe4" }}>
                <div style={{ fontSize: "12px", color: "#9a8b7c", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>{stat.label}</div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: isPortrait ? "26px" : "32px", color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Export */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #f0ebe4", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", margin: "0 0 6px" }}>Export Backup</h3>
            <p style={{ color: "#9a8b7c", fontSize: "14px", margin: "0 0 16px" }}>
              Download all your data (sales, menu, closed days) as a JSON file.
            </p>
            <button onClick={exportData} style={{
              ...exportBtnStyle,
            }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#2b2118"; e.currentTarget.style.color = "#faf6f1"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2b2118"; }}
            >
              ↓ Download Backup (JSON)
            </button>
          </div>

          {/* Import */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1.5px solid #f0ebe4" }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", margin: "0 0 6px" }}>Import Backup</h3>
            <p style={{ color: "#9a8b7c", fontSize: "14px", margin: "0 0 16px" }}>
              Restore from a previously exported backup file. This will replace all current data.
            </p>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current?.click()} style={{
              ...exportBtnStyle,
            }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#2b2118"; e.currentTarget.style.color = "#faf6f1"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2b2118"; }}
            >
              ↑ Choose Backup File
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODALS ═══════════════════ */}

      {/* Close Day Confirmation */}
      {showCloseConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "400px", width: "90%", fontFamily: "'DM Sans', sans-serif" }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "22px", margin: "0 0 12px" }}>Close Today?</h3>
            <p style={{ color: "#5a4a3a", fontSize: "14px", lineHeight: 1.6, margin: "0 0 8px" }}>
              This marks today as closed. You won't be able to add more sales for today.
            </p>
            <p style={{ color: "#9a8b7c", fontSize: "13px", margin: "0 0 20px" }}>
              {displaySales.length} order{displaySales.length !== 1 ? "s" : ""} · ${dailyRevenue.toFixed(2)} revenue · ${dailyProfit.toFixed(2)} profit
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowCloseConfirm(false)} style={{
                flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid #e0d5c8",
                background: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", color: "#2b2118",
              }}>Cancel</button>
              <button onClick={closeDay} style={{
                flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                background: "#c1121f", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
              }}>Close Day</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Confirmation */}
      {importData && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "90%", fontFamily: "'DM Sans', sans-serif" }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "22px", margin: "0 0 12px" }}>Import Backup?</h3>
            <p style={{ color: "#5a4a3a", fontSize: "14px", lineHeight: 1.6, margin: "0 0 16px" }}>
              This will <strong>replace all current data</strong> with:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Sales", value: importData.sales?.length || 0 },
                { label: "Menu Items", value: importData.menu?.length || 0 },
                { label: "Closed Days", value: importData.closedDays?.length || 0 },
              ].map((s) => (
                <div key={s.label} style={{ background: "#faf6f1", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "24px" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#9a8b7c", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {importData.exportedAt && (
              <p style={{ color: "#9a8b7c", fontSize: "12px", margin: "0 0 20px" }}>
                Exported: {new Date(importData.exportedAt).toLocaleString()}
              </p>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setImportData(null)} style={{
                flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid #e0d5c8",
                background: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", color: "#2b2118",
              }}>Cancel</button>
              <button onClick={confirmImport} style={{
                flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                background: "#2b2118", color: "#faf6f1", cursor: "pointer", fontSize: "14px", fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
              }}>Replace All Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
