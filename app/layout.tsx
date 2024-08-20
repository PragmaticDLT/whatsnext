import "./css/style.css";
import { Inter } from "next/font/google";
import Theme from "./theme-provider";
import AppProvider from "./app-provider";
import SessionWrapper from "@/components/session-wrapper";
import { FlyoutProvider } from "./flyout-context";
import { ChatsProvider } from "./chats-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Pragmatic DLT Tracker",
  description: "PDLT Boilerplate for internal web-apps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionWrapper>
      <html lang="en" suppressHydrationWarning>
        {/* suppressHydrationWarning: https://github.com/vercel/next.js/issues/44343 */}
        <body
          className={`${inter.variable} font-inter antialiased bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400`}
        >
          <Theme>
            <AppProvider>
              <FlyoutProvider>
                <ChatsProvider>{children}</ChatsProvider>
              </FlyoutProvider>
            </AppProvider>
          </Theme>
        </body>
      </html>
    </SessionWrapper>
  );
}
