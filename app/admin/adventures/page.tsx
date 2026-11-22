import { checkAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminAdventuresClient from "@/components/admin/AdminAdventuresClient";
import { getAllAdventuresAdmin, getAdminStats, getSections } from "@/lib/data";


export const metadata = {
  title: "Adventures | BroMountain Admin",
};

export default async function AdminAdventuresPage() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const [adventures, sections, stats] = await Promise.all([
    getAllAdventuresAdmin(),
    getSections(),
    getAdminStats(),
  ]);

  return (
    <AdminShell 
      pendingBookings={stats.pendingBookings}
      pendingReviews={stats.pendingReviews}>
      <AdminAdventuresClient
      initialAdventures={adventures}
        sections={sections}
      />
    </AdminShell>
  );
}
