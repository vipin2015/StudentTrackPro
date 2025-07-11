import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/ProgressBar';
import { 
  Users, 
  GraduationCap, 
  Building, 
  Percent, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Calendar,
  BookOpen,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: branchStats = [] } = useQuery({
    queryKey: ['/api/analytics/branches'],
    enabled: user?.role === 'admin',
  });

  const { data: attendanceStats = [] } = useQuery({
    queryKey: ['/api/analytics/attendance'],
  });

  const { data: progressStats = [] } = useQuery({
    queryKey: ['/api/analytics/progress'],
  });

  const totalStudents = branchStats.reduce((sum: number, branch: any) => sum + (branch.totalStudents || 0), 0);
  const totalTeachers = branchStats.reduce((sum: number, branch: any) => sum + (branch.totalTeachers || 0), 0);
  const totalBranches = branchStats.length;
  const avgAttendance = attendanceStats.length > 0 
    ? attendanceStats.reduce((sum: number, stat: any) => sum + (stat.attendanceRate || 0), 0) / attendanceStats.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' 
            ? 'Overview of all branches, departments, and performance metrics'
            : 'Your personalized dashboard and activity overview'
          }
        </p>
      </div>

      {/* Stats Cards */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.total_students')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.total_teachers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTeachers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.total_branches')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBranches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.avg_attendance')}</p>
                  <p className="text-2xl font-bold text-gray-900">{avgAttendance.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Performance or Subject Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {user?.role === 'admin' ? t('dashboard.branch_performance') : 'Subject Progress'}
              </CardTitle>
              <Button variant="outline" size="sm">
                {t('common.view')} All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.role === 'admin' ? (
                // Branch performance for admin
                branchStats.slice(0, 3).map((branch: any) => (
                  <div key={branch.branchId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{branch.branchName}</p>
                        <p className="text-sm text-gray-600">{branch.totalStudents} students</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {((branch.totalStudents || 0) / Math.max(totalStudents, 1) * 100).toFixed(1)}%
                      </p>
                      <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +2.3%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Subject progress for other roles
                progressStats.slice(0, 3).map((subject: any) => (
                  <div key={subject.subjectId} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{subject.subjectName}</p>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                    </div>
                    <ProgressBar
                      teacherCoverage={subject.avgTeacherCoverage || 0}
                      studentCoverage={subject.avgStudentCoverage || 0}
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('dashboard.recent_activities')}</CardTitle>
              <Button variant="outline" size="sm">
                {t('common.view')} All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">New user registered</span> in the system
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Attendance updated</span> for today's classes
                  </p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Quiz completed</span> by students
                  </p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Low attendance</span> alert for some subjects
                  </p>
                  <p className="text-xs text-gray-500">8 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
