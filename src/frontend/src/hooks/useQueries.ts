import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { EncryptedCase, Status, Hearing } from '../backend';
import { toast } from 'sonner';

export function useGetCases() {
  const { actor, isFetching } = useActor();

  return useQuery<EncryptedCase[]>({
    queryKey: ['cases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCases();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCaseByNumber(caseNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery<EncryptedCase | null>({
    queryKey: ['case', caseNumber],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCaseByNumber(caseNumber);
    },
    enabled: !!actor && !isFetching && !!caseNumber,
  });
}

export function useAddCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCase: EncryptedCase) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCase(newCase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Case added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add case: ' + error.message);
    },
  });
}

export function useUpdateCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedCase: EncryptedCase) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCase(updatedCase);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseNumber] });
      toast.success('Case updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update case: ' + error.message);
    },
  });
}

export function useDeleteCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCase(caseNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Case deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete case: ' + error.message);
    },
  });
}

export function useUpdateStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseNumber, status }: { caseNumber: string; status: Status }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStatus(caseNumber, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Status updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });
}

export function useAddHearing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseNumber, hearing }: { caseNumber: string; hearing: Hearing }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHearing(caseNumber, hearing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Hearing added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add hearing: ' + error.message);
    },
  });
}

export function useAddEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseNumber, evidence }: { caseNumber: string; evidence: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addEvidence(caseNumber, evidence);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Evidence added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add evidence: ' + error.message);
    },
  });
}

export function useAddMultipleCases() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cases: EncryptedCase[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMultipleCases(cases);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Cases imported successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to import cases: ' + error.message);
    },
  });
}
