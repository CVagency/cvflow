import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata = {
  title: "CVFLOW — CRM Agence",
  description: "CRM de chatting Telegram pour agences — coffre média Dropp, scripts, attribution des ventes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
