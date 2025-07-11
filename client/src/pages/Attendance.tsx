import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Save, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Subject, User, Attendance } from '@shared/schema';

export default function AttendancePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/subjects'],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user?.role === 'teacher') {
        params.append('teacherEmail', user.email);
      } else if (user?.role === 'student' && user.branchId) {
        params.append('branchId', user.branchId.toString());
      }
      
      const response = await fetch(`/api/subjects?${params}`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['/api/users', 'student', selectedSubject],
    queryFn: async () => {
      if (!selectedSubject) return [];
      
      // Get the subject to find its branch
      const subject = subjects.find((s: Subject) => s.id === selectedSubject);
      if (!subject) return [];
      
      const response = await fetch(`/api/users?role=student&branchId=${subject.branchId}`);
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    enabled: !!selectedSubject && user?.role === 'teacher',
  });

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ['/api/attendance', selectedDate, selectedSubject],
    queryFn: async () => {
      if (!selectedSubject || !selectedDate) return [];
      
      const response = await fetch(`/api/attendance?date=${selectedDate}&subjectId=${selectedSubject}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
    enabled: !!selectedSubject && !!selectedDate,
  });

  const { data: myAttendance = [] } = useQuery({
    queryKey: ['/api/attendance', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const response = await fetch(`/api/attendance?studentEmail=${user.email}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
    enabled: user?.role === 'student',
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecords: any[]) => {
      const response = await apiRequest('POST', '/api/attendance', attendanceRecords);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Attendance saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      setAttendanceData({});
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to save attendance',
        variant: 'destructive',
      });
    },
  });

  // Initialize attendance data when existing attendance is loaded
  useState(() => {
    if (existingAttendance.length > 0) {
      const initialData: Record<string, boolean> = {};
      existingAttendance.forEach((record: Attendance) => {
        initialData[record.studentEmail] = record.present;
      });
      setAttendanceData(initialData);
    }
  }, [existingAttendance]);

  const handleAttendanceChange = (studentEmail: string, present: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentEmail]: present,
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedSubject || !selectedDate) return;

    const attendanceRecords = Object.entries(attendanceData).map(([studentEmail, present]) => ({
      date: new Date(selectedDate).toISOString(),
      studentEmail,
      subjectId: selectedSubject,
      present,
    }));

    saveAttendanceMutation.mutate(attendanceRecords);
  };

  const getAttendanceStats = () => {
    if (user?.role === 'student') {
      const totalClasses = myAttendance.length;
      const presentClasses = myAttendance.filter((a: Attendance) => a.present).length;
      const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
      
      return {
        total: totalClasses,
        present: presentClasses,
        absent: totalClasses - presentClasses,
        percentage: percentage.toFixed(1),
      };
    }
    
    return null;
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('nav.attendance')}</h2>
        <p className="text-gray-600 mt-1">
          {user?.role === 'teacher' 
            ? t('attendance.mark_attendance')
            : 'View your attendance records'
          }
        </p>
      </div>

      {user?.role === 'teacher' ? (
        /* Teacher View - Mark Attendance */
        <div className="space-y-6">
          {/* Subject and Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Subject and Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">{t('attendance.subject')}</Label>
                  <Select value={selectedSubject?.toString()} onValueChange={(value) => setSelectedSubject(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: Subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">{t('attendance.date')}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          {selectedSubject && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('attendance.student_list')}</CardTitle>
                  <Button 
                    onClick={handleSaveAttendance}
                    disabled={saveAttendanceMutation.isPending || Object.keys(attendanceData).length === 0}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveAttendanceMutation.isPending ? t('common.loading') : t('attendance.save_attendance')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {students.map((student: User) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                      <RadioGroup
                        value={attendanceData[student.email] !== undefined ? (attendanceData[student.email] ? 'present' : 'absent') : ''}
                        onValueChange={(value) => handleAttendanceChange(student.email, value === 'present')}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="present" id={`present-${student.id}`} />
                          <Label htmlFor={`present-${student.id}`} className="text-sm text-green-600">
                            {t('attendance.present')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                          <Label htmlFor={`absent-${student.id}`} className="text-sm text-red-600">
                            {t('attendance.absent')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Student View - View Attendance */
        <div className="space-y-6">
          {/* Attendance Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Classes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        parseFloat(stats.percentage) >= 75 ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Percentage</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.percentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myAttendance.slice(0, 10).map((record: Attendance) => {
                  const subject = subjects.find((s: Subject) => s.id === record.subjectId);
                  
                  return (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{subject?.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={record.present ? 'default' : 'destructive'}>
                        {record.present ? t('attendance.present') : t('attendance.absent')}
                      </Badge>
                    </div>
                  );
                })}
                
                {myAttendance.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
