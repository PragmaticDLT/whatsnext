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

          {/* <div className="flex">
            <button
              className="text-slate-500 hover:text-slate-600"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>
          </div> */}
        </div>
      </div>
    </header>
  );
}
