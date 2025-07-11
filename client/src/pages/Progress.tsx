import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, BookOpen, Clock, CheckCircle, PlayCircle, Users, Award } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import QuizModal from '@/components/QuizModal';
import type { Subject, Unit, Progress as ProgressType } from '@shared/schema';

export default function ProgressPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [coverageValue, setCoverageValue] = useState(0);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

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

  const { data: units = [] } = useQuery({
    queryKey: ['/api/units', selectedSubject],
    queryFn: async () => {
      if (!selectedSubject) return [];
      const response = await fetch(`/api/units?subjectId=${selectedSubject}`);
      if (!response.ok) throw new Error('Failed to fetch units');
      return response.json();
    },
    enabled: !!selectedSubject,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['/api/progress', selectedSubject, user?.email],
    queryFn: async () => {
      if (!selectedSubject) return [];
      const params = new URLSearchParams();
      if (user?.role === 'student') {
        params.append('studentEmail', user.email);
      }
      params.append('subjectId', selectedSubject.toString());
      
      const response = await fetch(`/api/progress?${params}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: !!selectedSubject,
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['/api/progress', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const response = await fetch(`/api/progress?studentEmail=${user.email}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: user?.role === 'student',
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { studentEmail: string; subjectId: number; unitId: number; studentCoverage: number }) => {
      const response = await apiRequest('PUT', '/api/progress/student', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Progress updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      setIsUpdateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    },
  });

  const getUnitProgress = (unitId: number) => {
    const unitProgress = progress.find((p: ProgressType) => p.unitId === unitId);
    return {
      teacherCoverage: unitProgress?.teacherCoverage || 0,
      studentCoverage: unitProgress?.studentCoverage || 0,
      quizScore: unitProgress?.quizScore || 0,
      completed: unitProgress?.completed || false,
    };
  };

  const handleUpdateProgress = () => {
    if (!selectedUnit || !selectedSubject || !user?.email) return;

    updateProgressMutation.mutate({
      studentEmail: user.email,
      subjectId: selectedSubject,
      unitId: selectedUnit,
      studentCoverage: coverageValue,
    });
  };

  const handleTakeQuiz = (unitId: number) => {
    setSelectedUnit(unitId);
    setIsQuizModalOpen(true);
  };

  const getOverallProgress = () => {
    if (allProgress.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = allProgress.filter((p: ProgressType) => p.completed).length;
    const total = allProgress.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  const overallStats = getOverallProgress();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('nav.progress')}</h2>
        <p className="text-gray-600 mt-1">
          {user?.role === 'student' 
            ? 'Track your learning progress and take quizzes'
            : 'Monitor student progress and coverage'
          }
        </p>
      </div>

      {user?.role === 'student' && (
        /* Overall Progress Stats */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.total}</p>
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
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.total - overallStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion %</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.percentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSubject?.toString()} onValueChange={(value) => setSelectedSubject(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a subject to view progress" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject: Subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Units Progress */}
      {selectedSubject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('progress.unit_progress')}</h3>
            {user?.role === 'student' && (
              <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Update Progress
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Your Progress</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="unit-select">Select Unit</Label>
                      <Select value={selectedUnit?.toString()} onValueChange={(value) => setSelectedUnit(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit: Unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                              Unit {unit.unitNo}: {unit.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="coverage-slider">Coverage Percentage: {coverageValue}%</Label>
                      <Slider
                        id="coverage-slider"
                        value={[coverageValue]}
                        onValueChange={(value) => setCoverageValue(value[0])}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                        {t('common.cancel')}
                      </Button>
                      <Button 
                        onClick={handleUpdateProgress}
                        disabled={!selectedUnit || updateProgressMutation.isPending}
                      >
                        {updateProgressMutation.isPending ? t('common.loading') : t('common.update')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {units.map((unit: Unit) => {
              const unitProgress = getUnitProgress(unit.id);
              
              return (
                <Card key={unit.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Unit {unit.unitNo}: {unit.title}</CardTitle>
                        {unit.summary && (
                          <p className="text-sm text-gray-600 mt-1">{unit.summary}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {unitProgress.completed && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t('progress.completed')}
                          </Badge>
                        )}
                        {unitProgress.quizScore > 0 && (
                          <Badge variant="secondary">
                            Score: {unitProgress.quizScore.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <ProgressBar
                        teacherCoverage={unitProgress.teacherCoverage}
                        studentCoverage={unitProgress.studentCoverage}
                      />
                      
                      {user?.role === 'student' && (
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {unitProgress.completed 
                              ? 'Unit completed successfully' 
                              : 'Take quiz to complete unit (80% required)'
                            }
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleTakeQuiz(unit.id)}
                            disabled={unitProgress.completed}
                            className="bg-primary hover:bg-primary-dark"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {unitProgress.completed ? 'Completed' : t('quiz.take_quiz')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {selectedUnit && (
        <QuizModal
          unitId={selectedUnit}
          isOpen={isQuizModalOpen}
          onClose={() => {
            setIsQuizModalOpen(false);
            setSelectedUnit(null);
          }}
        />
      )}
    </div>
  );
}
