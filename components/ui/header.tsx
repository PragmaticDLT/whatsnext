"use client";

import { useAppProvider } from "@/contexts/app-provider";

import Image from "next/image";
import Logo from "/public/images/Arrow_Blue.png";

export default function Header() {
  const { sidebarOpen, setSidebarOpen } = useAppProvider();

  return (
    <header className="sticky top-0 bg-white dark:bg-[#182235] border-b border-slate-200 dark:border-slate-700 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          <div className="flex items-center gap-2">
            <Image src={Logo} alt="What's Next Life Coach" width={30} />
            <h1
              className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-1"
              style={{ fontFamily: "Monorama" }}
            >
              What's Next Life Coach
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
