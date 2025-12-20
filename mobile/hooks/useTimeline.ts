import { useMemo, useCallback } from 'react'; // Add useCallback
import { useInfiniteQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native'; // Import this (or from 'expo-router')
import { format, parseISO } from 'date-fns';
import { api } from '@/lib/api';
import { Fragment, GroupedFragment } from '@/types/types';

const BATCH_SIZE = 15;

export const useTimeline = (filterDate: Date | null) => {
  const { 
    data, 
    isLoading, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['timeline', filterDate ? filterDate.toISOString() : 'all'],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const dateParam = filterDate ? `&date=${format(filterDate, 'yyyy-MM-dd')}` : '';
      const res = await api.get(`/fragments/timeline?skip=${pageParam}&take=${BATCH_SIZE}${dateParam}`);
      return res.data as Fragment[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < BATCH_SIZE) return undefined;
      return allPages.length * BATCH_SIZE;
    },
  });

  // --- THE FIX ---
  // This triggers a silent refetch whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // This will check if data is stale (which useCapture marked it as) and update it
      // You can remove isPaused checks to force it, but usually standard refetch works:
      refetch(); 
    }, [refetch])
  );
  // ----------------

  const groupedData = useMemo(() => {
    if (!data) return [];
    
    const allFragments = data.pages.flat();
    const groups: Record<string, Fragment[]> = {};
    
    allFragments.forEach((fragment) => {
      const dateKey = format(parseISO(fragment.createdAt), 'yyyy-MM-dd');
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(fragment);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        fragments: groups[date]
      })) as GroupedFragment[];
  }, [data]);

  return {
    groupedData,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};