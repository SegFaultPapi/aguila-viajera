import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Chatbot } from "@/components/Chatbot";
import { Toaster } from "@/components/Toaster";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster />
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28 sm:py-8 sm:pb-28">
        {children}
      </main>
      <BottomNav />
      <Chatbot />
    </>
  );
}
