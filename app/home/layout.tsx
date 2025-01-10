import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="scrollable-container" className="flex max-h-[100dvh] overflow-y-auto">
      {/* Sidebar */}
      <Sidebar />
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header />

        <main className="grow [&>*:first-child]:scroll-mt-16">{children}</main>
      </div>
    </div>
  );
}
