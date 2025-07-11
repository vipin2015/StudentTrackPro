import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <div className="min-h-screen bg-neutral-light">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />
      <div className="flex h-screen bg-neutral-light">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
