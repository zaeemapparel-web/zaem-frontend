"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Store,
  Truck,
  CreditCard,
  Bell,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Check,
  Loader2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Building2,
  DollarSign,
  Clock,
  Package,
  Zap,
  MessageCircle,
  Wifi,
  Hash,
  Info,
  ChevronRight,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

// ==================== TYPES ====================
interface Settings {
  // Store Info
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCity: string;

  // Shipping
  freeShippingThreshold: number;
  standardShipping: number;
  expressShipping: number;
  deliveryTime: string;
  expressDeliveryTime: string;

  // Payments
  codEnabled: boolean;
  jazzcashEnabled: boolean;
  easypaisaEnabled: boolean;
  cardEnabled: boolean;
  bankTransferEnabled: boolean;

  // Notifications
  orderEmailNotifications: boolean;
  orderWhatsappNotifications: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
  reviewNotifications: boolean;
  newsletterNotifications: boolean;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;

  // Analytics
  googleAnalyticsId: string;
  metaPixelId: string;
}

// ==================== DEFAULT VALUES ====================
const DEFAULT_SETTINGS: Settings = {
  storeName: "ZAEM",
  storeEmail: "zaemlifestyle@gmail.com",
  storePhone: "+92 319 3773788",
  storeAddress: "Lahore",
  storeCity: "Punjab, Pakistan",

  freeShippingThreshold: 5000,
  standardShipping: 250,
  expressShipping: 500,
  deliveryTime: "3-5 business days",
  expressDeliveryTime: "1-2 business days",

  codEnabled: true,
  jazzcashEnabled: true,
  easypaisaEnabled: true,
  cardEnabled: true,
  bankTransferEnabled: false,

  orderEmailNotifications: true,
  orderWhatsappNotifications: true,
  lowStockAlert: true,
  lowStockThreshold: 5,
  reviewNotifications: true,
  newsletterNotifications: false,

  metaTitle: "ZAEM — Style. Redefined.",
  metaDescription:
    "Premium clothing, perfumes, and bags — considered design, crafted for the discerning.",
  metaKeywords: "premium fashion, luxury clothing, perfumes, bags, Pakistan",

  googleAnalyticsId: "",
  metaPixelId: "",
};

// ==================== STORAGE KEY ====================
const STORAGE_KEY = "zaem_admin_settings";

