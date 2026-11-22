import { checkAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import {
  getAdminStats,
  getRecentBookingsAdmin,
  getMonthlyBookings,
} from "@/lib/data";

export const metadata = {
  title: "Dashboard | BroMountain Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const isAdmin = await checkAdminSession(); // ✅ await
   const [stats, recentBookings, monthlyData] = await Promise.all([
    getAdminStats(),
    getRecentBookingsAdmin(4),
    getMonthlyBookings(),
  ]);

  if (!isAdmin) redirect("/admin/login");

  return (
    <AdminShell 
     pendingBookings={stats.pendingBookings}
      pendingReviews={stats.pendingReviews}>
      <AdminDashboardClient 
        stats={stats}
        recentBookings={recentBookings}
        monthlyData={monthlyData}
/>
    </AdminShell>
  );
}
