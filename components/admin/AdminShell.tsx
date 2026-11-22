import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
  pendingBookings = 0,
  pendingReviews = 0,
}: {
  children: React.ReactNode;
  pendingBookings?: number;
  pendingReviews?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        // Transparent so the site-wide mountain backdrop stays visible
        // behind the admin panels (see .site-backdrop in globals.css).
        background: "transparent",
      }}
    >
      <AdminSidebar
        pendingBookings={pendingBookings}
        pendingReviews={pendingReviews}
      />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflowX: "clip",
          paddingTop: 0,
          paddingBottom: "2rem",
        }}
        className="admin-main"
      >
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-main { padding-top: 60px !important; }
        }
      `}</style>
    </div>
  );
}