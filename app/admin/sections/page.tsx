import { checkAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminSectionsClient from "@/components/admin/AdminSectionsClient";
import { getSections, getAdminStats } from "@/lib/data";

export const metadata = { title: "Sections | BroMountain Admin" };

export default async function AdminSectionsPage() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) redirect("/admin/login");
  const [sections, stats] = await Promise.all([
    getSections(),
    getAdminStats(),
  ]);
  return (
    <AdminShell
      pendingBookings={stats.pendingBookings}
      pendingReviews={stats.pendingReviews}>
      <AdminSectionsClient initialSections={sections}/>
    </AdminShell>
  );
}
