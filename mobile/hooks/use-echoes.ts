import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native'; 
import { api } from '@/lib/api';
import { parseISO, getHours, format } from 'date-fns';

export type DailyMemory = {
  id: string;
  date: string;
  summary: string;
};

export function useEchoes() {
  const echoesQuery = useQuery({
    queryKey: ['echoes'], 
    queryFn: async () => {
      const { data } = await api.get('/echoes');
      return data as DailyMemory[];
    },
  });

  const activityQuery = useQuery({
    queryKey: ['activity-stats'], 
    queryFn: async () => {
      // This matches the new endpoint added to FragmentsController
      const { data } = await api.get('/fragments/timeline?take=50');
      return data as any[];
    },
  });

  useFocusEffect(
    useCallback(() => {
        echoesQuery.refetch();
        activityQuery.refetch();
    }, [])
  );

  const stats = useMemo(() => {
    if (!activityQuery.data || activityQuery.data.length === 0) return null;
    
    const hoursCount = new Array(24).fill(0);
    const distribution = { morning: 0, afternoon: 0, evening: 0, night: 0, total: 0 };
    
    activityQuery.data.forEach((fragment: any) => {
        const date = parseISO(fragment.createdAt);
        const hour = getHours(date);
        hoursCount[hour]++;
        distribution.total++;
        if (hour >= 5 && hour < 12) distribution.morning++;
        else if (hour >= 12 && hour < 17) distribution.afternoon++;
        else if (hour >= 17 && hour < 22) distribution.evening++;
        else distribution.night++;
    });
    
    const maxCount = Math.max(...hoursCount);
    const peakHour = hoursCount.indexOf(maxCount);
    const centerHour = maxCount > 0 ? peakHour : getHours(new Date());
    const graphData = [];
    const labels = [];
    
    for (let i = -3; i <= 3; i++) {
        let h = centerHour + i;
        if (h < 0) h += 24;
        if (h >= 24) h -= 24;
        graphData.push(hoursCount[h]);
        const timeLabel = format(new Date().setHours(h), 'h a');
        labels.push(timeLabel);
    }
    
    const safeDiv = (num: number) => distribution.total > 0 ? Math.round((num / distribution.total) * 100) : 0;
    
    return {
        title: "Activity",
        sub: "Your recent activity patterns",
        graphData,
        labels,
        distribution: {
            morning: safeDiv(distribution.morning),
            afternoon: safeDiv(distribution.afternoon),
            evening: safeDiv(distribution.evening),
            night: safeDiv(distribution.night),
        }
    };
  }, [activityQuery.data]);

  return {
    memories: echoesQuery.data || [],
    stats,
    isLoading: echoesQuery.isLoading || activityQuery.isLoading,
    refetch: () => {
        echoesQuery.refetch();
        activityQuery.refetch();
    }
  };
}