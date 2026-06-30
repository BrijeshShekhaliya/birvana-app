import { queryOptions } from '@tanstack/react-query';

import { queryKeys } from '@/query/query-keys';
import { profileRepository } from '@/services/supabase/profile-repository';

export const profileQueryOptions = (userId: string) =>
  queryOptions({
    enabled: Boolean(userId),
    queryFn: () => profileRepository.getById(userId),
    queryKey: queryKeys.auth.profile(userId),
    staleTime: 1000 * 60 * 15, // 15 minutes — don't refetch on every screen mount
    retry: false, // Supabase auth errors should not loop
  });
