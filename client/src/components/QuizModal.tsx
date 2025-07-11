import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import type { Question, Unit } from '@shared/schema';

interface QuizModalProps {
  unitId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizModal({ unitId, isOpen, onClose }: QuizModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const { data: unit } = useQuery({
    queryKey: ['/api/units', unitId],
    queryFn: async () => {
      const response = await fetch(`/api/units/${unitId}`);
      if (!response.ok) throw new Error('Failed to fetch unit');
      return response.json() as Unit;
    },
    enabled: isOpen,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['/api/questions', unitId],
    queryFn: async () => {
      const response = await fetch(`/api/questions?unitId=${unitId}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json() as Question[];
    },
    enabled: isOpen,
  });

  const submitMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      const response = await apiRequest('POST', '/api/quiz/submit', submissionData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.completed ? t('quiz.passed') : t('quiz.failed'),
        description: `${t('quiz.score')}: ${data.score.toFixed(1)}%`,
        variant: data.completed ? 'default' : 'destructive',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      onClose();
      setAnswers({});
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: 'Failed to submit quiz',
        variant: 'destructive',
      });
    },
  });

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    if (!user) return;

    const submissionData = {
      unitId,
      studentEmail: user.email,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer,
      })),
    };

    submitMutation.mutate(submissionData);
  };

  const canSubmit = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('quiz.title')} - {unit?.title}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Unit Summary */}
          {unit?.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">{t('quiz.summary')}</h4>
              <p className="text-sm text-blue-800">{unit.summary}</p>
            </div>
          )}

          {/* Questions */}
          {questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {index + 1}. {question.question}
              </h4>
              
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${question.id}_${optionIndex}`} />
                    <Label htmlFor={`q${question.id}_${optionIndex}`} className="text-gray-700">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitMutation.isPending}
              className="bg-primary hover:bg-primary-dark"
            >
              {submitMutation.isPending ? t('common.loading') : t('quiz.submit_quiz')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
