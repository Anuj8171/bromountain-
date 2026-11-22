import { checkAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminOffersClient from "@/components/admin/AdminOffersClient";
import { getAllOffersAdmin, getAdminStats } from "@/lib/data";


export const metadata = { title: "Special Offers | BroMountain Admin" };

export default async function AdminOffersPage() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) redirect("/admin/login");
  const [offers, stats] = await Promise.all([
    getAllOffersAdmin(),
    getAdminStats(),
  ]);

  return (
    <AdminShell pendingBookings={stats.pendingBookings}
      pendingReviews={stats.pendingReviews}>
      <AdminOffersClient initialOffers={offers} />
    </AdminShell>
  );
}

