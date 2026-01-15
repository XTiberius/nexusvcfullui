import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { User, Building2, ChevronDown, ChevronUp, Mail, Shield, ExternalLink } from 'lucide-react';

export default function UsersManagement() {
  const [expandedUser, setExpandedUser] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
  });

  const { data: allEntities = [] } = useQuery({
    queryKey: ['allEntities'],
    queryFn: () => base44.entities.Entity.list('-created_date', 200),
  });

  const { data: investments = [] } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list('-created_date', 200),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date', 100),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-created_date', 100),
  });

  const getUserEntities = (userEmail) => allEntities.filter(e => e.created_by === userEmail);
  const getUserInvestments = (userEmail) => investments.filter(i => i.created_by === userEmail);
  const getDeal = (dealId) => deals.find(d => d.id === dealId);
  const getCompany = (companyId) => companies.find(c => c.id === companyId);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Users & Profiles</h2>

      <div className="space-y-3">
        {users.map((user) => {
          const isExpanded = expandedUser === user.id;
          const userEntities = getUserEntities(user.email);
          const userInvestments = getUserInvestments(user.email);
          const totalInvested = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

          return (
            <div key={user.id} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-zinc-500">{user.email}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge className={user.role === 'admin' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-zinc-800 text-zinc-400'}>
                        {user.role}
                      </Badge>
                      {userEntities.length > 0 && (
                        <Badge className="bg-zinc-800 text-zinc-400">{userEntities.length} entities</Badge>
                      )}
                      {totalInvested > 0 && (
                        <Badge className="bg-zinc-800 text-zinc-400">${totalInvested.toLocaleString()} invested</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-500" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-zinc-800 pt-4">
                  <div className="space-y-4">
                    {/* User Info */}
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Account Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-zinc-500" />
                          <span className="text-zinc-400">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-zinc-500" />
                          <span className="text-zinc-400">{user.role}</span>
                        </div>
                      </div>
                    </div>

                    {/* Entities */}
                    {userEntities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-2">Investment Entities ({userEntities.length})</h4>
                        <div className="space-y-2">
                          {userEntities.map((entity) => (
                            <div key={entity.id} className="bg-zinc-800/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-[#00ff88]" />
                                <span className="font-medium text-sm">{entity.entity_name}</span>
                                <Badge className="bg-zinc-900 text-xs">{entity.entity_type}</Badge>
                              </div>
                              <div className="text-xs text-zinc-500 space-y-1">
                                {entity.tax_id && <div>Tax ID: {entity.tax_id}</div>}
                                {entity.address && <div>Address: {entity.address}</div>}
                                {entity.accreditation_status && <div>Accreditation: {entity.accreditation_status}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Investments */}
                    {userInvestments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-2">Investments ({userInvestments.length})</h4>
                        <div className="space-y-2">
                          {userInvestments.map((investment) => {
                            const deal = getDeal(investment.deal_id);
                            const company = getCompany(investment.company_id);
                            const entity = allEntities.find(e => e.id === investment.entity_id);
                            
                            return (
                              <div key={investment.id} className="bg-zinc-800/50 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-sm flex-1">
                                    <div className="font-medium">${investment.amount?.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500">
                                      {investment.investment_date ? new Date(investment.investment_date).toLocaleDateString() : 'N/A'}
                                    </div>
                                  </div>
                                  <Badge className={
                                    investment.status === 'closed' ? 'bg-emerald-500/10 text-emerald-400' :
                                    investment.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                    investment.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-red-500/10 text-red-400'
                                  }>
                                    {investment.status}
                                  </Badge>
                                </div>
                                {deal && (
                                  <Link 
                                    to={createPageUrl(`DealDetail?id=${deal.id}`)}
                                    className="text-xs text-[#00ff88] hover:underline mb-1 flex items-center gap-1"
                                  >
                                    Deal: {company?.name} - {deal.title}
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                                {entity && (
                                  <div className="text-xs text-zinc-500">
                                    Entity: {entity.entity_name} ({entity.entity_type})
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {userEntities.length === 0 && userInvestments.length === 0 && (
                      <div className="text-center py-4 text-zinc-600 text-sm">
                        No entities or investments yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}