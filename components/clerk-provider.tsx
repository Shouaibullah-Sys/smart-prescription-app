"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { faIR } from "@clerk/localizations";

export function ClerkProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      localization={faIR}
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#ffffff",
          colorInputBackground: "#f9fafb",
          colorText: "#1f2937",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
