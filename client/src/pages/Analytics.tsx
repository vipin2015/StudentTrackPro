import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Building, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BookOpen, 
  Award, 
  AlertTriangle 
} from 'lucide-react';
import { useState } from 'react';
import type { Branch } from '@shared/schema';

const COLORS = ['#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#00796B'];

export default function Analytics() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const { data: branches = [] } = useQuery({
    queryKey: ['/api/branches'],
    enabled: user?.role === 'admin',
  });

  const { data: branchStats = [] } = useQuery({
    queryKey: ['/api/analytics/branches'],
    enabled: user?.role === 'admin',
  });

  const { data: attendanceStats = [] } = useQuery({
    queryKey: ['/api/analytics/attendance', selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedBranch !== 'all') {
        params.append('branchId', selectedBranch);
      }
      const response = await fetch(`/api/analytics/attendance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch attendance stats');
      return response.json();
    },
  });

  const { data: progressStats = [] } = useQuery({
    queryKey: ['/api/analytics/progress', selectedBranch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedBranch !== 'all') {
        params.append('branchId', selectedBranch);
      }
      const response = await fetch(`/api/analytics/progress?${params}`);
      if (!response.ok) throw new Error('Failed to fetch progress stats');
      return response.json();
    },
  });

  const totalStudents = branchStats.reduce((sum: number, branch: any) => sum + (branch.totalStudents || 0), 0);
  const totalTeachers = branchStats.reduce((sum: number, branch: any) => sum + (branch.totalTeachers || 0), 0);
  const totalSubjects = branchStats.reduce((sum: number, branch: any) => sum + (branch.totalSubjects || 0), 0);
  const avgAttendance = attendanceStats.length > 0 
    ? attendanceStats.reduce((sum: number, stat: any) => sum + (stat.attendanceRate || 0), 0) / attendanceStats.length
    : 0;

  const branchPerformanceData = branchStats.map((branch: any) => ({
    name: branch.branchName,
    students: branch.totalStudents || 0,
    teachers: branch.totalTeachers || 0,
    subjects: branch.totalSubjects || 0,
    performance: ((branch.totalStudents || 0) / Math.max(totalStudents, 1)) * 100,
  }));

  const attendanceData = attendanceStats.map((stat: any) => ({
    subject: stat.subjectName,
    attendance: stat.attendanceRate || 0,
    present: stat.totalPresent || 0,
    absent: stat.totalAbsent || 0,
  }));

  const progressData = progressStats.map((stat: any) => ({
    subject: stat.subjectName,
    teacherCoverage: stat.avgTeacherCoverage || 0,
    studentCoverage: stat.avgStudentCoverage || 0,
    completed: stat.completedUnits || 0,
    total: stat.totalUnits || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('nav.analytics')}</h2>
          <p className="text-gray-600 mt-1">Comprehensive analytics and performance insights</p>
        </div>
        {user?.role === 'admin' && (
          <div className="w-64">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch: Branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Overview Stats */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
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
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSubjects.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{avgAttendance.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch Performance Chart */}
            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Branch Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={branchPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#1976D2" />
                      <Bar dataKey="teachers" fill="#388E3C" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Attendance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceData.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ subject, attendance }) => `${subject}: ${attendance.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="attendance"
                    >
                      {attendanceData.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  High Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceData
                    .filter(item => item.attendance >= 85)
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.subject}</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {item.attendance.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-yellow-600" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceData
                    .filter(item => item.attendance < 75)
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.subject}</span>
                        <Badge variant="destructive">
                          {item.attendance.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressData
                    .sort((a, b) => b.studentCoverage - a.studentCoverage)
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.subject}</span>
                        <Badge variant="secondary">
                          {item.studentCoverage.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#1976D2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.subject}</span>
                        <span className="text-sm text-gray-600">{item.attendance.toFixed(1)}%</span>
                      </div>
                      <Progress value={item.attendance} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Present: {item.present}</span>
                        <span>Absent: {item.absent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceData
                    .filter(item => item.attendance < 75)
                    .map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium text-red-900">{item.subject}</p>
                          <p className="text-sm text-red-700">
                            Low attendance: {item.attendance.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  {attendanceData.filter(item => item.attendance < 75).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No attendance alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="teacherCoverage" stroke="#1976D2" strokeWidth={2} />
                  <Line type="monotone" dataKey="studentCoverage" stroke="#388E3C" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Coverage Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium text-gray-900">{item.subject}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Teacher Coverage</span>
                          <span>{item.teacherCoverage.toFixed(1)}%</span>
                        </div>
                        <Progress value={item.teacherCoverage} className="h-2 bg-gray-200">
                          <div className="h-full bg-gray-400 rounded-full transition-all" style={{ width: `${item.teacherCoverage}%` }} />
                        </Progress>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Student Coverage</span>
                          <span>{item.studentCoverage.toFixed(1)}%</span>
                        </div>
                        <Progress value={item.studentCoverage} className="h-2 bg-gray-200">
                          <div className="h-full bg-gray-800 rounded-full transition-all" style={{ width: `${item.studentCoverage}%` }} />
                        </Progress>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unit Completion Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.subject}</p>
                        <p className="text-sm text-gray-600">
                          {item.completed} of {item.total} units completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {item.total > 0 ? ((item.completed / item.total) * 100).toFixed(0) : 0}%
                        </p>
                        <Badge variant={item.completed === item.total ? 'default' : 'secondary'}>
                          {item.completed === item.total ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {user?.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branchPerformanceData.map((branch, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{branch.name}</h4>
                        <Badge variant="secondary">{branch.performance.toFixed(1)}%</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Students</span>
                          <span>{branch.students}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Teachers</span>
                          <span>{branch.teachers}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subjects</span>
                          <span>{branch.subjects}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-900">High Performance</span>
                    </div>
                    <span className="text-green-700 font-medium">
                      {attendanceData.filter(item => item.attendance >= 85).length} subjects
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <TrendingDown className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-yellow-900">Needs Improvement</span>
                    </div>
                    <span className="text-yellow-700 font-medium">
                      {attendanceData.filter(item => item.attendance < 75).length} subjects
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-blue-900">Average Performance</span>
                    </div>
                    <span className="text-blue-700 font-medium">
                      {avgAttendance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceData.filter(item => item.attendance < 75).length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-900">Action Required</p>
                      <p className="text-sm text-red-700">
                        {attendanceData.filter(item => item.attendance < 75).length} subjects have low attendance. Consider intervention strategies.
                      </p>
                    </div>
                  )}
                  {progressData.filter(item => item.studentCoverage < 50).length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900">Progress Concern</p>
                      <p className="text-sm text-yellow-700">
                        Some subjects show low student coverage. Review teaching methodologies.
                      </p>
                    </div>
                  )}
                  {attendanceData.filter(item => item.attendance >= 85).length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900">Excellent Performance</p>
                      <p className="text-sm text-green-700">
                        {attendanceData.filter(item => item.attendance >= 85).length} subjects show excellent attendance rates.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
