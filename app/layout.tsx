import "./css/style.css";
import { Inter } from "next/font/google";
import Theme from "../contexts/theme-provider";
import AppProvider from "../contexts/app-provider";
import { ChatsProvider } from "../contexts/chats-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "What's Next Life Coach",
  description: "What's Next Life Coach",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning: https://github.com/vercel/next.js/issues/44343 */}
      <body
        className={`${inter.variable} font-inter antialiased bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400`}
      >
        <Theme>
          <AppProvider>
            <ChatsProvider>{children}</ChatsProvider>
          </AppProvider>
        </Theme>
      </body>
    </html>
  );
}
