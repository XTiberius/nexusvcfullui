import React from 'react';
import { localApi } from '@/api/localApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink } from 'lucide-react';

export default function AccessRequestsManagement() {
  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ['accessRequests'],
    queryFn: () => localApi.entities.AccessRequest.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => localApi.entities.AccessRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['accessRequests']),
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Access Requests</h2>

      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-[#00ff88]">Pending Review ({pendingRequests.length})</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium text-lg">{request.full_name}</div>
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Pending</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-zinc-500">Email:</span> <span className="text-zinc-300">{request.email}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Type:</span> <span className="text-zinc-300">{request.investor_type}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Accreditation:</span> <span className="text-zinc-300">{request.accreditation_status}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Capacity:</span> <span className="text-zinc-300">{request.investment_capacity || 'N/A'}</span>
                      </div>
                      {request.company_name && (
                        <div>
                          <span className="text-zinc-500">Company:</span> <span className="text-zinc-300">{request.company_name}</span>
                        </div>
                      )}
                      {request.linkedin_url && (
                        <div>
                          <a href={request.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#00ff88] hover:underline flex items-center gap-1">
                            LinkedIn Profile <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                    {request.areas_of_interest?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs text-zinc-500">Interests: </span>
                        <span className="text-xs text-zinc-400">{request.areas_of_interest.join(', ')}</span>
                      </div>
                    )}
                    {request.message && (
                      <div className="text-sm text-zinc-400 bg-zinc-800/50 rounded-lg p-3">
                        {request.message}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: request.id, status: 'approved' })}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ id: request.id, status: 'rejected' })}
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviewedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 text-zinc-500">Reviewed ({reviewedRequests.length})</h3>
          <div className="space-y-2">
            {reviewedRequests.map((request) => (
              <div key={request.id} className="glass-card rounded-xl p-3 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{request.full_name}</div>
                    <div className="text-sm text-zinc-500">{request.email} • {request.investor_type}</div>
                  </div>
                  <Badge className={
                    request.status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }>
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          No access requests yet
        </div>
      )}
    </div>
  );
}