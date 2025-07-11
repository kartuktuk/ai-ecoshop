import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  carbonImpact: number;
  sustainabilityScore: number;
  imageUrl: string;
  blockchainHash: string;
  inStock: boolean;
  recommendationScore?: number;
}

interface RecommendationMetrics {
  averageSustainabilityScore: number;
  averageCarbonImpact: number;
}

interface UseRecommendationsReturn {
  recommendations: Product[];
  metrics: RecommendationMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRecommendations = (): UseRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get('/recommend');
      setRecommendations(data.recommendations);
      setMetrics(data.metrics);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  return {
    recommendations,
    metrics,
    loading,
    error,
    refetch: fetchRecommendations
  };
};
