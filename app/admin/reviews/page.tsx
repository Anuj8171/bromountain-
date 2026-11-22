import { checkAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminReviewsClient from "@/components/admin/AdminReviewsClient";
import { getAllReviewsAdmin, getAdminStats } from "@/lib/data";


export const metadata = { title: "Reviews | BroMountain Admin" };

export default async function AdminReviewsPage() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) redirect("/admin/login");
  const [reviews, stats] = await Promise.all([
    getAllReviewsAdmin(),
    getAdminStats(),
  ]);
  return (
    <AdminShell  
      pendingBookings={stats.pendingBookings}
      pendingReviews={stats.pendingReviews}>
      <AdminReviewsClient initialReviews={reviews} />
    </AdminShell>
  );
}
