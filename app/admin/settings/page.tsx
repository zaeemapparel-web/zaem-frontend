"use client";

import { useEffect, useState } from "react";
import { Save, Store, Truck, CreditCard, Bell, Shield, Globe } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

export default function AdminSettingsPage() {
  const { loadFromStorage, user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [settings, setSettings] = useState({
    // Store Info
    storeName: "ZAEM",
    storeEmail: "zaemlifestyle@gmail.com",
    storePhone: "+92 319 3773788",
    storeAddress: "Lahore, Pakistan",

    // Shipping
    freeShippingThreshold: 5000,
    standardShipping: 250,
    deliveryTime: "3-5 business days",

    // Payments
    codEnabled: true,
    jazzcashEnabled: true,
    easypaisaEnabled: true,
    cardEnabled: true,

    // Notifications
    orderEmailNotifications: true,
    orderWhatsappNotifications: true,
    lowStockAlert: true,

    // SEO
    metaTitle: "ZAEM — Style. Redefined.",
    metaDescription:
      "Premium clothing, perfumes, and bags — considered design, crafted for the discerning.",
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const update = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    // Simulate save (in real app, this would save to backend)
    setTimeout(() => {
      setSaving(false);
      setMessage({ type: "success", text: "Settings saved successfully" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }, 800);
  };

  return (
    <div>

      {/* Header */}
      <div className="mb-10">
        <p className="text-label text-gold mb-3">Configure</p>
        <h1 className="display-lg mb-3">Settings</h1>
        <p className="text-muted font-body text-sm">
          Manage your store preferences and configuration.
        </p>
      </div>

      {message.text && (
        <div className="mb-6 p-4 bg-gold/10 border-l-2 border-gold text-sm font-body text-gold">
          {message.text}
        </div>
      )}

      <div className="max-w-4xl space-y-6">

        {/* Store Info */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Store className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Store Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-label text-muted block mb-3">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => update("storeName", e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
            <div>
              <label className="text-label text-muted block mb-3">
                Store Email
              </label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => update("storeEmail", e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
            <div>
              <label className="text-label text-muted block mb-3">
                Store Phone
              </label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => update("storePhone", e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
            <div>
              <label className="text-label text-muted block mb-3">
                Store Address
              </label>
              <input
                type="text"
                value={settings.storeAddress}
                onChange={(e) => update("storeAddress", e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Shipping</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-label text-muted block mb-3">
                Free Shipping Threshold (PKR)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  update("freeShippingThreshold", parseInt(e.target.value))
                }
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
            <div>
              <label className="text-label text-muted block mb-3">
                Standard Shipping (PKR)
              </label>
              <input
                type="number"
                value={settings.standardShipping}
                onChange={(e) =>
                  update("standardShipping", parseInt(e.target.value))
                }
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-label text-muted block mb-3">
              Delivery Time
            </label>
            <input
              type="text"
              value={settings.deliveryTime}
              onChange={(e) => update("deliveryTime", e.target.value)}
              className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
            />
          </div>
        </div>

        {/* Payments */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Payment Methods</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: "codEnabled", label: "Cash on Delivery (COD)" },
              { key: "jazzcashEnabled", label: "JazzCash" },
              { key: "easypaisaEnabled", label: "Easypaisa" },
              { key: "cardEnabled", label: "Credit / Debit Card" },
            ].map((method) => (
              <label
                key={method.key}
                className="flex items-center justify-between py-3 border-b border-ink/10 cursor-pointer"
              >
                <span className="font-body text-sm">{method.label}</span>
                <input
                  type="checkbox"
                  checked={settings[method.key as keyof typeof settings] as boolean}
                  onChange={(e) => update(method.key, e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                key: "orderEmailNotifications",
                label: "Email notifications for new orders",
              },
              {
                key: "orderWhatsappNotifications",
                label: "WhatsApp notifications for new orders",
              },
              {
                key: "lowStockAlert",
                label: "Low stock alerts",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between py-3 border-b border-ink/10 cursor-pointer"
              >
                <span className="font-body text-sm">{item.label}</span>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={(e) => update(item.key, e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
              </label>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <h2 className="font-display text-xl">SEO</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-label text-muted block mb-3">
                Meta Title
              </label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => update("metaTitle", e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>

            <div>
              <label className="text-label text-muted block mb-3">
                Meta Description
              </label>
              <textarea
                value={settings.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                rows={3}
                className="w-full bg-transparent border border-ink/20 focus:border-gold outline-none p-4 text-sm font-body transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Admin Account</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-label text-muted mb-2">Signed in as</p>
              <p className="font-display text-lg">{user?.name}</p>
            </div>
            <div>
              <p className="text-label text-muted mb-2">Email</p>
              <p className="font-body text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 pt-4 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" strokeWidth={1.5} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </div>

    </div>
  );
}