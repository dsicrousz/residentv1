import { useQuery } from '@tanstack/react-query';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';

export const queryKeys = {
  activeAnnee: ['activeAnnee'] as const,
  annees: ['annees'] as const,
  campuses: (anneeId?: string) => (anneeId ? ['campuses', anneeId] : ['campuses']),
  pavilions: (anneeId?: string) => (anneeId ? ['pavilions', anneeId] : ['pavilions']),
  chambres: (anneeId?: string) => (anneeId ? ['chambres', anneeId] : ['chambres']),
  lits: (anneeId?: string) => (anneeId ? ['lits', anneeId] : ['lits']),
  dossiers: (anneeId?: string) => (anneeId ? ['dossiers', anneeId] : ['dossiers']),
  payments: (id?: string) => (id ? ['payments', id] : ['payments']),
  allocations: (id?: string) => (id ? ['allocations', id] : ['allocations']),
  equipements: ['equipements'] as const,
  users: ['users'] as const,
};

export function useActiveSession() {
  return useQuery({
    queryKey: queryKeys.activeAnnee,
    queryFn: getAnneeUniversitaireActive,
  });
}
