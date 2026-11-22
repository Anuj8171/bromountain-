import { checkAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminBookingsClient from "@/components/admin/AdminBookingsClient";
import { getAllBookingsAdmin, getAdminStats } from "@/lib/data";


export const metadata = { title: "Bookings | BroMountain Admin" };

export default async function AdminBookingsPage() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) redirect("/admin/login");
   const [bookings, stats] = await Promise.all([
    getAllBookingsAdmin(),
    getAdminStats(),
  ]);
  return (
    <AdminShell 
      pendingBookings={stats.pendingBookings}
      pendingReviews={stats.pendingReviews}>
      <AdminBookingsClient initialBookings={bookings} />
    </AdminShell>
  );
}
