import { checkAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdventureFormClient from "@/components/admin/AdventureFormClient";

export const metadata = { title: "Add Adventure | BroMountain Admin" };
import {getAdminStats, getSections} from "@/lib/data";

export default async function NewAdventurePage() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) redirect("/admin/login");

    const stats = await getAdminStats();
    const sections = await getSections();

  return (
    <AdminShell pendingBookings={stats.pendingBookings} pendingReviews={stats.pendingReviews}>
      <AdventureFormClient mode="new" sections={sections} />
    </AdminShell>
  );
}
