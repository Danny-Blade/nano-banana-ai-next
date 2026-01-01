import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  return (
    <main>
      <Header />
      <Suspense fallback={<div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
        <Dashboard />
      </Suspense>
      <Footer />
    </main>
  );
}