// ==================== MAIN COMPONENT ====================
export default function AdminSettingsPage() {
  const { loadFromStorage, user } = useAuthStore();

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("store");
  const [copied, setCopied] = useState<string | null>(null);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
    // Load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (err) {
      console.error(err);
    }
  }, [loadFromStorage]);

  // ==================== UPDATE ====================
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== COPY ====================
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast("success", `${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  // ==================== SAVE ====================
  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      showToast("success", "Settings saved successfully");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // ==================== RESET ====================
  const handleReset = () => {
    if (!confirm("Reset all settings to default values?")) return;
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    showToast("success", "Settings reset to defaults");
  };

  // ==================== TABS ====================
  const TABS = [
    { id: "store", label: "Store", icon: Store },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "admin", label: "Admin", icon: Shield },
  ];

  // ==================== RENDER ====================
  return (
    <div className="admin-fade-in">

      {/* ==================== TOAST ==================== */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-lg shadow-lg border-l-2 admin-fade-in ${
            toast.type === "success"
              ? "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]"
              : "bg-[#FFEBEE] border-[#C62828] text-[#C62828]"
          }`}
        >
          <p className="text-[13px] font-medium">{toast.message}</p>
        </div>
      )}

      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
            Configure
          </p>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
            Settings
          </h1>
          <p className="text-[#6E6E73] dark:text-[#98989D] font-body text-sm">
            Manage your store preferences and configuration
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="admin-btn admin-btn-secondary"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn-primary disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================== MAIN LAYOUT ==================== */}
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">

        {/* ==================== TABS SIDEBAR ==================== */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="admin-card p-2 flex lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap lg:whitespace-normal lg:w-full shrink-0 lg:shrink ${
                    isActive
                      ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]"
                      : "text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================== CONTENT ==================== */}
        <div className="space-y-6 min-w-0">

          {/* ==================== STORE INFO ==================== */}
          {activeTab === "store" && (
            <div className="admin-card p-6 admin-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center">
                  <Store className="w-5 h-5 text-[#0A84FF]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#1D1D1F] dark:text-white">
                    Store Information
                  </h2>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Basic details about your store
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label flex items-center gap-1.5">
                      <Store className="w-3 h-3" strokeWidth={2} />
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => update("storeName", e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label flex items-center gap-1.5">
                      <Mail className="w-3 h-3" strokeWidth={2} />
                      Store Email
                    </label>
                    <input
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => update("storeEmail", e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label flex items-center gap-1.5">
                      <Phone className="w-3 h-3" strokeWidth={2} />
                      Store Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.storePhone}
                      onChange={(e) => update("storePhone", e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" strokeWidth={2} />
                      City
                    </label>
                    <input
                      type="text"
                      value={settings.storeAddress}
                      onChange={(e) => update("storeAddress", e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" strokeWidth={2} />
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={settings.storeCity}
                    onChange={(e) => update("storeCity", e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================== SHIPPING ==================== */}
          {activeTab === "shipping" && (
            <div className="admin-card p-6 admin-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#2E7D32]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#1D1D1F] dark:text-white">
                    Shipping
                  </h2>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Configure shipping rates and delivery options
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="admin-label">Free Shipping Above (Rs.)</label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        update("freeShippingThreshold", parseInt(e.target.value) || 0)
                      }
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Standard Shipping (Rs.)</label>
                    <input
                      type="number"
                      value={settings.standardShipping}
                      onChange={(e) =>
                        update("standardShipping", parseInt(e.target.value) || 0)
                      }
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Express Shipping (Rs.)</label>
                    <input
                      type="number"
                      value={settings.expressShipping}
                      onChange={(e) =>
                        update("expressShipping", parseInt(e.target.value) || 0)
                      }
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label flex items-center gap-1.5">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      Standard Delivery Time
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryTime}
                      onChange={(e) => update("deliveryTime", e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label flex items-center gap-1.5">
                      <Zap className="w-3 h-3" strokeWidth={2} />
                      Express Delivery Time
                    </label>
                    <input
                      type="text"
                      value={settings.expressDeliveryTime}
                      onChange={(e) =>
                        update("expressDeliveryTime", e.target.value)
                      }
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PAYMENTS ==================== */}
          {activeTab === "payments" && (
            <div className="admin-card p-6 admin-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                <div className="w-10 h-10 rounded-lg bg-[#F3E5F5] flex items-center justify-center">
                  <CreditCard
                    className="w-5 h-5 text-[#7B1FA2]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#1D1D1F] dark:text-white">
                    Payment Methods
                  </h2>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Enable or disable payment options
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: "codEnabled",
                    label: "Cash on Delivery",
                    desc: "Customer pays when order is delivered",
                    color: "bg-[#E8F5E9]",
                    accent: "text-[#2E7D32]",
                  },
                  {
                    key: "jazzcashEnabled",
                    label: "JazzCash",
                    desc: "Mobile wallet payment via JazzCash",
                    color: "bg-[#FFF3E0]",
                    accent: "text-[#E65100]",
                  },
                  {
                    key: "easypaisaEnabled",
                    label: "Easypaisa",
                    desc: "Mobile wallet payment via Easypaisa",
                    color: "bg-[#E8F5E9]",
                    accent: "text-[#2E7D32]",
                  },
                  {
                    key: "cardEnabled",
                    label: "Credit / Debit Card",
                    desc: "Visa, Mastercard, and other cards",
                    color: "bg-[#E3F2FD]",
                    accent: "text-[#0A84FF]",
                  },
                  {
                    key: "bankTransferEnabled",
                    label: "Bank Transfer",
                    desc: "Direct bank account transfer",
                    color: "bg-[#F3E5F5]",
                    accent: "text-[#7B1FA2]",
                  },
                ].map((method) => (
                  <label
                    key={method.key}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A] hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center shrink-0`}
                      >
                        <CreditCard
                          className={`w-4 h-4 ${method.accent}`}
                          strokeWidth={2}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                          {method.label}
                        </p>
                        <p className="text-[11px] text-[#86868B] mt-0.5">
                          {method.desc}
                        </p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          method.key as keyof Settings,
                          !settings[method.key as keyof Settings]
                        )
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                        settings[method.key as keyof Settings]
                          ? "bg-[#2E7D32]"
                          : "bg-[#D2D2D7] dark:bg-[#48484A]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          settings[method.key as keyof Settings]
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ==================== NOTIFICATIONS ==================== */}
          {activeTab === "notifications" && (
            <div className="admin-card p-6 admin-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] flex items-center justify-center">
                  <Bell
                    className="w-5 h-5 text-[#E65100]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#1D1D1F] dark:text-white">
                    Notifications
                  </h2>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Choose when you want to be notified
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: "orderEmailNotifications",
                    label: "Order Email Notifications",
                    desc: "Receive email when new order is placed",
                    icon: Mail,
                    color: "bg-[#E3F2FD]",
                    accent: "text-[#0A84FF]",
                  },
                  {
                    key: "orderWhatsappNotifications",
                    label: "Order WhatsApp Notifications",
                    desc: "Receive WhatsApp message for new orders",
                    icon: MessageCircle,
                    color: "bg-[#E8F5E9]",
                    accent: "text-[#25D366]",
                  },
                  {
                    key: "lowStockAlert",
                    label: "Low Stock Alerts",
                    desc: `Alert when product stock is below ${settings.lowStockThreshold} units`,
                    icon: AlertCircle,
                    color: "bg-[#FFF3E0]",
                    accent: "text-[#E65100]",
                  },
                  {
                    key: "reviewNotifications",
                    label: "Review Notifications",
                    desc: "Get notified when customer leaves a review",
                    icon: CheckCircle,
                    color: "bg-[#F3E5F5]",
                    accent: "text-[#7B1FA2]",
                  },
                  {
                    key: "newsletterNotifications",
                    label: "Newsletter Notifications",
                    desc: "Notify when new subscriber joins",
                    icon: Bell,
                    color: "bg-[#FCE4EC]",
                    accent: "text-[#C2185B]",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A] hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}
                        >
                          <Icon
                            className={`w-4 h-4 ${item.accent}`}
                            strokeWidth={2}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-[#86868B] mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          update(
                            item.key as keyof Settings,
                            !settings[item.key as keyof Settings]
                          )
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                          settings[item.key as keyof Settings]
                            ? "bg-[#2E7D32]"
                            : "bg-[#D2D2D7] dark:bg-[#48484A]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                            settings[item.key as keyof Settings]
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </label>
                  );
                })}
              </div>

              {/* Low Stock Threshold */}
              <div className="mt-5 pt-5 border-t border-[#E5E5E7] dark:border-[#38383A]">
                <label className="admin-label flex items-center gap-1.5">
                  <Package className="w-3 h-3" strokeWidth={2} />
                  Low Stock Threshold (units)
                </label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) =>
                    update("lowStockThreshold", parseInt(e.target.value) || 0)
                  }
                  className="admin-input max-w-xs"
                />
              </div>
            </div>
          )}

          {/* ==================== SEO ==================== */}
          {activeTab === "seo" && (
            <div className="admin-card p-6 admin-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                <div className="w-10 h-10 rounded-lg bg-[#E0F7FA] flex items-center justify-center">
                  <Globe
                    className="w-5 h-5 text-[#00838F]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[#1D1D1F] dark:text-white">
                    SEO & Analytics
                  </h2>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Search engine optimization & tracking
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="admin-label">Meta Title</label>
                  <input
                    type="text"
                    value={settings.metaTitle}
                    onChange={(e) => update("metaTitle", e.target.value)}
                    className="admin-input"
                    maxLength={60}
                  />
                  <p className="text-[10px] text-[#86868B] mt-1.5">
                    {settings.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="admin-label">Meta Description</label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) => update("metaDescription", e.target.value)}
                    rows={3}
                    className="admin-input resize-none"
                    maxLength={160}
                  />
                  <p className="text-[10px] text-[#86868B] mt-1.5">
                    {settings.metaDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="admin-label">Meta Keywords</label>
                  <input
                    type="text"
                    value={settings.metaKeywords}
                    onChange={(e) => update("metaKeywords", e.target.value)}
                    className="admin-input"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-[10px] text-[#86868B] mt-1.5">
                    Comma-separated keywords
                  </p>
                </div>

                <div className="pt-5 border-t border-[#E5E5E7] dark:border-[#38383A]">
                  <h3 className="text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white mb-4">
                    Analytics
                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="admin-label flex items-center gap-1.5">
                        <Hash className="w-3 h-3" strokeWidth={2} />
                        Google Analytics ID
                      </label>
                      <input
                        type="text"
                        value={settings.googleAnalyticsId}
                        onChange={(e) =>
                          update("googleAnalyticsId", e.target.value)
                        }
                        className="admin-input"
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="admin-label flex items-center gap-1.5">
                        <Hash className="w-3 h-3" strokeWidth={2} />
                        Meta Pixel ID
                      </label>
                      <input
                        type="text"
                        value={settings.metaPixelId}
                        onChange={(e) => update("metaPixelId", e.target.value)}
                        className="admin-input"
                        placeholder="1234567890123456"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="pt-5 border-t border-[#E5E5E7] dark:border-[#38383A]">
                  <h3 className="text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white mb-4">
                    Google Preview
                  </h3>
                  <div className="p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A]">
                    <p className="text-[#0A84FF] text-[15px] mb-1 line-clamp-1">
                      {settings.metaTitle || "Your Store Title"}
                    </p>
                    <p className="text-[#2E7D32] text-[11px] mb-1">
                      zaemstore.com
                    </p>
                    <p className="text-[#6E6E73] dark:text-[#98989D] text-[12px] line-clamp-2">
                      {settings.metaDescription || "Your meta description"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ADMIN ==================== */}
          {activeTab === "admin" && (
            <div className="space-y-6 admin-fade-in">

              {/* Current Admin */}
              <div className="admin-card p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                  <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center">
                    <Shield
                      className="w-5 h-5 text-[#6E6E73]"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-[#1D1D1F] dark:text-white">
                      Admin Account
                    </h2>
                    <p className="text-[11px] text-[#86868B] mt-0.5">
                      Your current admin credentials
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-3 h-3 text-[#86868B]" strokeWidth={2} />
                      <p className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium">
                        Signed In As
                      </p>
                    </div>
                    <p className="font-display text-lg text-[#1D1D1F] dark:text-white">
                      {user?.name || "Admin"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-3 h-3 text-[#86868B]" strokeWidth={2} />
                      <p className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium">
                        Email Address
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate">
                        {user?.email || "admin@zaem.com"}
                      </p>
                      {user?.email && (
                        <button
                          onClick={() =>
                            copyToClipboard(user.email!, "Email")
                          }
                          className="p-1.5 rounded-md hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors shrink-0"
                        >
                          {copied === "Email" ? (
                            <Check
                              className="w-3.5 h-3.5 text-[#2E7D32]"
                              strokeWidth={2}
                            />
                          ) : (
                            <Copy
                              className="w-3.5 h-3.5 text-[#86868B]"
                              strokeWidth={2}
                            />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="admin-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-[#E65100]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg text-[#1D1D1F] dark:text-white mb-2">
                      Security
                    </h3>
                    <p className="text-[12px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed mb-4">
                      Your account is secured with JWT authentication. To
                      change your password, contact the developer or use the
                      password reset feature.
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px] text-[#2E7D32]">
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>JWT Authentication enabled</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#2E7D32]">
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Password encrypted with bcrypt</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#2E7D32]">
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Role-based access control</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}