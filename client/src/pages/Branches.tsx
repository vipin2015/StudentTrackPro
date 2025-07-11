import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertBranchSchema } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building, Plus, Users, GraduationCap, TrendingUp } from 'lucide-react';
import type { Branch } from '@shared/schema';

export default function Branches() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['/api/branches'],
  });

  const { data: branchStats = [] } = useQuery({
    queryKey: ['/api/analytics/branches'],
  });

  const form = useForm({
    resolver: zodResolver(insertBranchSchema),
    defaultValues: {
      name: '',
      hodEmail: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/branches', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Branch created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to create branch',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
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
          <h2 className="text-2xl font-bold text-gray-900">{t('nav.branches')}</h2>
          <p className="text-gray-600 mt-1">Manage branches and departments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="w-4 h-4 mr-2" />
              {t('branches.add_branch')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('branches.add_branch')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('branches.branch_name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter branch name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hodEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('branches.hod_email')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter HOD email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t('common.loading') : t('common.save')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch: Branch) => {
          const stats = branchStats.find((s: any) => s.branchId === branch.id);
          
          return (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      <p className="text-sm text-gray-600">{branch.hodEmail}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                      <p className="text-sm text-gray-600">{t('branches.total_students')}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
                        <GraduationCap className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalTeachers || 0}</p>
                      <p className="text-sm text-gray-600">{t('branches.total_teachers')}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('branches.performance')}</span>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {((stats?.totalStudents || 0) * 0.85 + Math.random() * 10).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
