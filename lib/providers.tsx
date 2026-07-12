"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { StoreProvider } from "@/lib/store";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

export function Providers({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
    // Modo prototipo sin Privy configurado — StoreProvider directo
    return <StoreProvider>{children}</StoreProvider>;
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "light",
          logo: "",
          accentColor: "#0d6b4f",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "off" },
        },
      }}
    >
      <StoreProvider>{children}</StoreProvider>
    </PrivyProvider>
  );
}

/** Indica si Privy está configurado en este entorno */
export const PRIVY_ACTIVO = !!PRIVY_APP_ID;
