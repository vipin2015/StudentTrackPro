import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertSubjectSchema, insertUnitSchema } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Book, Users, GraduationCap, FileText } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import type { Subject, Unit, Branch, User } from '@shared/schema';

export default function Subjects() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const { data: subjects = [], isLoading } = useQuery({
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

  const { data: branches = [] } = useQuery({
    queryKey: ['/api/branches'],
    enabled: user?.role === 'admin' || user?.role === 'hod',
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/users', 'teacher'],
    queryFn: async () => {
      const response = await fetch('/api/users?role=teacher');
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    },
    enabled: user?.role === 'admin' || user?.role === 'hod',
  });

  const { data: units = [] } = useQuery({
    queryKey: ['/api/units', selectedSubjectId],
    queryFn: async () => {
      if (!selectedSubjectId) return [];
      const response = await fetch(`/api/units?subjectId=${selectedSubjectId}`);
      if (!response.ok) throw new Error('Failed to fetch units');
      return response.json();
    },
    enabled: !!selectedSubjectId,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['/api/progress', selectedSubjectId],
    queryFn: async () => {
      if (!selectedSubjectId) return [];
      const params = new URLSearchParams();
      if (user?.role === 'student') {
        params.append('studentEmail', user.email);
      }
      params.append('subjectId', selectedSubjectId.toString());
      
      const response = await fetch(`/api/progress?${params}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: !!selectedSubjectId,
  });

  const subjectForm = useForm({
    resolver: zodResolver(insertSubjectSchema),
    defaultValues: {
      name: '',
      branchId: user?.branchId || 0,
      teacherEmail: '',
    },
  });

  const unitForm = useForm({
    resolver: zodResolver(insertUnitSchema),
    defaultValues: {
      subjectId: 0,
      unitNo: 1,
      title: '',
      summary: '',
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/subjects', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Subject created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      setIsSubjectDialogOpen(false);
      subjectForm.reset();
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to create subject',
        variant: 'destructive',
      });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/units', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Unit created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });
      setIsUnitDialogOpen(false);
      unitForm.reset();
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to create unit',
        variant: 'destructive',
      });
    },
  });

  const onSubjectSubmit = (data: any) => {
    createSubjectMutation.mutate(data);
  };

  const onUnitSubmit = (data: any) => {
    createUnitMutation.mutate({
      ...data,
      subjectId: selectedSubjectId,
    });
  };

  const getProgressForUnit = (unitId: number) => {
    const unitProgress = progress.find((p: any) => p.unitId === unitId);
    return {
      teacherCoverage: unitProgress?.teacherCoverage || 0,
      studentCoverage: unitProgress?.studentCoverage || 0,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('nav.subjects')}</h2>
          <p className="text-gray-600 mt-1">
            {user?.role === 'student' 
              ? 'View your subjects and track progress'
              : 'Manage subjects and syllabus'
            }
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hod') && (
          <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                {t('subjects.add_subject')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('subjects.add_subject')}</DialogTitle>
              </DialogHeader>
              <Form {...subjectForm}>
                <form onSubmit={subjectForm.handleSubmit(onSubjectSubmit)} className="space-y-4">
                  <FormField
                    control={subjectForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('subjects.subject_name')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter subject name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={subjectForm.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('subjects.branch')}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches.map((branch: Branch) => (
                              <SelectItem key={branch.id} value={branch.id.toString()}>
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={subjectForm.control}
                    name="teacherEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('subjects.teacher_assigned')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachers.map((teacher: User) => (
                              <SelectItem key={teacher.id} value={teacher.email}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createSubjectMutation.isPending}>
                      {createSubjectMutation.isPending ? t('common.loading') : t('common.save')}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject: Subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Book className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <p className="text-sm text-gray-600">{subject.teacherEmail}</p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedSubjectId(subject.id)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('subjects.units')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Units Modal/Dialog */}
      <Dialog open={!!selectedSubjectId} onOpenChange={(open) => !open && setSelectedSubjectId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{t('subjects.units')} - {subjects.find(s => s.id === selectedSubjectId)?.name}</span>
              {(user?.role === 'admin' || user?.role === 'hod' || user?.role === 'teacher') && (
                <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary-dark">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('subjects.add_unit')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('subjects.add_unit')}</DialogTitle>
                    </DialogHeader>
                    <Form {...unitForm}>
                      <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-4">
                        <FormField
                          control={unitForm.control}
                          name="unitNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Number</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={unitForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('subjects.unit_title')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter unit title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={unitForm.control}
                          name="summary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('subjects.unit_summary')}</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Enter unit summary" rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsUnitDialogOpen(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button type="submit" disabled={createUnitMutation.isPending}>
                            {createUnitMutation.isPending ? t('common.loading') : t('common.save')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {units.map((unit: Unit) => {
              const unitProgress = getProgressForUnit(unit.id);
              
              return (
                <Card key={unit.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Unit {unit.unitNo}: {unit.title}</h4>
                        {unit.summary && (
                          <p className="text-sm text-gray-600 mt-1">{unit.summary}</p>
                        )}
                      </div>
                      {user?.role === 'student' && (
                        <Badge variant={unitProgress.studentCoverage >= 80 ? 'default' : 'secondary'}>
                          {unitProgress.studentCoverage >= 80 ? t('progress.completed') : t('progress.in_progress')}
                        </Badge>
                      )}
                    </div>
                    
                    <ProgressBar
                      teacherCoverage={unitProgress.teacherCoverage}
                      studentCoverage={unitProgress.studentCoverage}
                    />
                  </CardContent>
                </Card>
              );
            })}
            
            {units.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No units found for this subject
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
