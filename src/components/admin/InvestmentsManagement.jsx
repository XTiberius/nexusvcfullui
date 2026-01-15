import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Building2 } from 'lucide-react';

export default function InvestmentsManagement() {
  const { data: investments = [] } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list('-created_date', 100),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date', 100),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-created_date', 100),
  });

  const getDeal = (dealId) => deals.find(d => d.id === dealId);
  const getCompany = (companyId) => companies.find(c => c.id === companyId);

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount || 0), 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Investment Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-[#00ff88]" />
            <span className="text-sm text-zinc-500">Total Invested</span>
          </div>
          <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-[#00ff88]" />
            <span className="text-sm text-zinc-500">Current Value</span>
          </div>
          <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-[#00ff88]" />
            <span className="text-sm text-zinc-500">Total Investments</span>
          </div>
          <div className="text-2xl font-bold">{investments.length}</div>
        </div>
      </div>

      <div className="space-y-3">
        {investments.map((investment) => {
          const deal = getDeal(investment.deal_id);
          const company = getCompany(investment.company_id);
          const gain = investment.current_value ? investment.current_value - investment.amount : 0;
          const gainPercent = investment.amount ? ((gain / investment.amount) * 100).toFixed(1) : 0;

          return (
            <div key={investment.id} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {company?.logo_url ? (
                    <img src={company.logo_url} alt={company?.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-zinc-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{company?.name || 'Company'}</div>
                    <div className="text-sm text-zinc-500">{deal?.title}</div>
                    <div className="text-xs text-zinc-600 mt-1">
                      Invested: {investment.investment_date ? new Date(investment.investment_date).toLocaleDateString() : 'N/A'} • 
                      By: {investment.created_by}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">${investment.amount?.toLocaleString()}</div>
                  {investment.current_value && (
                    <div className="text-sm text-zinc-400">
                      Value: ${investment.current_value.toLocaleString()}
                    </div>
                  )}
                  {gain !== 0 && (
                    <div className={`text-xs ${gain > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {gain > 0 ? '+' : ''}{gainPercent}%
                    </div>
                  )}
                  <Badge className={`mt-2 ${
                    investment.status === 'settled' ? 'bg-emerald-500/10 text-emerald-400' :
                    investment.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {investment.status}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
        {investments.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No investments recorded yet
          </div>
        )}
      </div>
    </div>
  );
}