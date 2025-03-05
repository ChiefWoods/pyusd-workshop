import { Toaster } from "@/components/ui/sonner";
import SolanaProvider from "./SolanaProvider";
import { UnifiedWalletButton } from "@jup-ag/wallet-adapter";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <SolanaProvider>
      <header className="p-6 flex justify-end items-center">
        <UnifiedWalletButton />
      </header>
      <main className="p-6">
        <Outlet />
      </main>
      <Toaster richColors closeButton />
    </SolanaProvider>
  );
}
