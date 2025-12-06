import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeAPI, Resume } from '@/services/api';
import { toast } from 'sonner';

export const useResumes = () => {
  const queryClient = useQueryClient();

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      return await resumeAPI.getAll();
    },
  });

  const createResume = useMutation({
    mutationFn: async (title: string) => {
      return await resumeAPI.create(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume created successfully');
    },
    onError: () => {
      toast.error('Failed to create resume');
    },
  });

  const updateResume = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Resume> }) => {
      return await resumeAPI.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      // toast.success('Resume updated successfully'); // Removing toast for every keystroke update to avoid spam
    },
    onError: () => {
      toast.error('Failed to update resume');
    },
  });

  const deleteResume = useMutation({
    mutationFn: async (id: string) => {
      await resumeAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete resume');
    },
  });

  return {
    resumes,
    isLoading,
    createResume,
    updateResume,
    deleteResume,
  };
};

export type { Resume };
