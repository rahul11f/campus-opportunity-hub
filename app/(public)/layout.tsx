import { Navbar } from '@/components/shared/Navbar';
import { Sidebar } from '@/components/shared/Sidebar';
import { Footer } from '@/components/shared/Footer';

export default function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 lg:pl-[280px] flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full max-w-[1400px] mx-auto">
          {children}
        </main>
        {modal}
        <Footer />
      </div>
    </div>
  );
}