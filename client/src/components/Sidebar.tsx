import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import {
  BarChart3,
  Building,
  Users,
  Book,
  Calendar,
  TrendingUp,
  Crown,
  UserCheck,
  GraduationCap,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleIcons = {
  admin: Crown,
  hod: UserCheck,
  teacher: GraduationCap,
  student: User,
};

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();

  if (!user) return null;

  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: BarChart3, roles: ['admin', 'hod', 'teacher', 'student'] },
    { name: t('nav.branches'), href: '/branches', icon: Building, roles: ['admin'] },
    { name: t('nav.users'), href: '/users', icon: Users, roles: ['admin', 'hod'] },
    { name: t('nav.subjects'), href: '/subjects', icon: Book, roles: ['admin', 'hod', 'teacher', 'student'] },
    { name: t('nav.attendance'), href: '/attendance', icon: Calendar, roles: ['admin', 'hod', 'teacher', 'student'] },
    { name: t('nav.progress'), href: '/progress', icon: TrendingUp, roles: ['admin', 'hod', 'teacher', 'student'] },
    { name: t('nav.analytics'), href: '/analytics', icon: BarChart3, roles: ['admin', 'hod'] },
  ];

  const visibleNavigation = navigation.filter(item => item.roles.includes(user.role));
  const RoleIcon = roleIcons[user.role as keyof typeof roleIcons];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Role Badge */}
        <div className="px-4 mb-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center">
              <RoleIcon className="text-primary mr-2 w-5 h-5" />
              <span className="text-sm font-medium text-primary">{t(`role.${user.role}`)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-6 w-6',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
