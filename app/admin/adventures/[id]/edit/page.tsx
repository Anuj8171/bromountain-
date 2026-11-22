import { checkAdminSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdventureFormClient from "@/components/admin/AdventureFormClient";
import { getAdventureById, getAdminStats, getSections } from "@/lib/data";

export const metadata = { title: "Edit Adventure | BroMountain Admin" };

export default async function EditAdventurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const { id } = await params;

  const [adventure, stats , sections] = await Promise.all([
    getAdventureById(id),
    getAdminStats(),
    getSections(),

  ]);

  if (!adventure) notFound();

  return (
    <AdminShell
      pendingBookings={stats.pendingBookings}
      pendingReviews={stats.pendingReviews}
    >
      <AdventureFormClient mode="edit" adventure={adventure} sections={sections} />
    </AdminShell>
  );
}