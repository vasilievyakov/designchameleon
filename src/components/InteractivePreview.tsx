"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layout,
  LayoutGrid,
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  Bell,
  Search,
  Settings,
  ChevronRight,
  Star,
  Heart,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  CreditCard,
  PieChart,
  Wallet,
  MoreHorizontal,
  Play,
  Building2,
  Briefcase,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Grid3X3,
  List,
  Plus,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DesignSystem, PreviewMode } from "@/types/design-system";

interface InteractivePreviewProps {
  designSystem: DesignSystem;
}

const previewModes: { id: PreviewMode; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "landing", label: "Landing", icon: <Layout className="w-4 h-4" /> },
  { id: "cards", label: "Cards", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "ecommerce", label: "E-commerce", icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "mobile", label: "Mobile", icon: <Smartphone className="w-4 h-4" /> },
];

export function InteractivePreview({ designSystem }: InteractivePreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("dashboard");
  const { colors, styles } = designSystem;

  const previewStyles = {
    "--preview-primary": colors.primary,
    "--preview-secondary": colors.secondary,
    "--preview-accent": colors.accent,
    "--preview-background": colors.background,
    "--preview-foreground": colors.foreground,
    "--preview-card": colors.card,
    "--preview-card-foreground": colors.cardForeground,
    "--preview-muted": colors.muted,
    "--preview-muted-foreground": colors.mutedForeground,
    "--preview-border": colors.border,
    "--preview-success": colors.success,
    "--preview-error": colors.error,
    "--preview-warning": colors.warning,
    "--preview-radius": styles.borderRadius.md,
    "--preview-radius-lg": styles.borderRadius.lg,
  } as React.CSSProperties;

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
        {previewModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === m.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Preview Container */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl overflow-hidden border border-border"
        style={previewStyles}
      >
        {mode === "dashboard" && <DashboardPreview />}
        {mode === "landing" && <LandingPreview />}
        {mode === "cards" && <CardsPreview />}
        {mode === "ecommerce" && <EcommercePreview />}
        {mode === "mobile" && <MobilePreview />}
      </motion.div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="min-h-[540px] flex" style={{ backgroundColor: "var(--preview-background)", color: "var(--preview-foreground)" }}>
      {/* Sidebar */}
      <div className="w-60 p-4 border-r flex flex-col" style={{ borderColor: "var(--preview-border)", backgroundColor: "var(--preview-card)" }}>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--preview-primary)" }}>
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-sm">Acme Inc</span>
            <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>Enterprise</p>
          </div>
        </div>
        
        <nav className="space-y-1 flex-1">
          {[
            { icon: LayoutDashboard, label: "Overview", active: true },
            { icon: BarChart3, label: "Analytics" },
            { icon: Users, label: "Customers" },
            { icon: Package, label: "Products" },
            { icon: CreditCard, label: "Transactions" },
            { icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: item.active ? "var(--preview-primary)" : "transparent",
                color: item.active ? "white" : "var(--preview-muted-foreground)",
              }}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t" style={{ borderColor: "var(--preview-border)" }}>
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: "var(--preview-secondary)" }}>
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs truncate" style={{ color: "var(--preview-muted-foreground)" }}>john@acme.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm" style={{ color: "var(--preview-muted-foreground)" }}>Monitor your business metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--preview-muted-foreground)" }} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm rounded-lg border"
                style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}
              />
            </div>
            <button className="p-2 rounded-lg border relative" style={{ borderColor: "var(--preview-border)" }}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--preview-error)" }} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Revenue", value: "$845,231", change: "+12.5%", up: true, icon: TrendingUp },
            { label: "Active Users", value: "24,521", change: "+8.2%", up: true, icon: Users },
            { label: "Total Orders", value: "12,787", change: "+23.1%", up: true, icon: ShoppingCart },
            { label: "Conversion Rate", value: "3.24%", change: "-2.4%", up: false, icon: PieChart },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-xl border h-[88px] flex flex-col justify-between"
              style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium truncate pr-2" style={{ color: "var(--preview-muted-foreground)" }}>{stat.label}</p>
                <stat.icon className="w-4 h-4 shrink-0" style={{ color: "var(--preview-muted-foreground)" }} />
              </div>
              <div>
                <span className="text-xl font-bold block">{stat.value}</span>
                <span className="text-xs font-medium inline-flex items-center gap-0.5" style={{ color: stat.up ? "var(--preview-success)" : "var(--preview-error)" }}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Chart */}
          <div className="col-span-3 p-5 rounded-xl border" style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Revenue Overview</h3>
                <p className="text-sm" style={{ color: "var(--preview-muted-foreground)" }}>Monthly revenue for 2024</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 text-xs font-medium rounded-md" style={{ backgroundColor: "var(--preview-primary)", color: "white" }}>Year</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-md" style={{ backgroundColor: "var(--preview-muted)" }}>Month</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-md" style={{ backgroundColor: "var(--preview-muted)" }}>Week</button>
              </div>
            </div>
            <div className="h-36 flex items-end justify-between px-2">
              {[45, 62, 48, 75, 58, 82, 68, 90, 72, 95, 78, 88].map((height, i) => (
                <div key={i} className="w-6 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${height}%`,
                      backgroundColor: i === 11 ? "var(--preview-primary)" : "var(--preview-muted)",
                    }}
                  />
                  <span className="text-[10px] font-medium" style={{ color: "var(--preview-muted-foreground)" }}>
                    {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-span-2 p-5 rounded-xl border" style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Activity</h3>
              <button className="text-xs font-medium" style={{ color: "var(--preview-primary)" }}>View all</button>
            </div>
            <div className="space-y-3">
              {[
                { title: "New order received", time: "2 min ago", icon: ShoppingCart, color: "var(--preview-primary)" },
                { title: "Payment processed", time: "15 min ago", icon: CreditCard, color: "var(--preview-success)" },
                { title: "New user registered", time: "1 hour ago", icon: Users, color: "var(--preview-secondary)" },
                { title: "Server maintenance", time: "3 hours ago", icon: Settings, color: "var(--preview-warning)" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--preview-muted)" }}>
                    <activity.icon className="w-4 h-4" style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPreview() {
  return (
    <div className="min-h-[540px]" style={{ backgroundColor: "var(--preview-background)", color: "var(--preview-foreground)" }}>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: "var(--preview-border)" }}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--preview-primary)" }}>
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Platform</span>
          </div>
          <div className="flex items-center gap-6">
            {["Products", "Solutions", "Resources", "Pricing"].map((item) => (
              <span key={item} className="text-sm font-medium cursor-pointer" style={{ color: "var(--preview-muted-foreground)" }}>{item}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium px-4 py-2">Sign in</button>
          <button
            className="text-sm font-medium px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--preview-primary)", color: "white" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-8 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border"
            style={{ borderColor: "var(--preview-border)", color: "var(--preview-primary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--preview-primary)" }} />
            Now available for enterprise teams
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            The modern platform for{" "}
            <span style={{ color: "var(--preview-primary)" }}>building products</span>
          </h1>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--preview-muted-foreground)" }}>
            Streamline your workflow with powerful tools designed for teams who ship fast and iterate often.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              style={{ backgroundColor: "var(--preview-primary)", color: "white" }}
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 border"
              style={{ borderColor: "var(--preview-border)" }}
            >
              <Play className="w-4 h-4" />
              Watch demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Optimized performance with sub-second response times across all operations." },
            { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with end-to-end encryption and advanced access controls." },
            { icon: Layers, title: "Seamless Integration", desc: "Connect with 100+ tools and services your team already uses daily." },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border"
              style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "var(--preview-muted)" }}>
                <feature.icon className="w-5 h-5" style={{ color: "var(--preview-primary)" }} />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--preview-muted-foreground)" }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Logos */}
        <div className="mt-16 text-center">
          <p className="text-sm mb-6" style={{ color: "var(--preview-muted-foreground)" }}>Trusted by leading companies worldwide</p>
          <div className="flex items-center justify-center gap-12">
            {[Building2, Briefcase, Layers, Shield, Zap].map((Icon, i) => (
              <Icon key={i} className="w-8 h-8" style={{ color: "var(--preview-muted-foreground)", opacity: 0.5 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardsPreview() {
  return (
    <div className="min-h-[540px] p-6" style={{ backgroundColor: "var(--preview-background)", color: "var(--preview-foreground)" }}>
      <div className="grid grid-cols-3 gap-5">
        {/* Metric Card */}
        <div className="p-5 rounded-xl border" style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--preview-muted)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: "var(--preview-primary)" }} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: "var(--preview-success)", color: "white", opacity: 0.9 }}>+24.5%</span>
          </div>
          <h3 className="text-2xl font-semibold mb-1">$128,430</h3>
          <p className="text-sm" style={{ color: "var(--preview-muted-foreground)" }}>Total revenue this month</p>
          <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--preview-border)" }}>
            <span className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>vs last month</span>
            <span className="text-xs font-medium" style={{ color: "var(--preview-success)" }}>$24,500 more</span>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-5 rounded-xl border" style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold text-white" style={{ backgroundColor: "var(--preview-secondary)" }}>
              SK
            </div>
            <div>
              <h3 className="font-semibold">Sarah Kim</h3>
              <p className="text-sm" style={{ color: "var(--preview-muted-foreground)" }}>Product Designer</p>
            </div>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--preview-muted-foreground)" }}>
            Design systems specialist with 8+ years of experience building scalable products.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: "var(--preview-muted)" }}>
              <p className="font-semibold">147</p>
              <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>Projects</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: "var(--preview-muted)" }}>
              <p className="font-semibold">12.4k</p>
              <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>Followers</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: "var(--preview-muted)" }}>
              <p className="font-semibold">892</p>
              <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>Following</p>
            </div>
          </div>
          <button className="w-full py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--preview-primary)", color: "white" }}>
            View Profile
          </button>
        </div>

        {/* Progress Card */}
        <div className="p-5 rounded-xl border" style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Project Status</h3>
            <button className="p-1.5 rounded-lg" style={{ backgroundColor: "var(--preview-muted)" }}>
              <MoreHorizontal className="w-4 h-4" style={{ color: "var(--preview-muted-foreground)" }} />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: "Design Phase", value: 100, color: "var(--preview-success)" },
              { label: "Development", value: 72, color: "var(--preview-primary)" },
              { label: "Testing", value: 45, color: "var(--preview-secondary)" },
              { label: "Deployment", value: 0, color: "var(--preview-muted-foreground)" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "var(--preview-muted)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Card */}
        <div className="p-5 rounded-xl border" style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Tasks</h3>
            <button className="p-1.5 rounded-lg" style={{ backgroundColor: "var(--preview-primary)", color: "white" }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { text: "Review design specifications", done: true },
              { text: "Update component library", done: true },
              { text: "Conduct user interviews", done: false },
              { text: "Prepare presentation deck", done: false },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: "var(--preview-muted)" }}>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: task.done ? "var(--preview-success)" : "var(--preview-border)", backgroundColor: task.done ? "var(--preview-success)" : "transparent" }}>
                  {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm flex-1 ${task.done ? "line-through" : ""}`} style={{ color: task.done ? "var(--preview-muted-foreground)" : "inherit" }}>{task.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Card */}
        <div className="p-5 rounded-xl border-l-4" style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)", borderLeftColor: "var(--preview-warning)" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--preview-warning)", opacity: 0.15 }}>
              <Bell className="w-5 h-5" style={{ color: "var(--preview-warning)" }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Scheduled Maintenance</h3>
              <p className="text-sm mb-3" style={{ color: "var(--preview-muted-foreground)" }}>
                System maintenance scheduled for Dec 15, 2024 from 2:00 AM - 4:00 AM UTC.
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ backgroundColor: "var(--preview-warning)", color: "white" }}>Learn more</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ backgroundColor: "var(--preview-muted)" }}>Dismiss</button>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div className="p-5 rounded-xl border" style={{ backgroundColor: "var(--preview-card)", borderColor: "var(--preview-border)" }}>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4"
                fill={star <= 4 ? "var(--preview-warning)" : "transparent"}
                style={{ color: "var(--preview-warning)" }}
              />
            ))}
            <span className="text-sm font-medium ml-2">4.0</span>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--preview-muted-foreground)" }}>
            "Exceptional service and attention to detail. The team delivered beyond our expectations and on schedule."
          </p>
          <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--preview-border)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ backgroundColor: "var(--preview-accent)" }}>
              MJ
            </div>
            <div>
              <p className="text-sm font-medium">Michael Johnson</p>
              <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>CTO at TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EcommercePreview() {
  return (
    <div className="min-h-[540px]" style={{ backgroundColor: "var(--preview-background)", color: "var(--preview-foreground)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--preview-border)", backgroundColor: "var(--preview-card)" }}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--preview-primary)" }}>
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Store</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            {["New Arrivals", "Collections", "Brands", "Sale"].map((item, i) => (
              <span key={item} className="cursor-pointer font-medium" style={{ color: i === 0 ? "var(--preview-foreground)" : "var(--preview-muted-foreground)" }}>{item}</span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--preview-muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-48 pl-9 pr-4 py-2 text-sm rounded-lg border"
              style={{ backgroundColor: "var(--preview-background)", borderColor: "var(--preview-border)" }}
            />
          </div>
          <button className="p-2 rounded-lg relative" style={{ backgroundColor: "var(--preview-muted)" }}>
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg relative" style={{ backgroundColor: "var(--preview-muted)" }}>
            <ShoppingCart className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white font-medium" style={{ backgroundColor: "var(--preview-primary)" }}>3</span>
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Hero */}
        <div className="relative rounded-xl p-8 mb-8 overflow-hidden" style={{ backgroundColor: "var(--preview-muted)" }}>
          <div className="relative z-10 max-w-md">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ backgroundColor: "var(--preview-primary)", color: "white" }}>Limited Edition</span>
            <h1 className="text-3xl font-bold mb-3">Winter Collection 2024</h1>
            <p className="mb-6" style={{ color: "var(--preview-muted-foreground)" }}>Discover our curated selection of premium products designed for the modern lifestyle.</p>
            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 rounded-lg font-medium" style={{ backgroundColor: "var(--preview-primary)", color: "white" }}>
                Shop Now
              </button>
              <button className="px-6 py-2.5 rounded-lg font-medium border" style={{ borderColor: "var(--preview-border)" }}>
                View Catalog
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3" style={{ background: `linear-gradient(135deg, var(--preview-primary), var(--preview-secondary))`, opacity: 0.15 }} />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: "var(--preview-border)" }}>
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="flex items-center gap-2">
              {["All", "Clothing", "Accessories", "Footwear"].map((cat, i) => (
                <button key={cat} className="px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: i === 0 ? "var(--preview-primary)" : "var(--preview-muted)", color: i === 0 ? "white" : "inherit" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg" style={{ backgroundColor: "var(--preview-primary)", color: "white" }}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg" style={{ backgroundColor: "var(--preview-muted)" }}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-4 gap-5">
          {[
            { name: "Premium Wool Coat", price: "$289", oldPrice: "$389", category: "Outerwear", badge: "Sale" },
            { name: "Classic Oxford Shirt", price: "$89", category: "Shirts", badge: "New" },
            { name: "Leather Card Holder", price: "$49", category: "Accessories" },
            { name: "Merino Wool Sweater", price: "$159", oldPrice: "$199", category: "Knitwear", badge: "Sale" },
          ].map((product, i) => (
            <div key={i} className="group rounded-xl overflow-hidden border" style={{ borderColor: "var(--preview-border)", backgroundColor: "var(--preview-card)" }}>
              <div className="aspect-[4/5] relative" style={{ backgroundColor: "var(--preview-muted)" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="w-12 h-12" style={{ color: "var(--preview-muted-foreground)", opacity: 0.3 }} />
                </div>
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded" style={{ backgroundColor: product.badge === "Sale" ? "var(--preview-error)" : "var(--preview-accent)", color: "white" }}>
                    {product.badge}
                  </span>
                )}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-4 h-4" style={{ color: "var(--preview-foreground)" }} />
                </button>
                <button className="absolute bottom-3 left-3 right-3 py-2.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "var(--preview-primary)", color: "white" }}>
                  Add to Cart
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs mb-1" style={{ color: "var(--preview-muted-foreground)" }}>{product.category}</p>
                <h3 className="font-medium mb-2">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{product.price}</span>
                  {product.oldPrice && (
                    <span className="text-sm line-through" style={{ color: "var(--preview-muted-foreground)" }}>{product.oldPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobilePreview() {
  return (
    <div className="flex justify-center py-8" style={{ backgroundColor: "var(--preview-muted)" }}>
      {/* Phone Frame */}
      <div className="w-[300px] rounded-[36px] p-2.5 shadow-2xl" style={{ backgroundColor: "var(--preview-foreground)" }}>
        <div className="rounded-[28px] overflow-hidden" style={{ backgroundColor: "var(--preview-background)" }}>
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 py-2">
            <span className="text-xs font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 flex items-end gap-[2px]">
                {[40, 60, 80, 100].map((h, i) => (
                  <div key={i} className="w-[3px] rounded-sm" style={{ height: `${h}%`, backgroundColor: "var(--preview-foreground)" }} />
                ))}
              </div>
              <div className="w-6 h-3 rounded-sm border-2 relative" style={{ borderColor: "var(--preview-foreground)" }}>
                <div className="absolute inset-0.5 rounded-sm" style={{ backgroundColor: "var(--preview-success)", width: "70%" }} />
              </div>
            </div>
          </div>

          {/* App Content */}
          <div className="px-5 pb-5" style={{ color: "var(--preview-foreground)" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>Welcome back</p>
                <h1 className="text-lg font-semibold">John Doe</h1>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: "var(--preview-primary)" }}>
                J
              </div>
            </div>

            {/* Balance Card */}
            <div className="p-5 rounded-2xl mb-5" style={{ background: `linear-gradient(135deg, var(--preview-primary), var(--preview-secondary))` }}>
              <p className="text-white/70 text-xs mb-1">Total Balance</p>
              <p className="text-white text-2xl font-bold mb-5">$24,562.00</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl bg-white/20 text-white text-xs font-medium flex items-center justify-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Send
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-white/20 text-white text-xs font-medium flex items-center justify-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Receive
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { icon: CreditCard, label: "Cards" },
                { icon: PieChart, label: "Analytics" },
                { icon: Wallet, label: "Wallet" },
                { icon: MoreHorizontal, label: "More" },
              ].map((action) => (
                <div key={action.label} className="text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-1.5" style={{ backgroundColor: "var(--preview-muted)" }}>
                    <action.icon className="w-5 h-5" style={{ color: "var(--preview-primary)" }} />
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--preview-muted-foreground)" }}>{action.label}</span>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Recent Transactions</h2>
              <span className="text-xs font-medium" style={{ color: "var(--preview-primary)" }}>See all</span>
            </div>

            <div className="space-y-2.5">
              {[
                { name: "Spotify Premium", category: "Subscription", amount: "-$9.99", icon: Play },
                { name: "Salary Deposit", category: "Income", amount: "+$4,500", icon: Briefcase, positive: true },
                { name: "Amazon", category: "Shopping", amount: "-$156.40", icon: Package },
              ].map((tx) => (
                <div key={tx.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--preview-card)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--preview-muted)" }}>
                    <tx.icon className="w-4 h-4" style={{ color: "var(--preview-primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{tx.name}</p>
                    <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>{tx.category}</p>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: tx.positive ? "var(--preview-success)" : "var(--preview-foreground)" }}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-around py-4 border-t" style={{ borderColor: "var(--preview-border)" }}>
            {[
              { icon: LayoutDashboard, active: true },
              { icon: PieChart },
              { icon: CreditCard },
              { icon: Settings },
            ].map((nav, i) => (
              <button key={i} className="p-2 rounded-xl" style={{ backgroundColor: nav.active ? "var(--preview-muted)" : "transparent" }}>
                <nav.icon className="w-5 h-5" style={{ color: nav.active ? "var(--preview-primary)" : "var(--preview-muted-foreground)" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

