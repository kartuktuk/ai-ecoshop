import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface PersonalStats {
  totalCarbon: number;
  averageCarbonPerItem: number;
  totalItems: number;
  averageSustainability: number;
}

interface ComparisonStats {
  globalAverageCarbonPerItem: number;
  carbonSavings: number;
  percentageReduction: number;
  ranking: 'Below Average' | 'Above Average';
}

interface RewardsStats {
  greenTokens: number;
  lastEarned: number;
}

interface FootprintData {
  personalStats: PersonalStats;
  comparison: ComparisonStats;
  rewards: RewardsStats;
}

interface UseFootprintReturn {
  footprintData: FootprintData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFootprint = (): UseFootprintReturn => {
  const [footprintData, setFootprintData] = useState<FootprintData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFootprint = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get('/footprint');
      setFootprintData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching footprint data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFootprint();
    }
  }, [user]);

  return {
    footprintData,
    loading,
    error,
    refetch: fetchFootprint
  };
};
