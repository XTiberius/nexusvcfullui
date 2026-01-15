import React from 'react';
import { localApi } from '@/api/localApi';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import StatsSection from '../components/home/StatsSection';
import FeaturedDeals from '../components/home/FeaturedDeals';
import CTASection from '../components/home/CTASection';

export default function Home() {
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => localApi.entities.Company.list('-created_date', 100),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => localApi.entities.Deal.filter({ status: 'open' }, '-created_date', 10),
  });

  return (
    <div>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <FeaturedDeals deals={deals} companies={companies} />
      <CTASection />
    </div>
  );
}