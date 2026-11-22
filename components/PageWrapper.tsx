"use client";

import { usePathname } from "next/navigation";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main
      key={pathname}
      style={{
        animation: "pageFadeIn 0.3s ease forwards",
      }}
    >
      {children}
    </main>
  );
}