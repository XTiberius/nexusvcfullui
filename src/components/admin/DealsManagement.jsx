import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

export default function DealsManagement() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({
    company_id: '',
    title: '',
    deal_type: 'Secondary',
    minimum_investment: '',
    target_raise: '',
    current_raised: '',
    share_price: '',
    last_round_price: '',
    implied_valuation: '',
    allocation_remaining: '',
    closing_date: '',
    status: 'open',
    access_level: 'members_only',
    highlights: '',
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date', 100),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-created_date', 100),
  });

  const { data: investments = [] } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Deal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['deals']);
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Deal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['deals']);
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Deal.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['deals']),
  });

  const resetForm = () => {
    setFormData({
      company_id: '',
      title: '',
      deal_type: 'Secondary',
      minimum_investment: '',
      target_raise: '',
      current_raised: '',
      share_price: '',
      last_round_price: '',
      implied_valuation: '',
      allocation_remaining: '',
      closing_date: '',
      status: 'open',
      access_level: 'members_only',
      highlights: '',
    });
    setEditingDeal(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      minimum_investment: parseFloat(formData.minimum_investment),
      target_raise: formData.target_raise ? parseFloat(formData.target_raise) : undefined,
      current_raised: formData.current_raised ? parseFloat(formData.current_raised) : undefined,
      share_price: formData.share_price ? parseFloat(formData.share_price) : undefined,
      last_round_price: formData.last_round_price ? parseFloat(formData.last_round_price) : undefined,
      implied_valuation: formData.implied_valuation ? parseFloat(formData.implied_valuation) : undefined,
      allocation_remaining: formData.allocation_remaining ? parseFloat(formData.allocation_remaining) : undefined,
      highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
    };

    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      ...deal,
      highlights: deal.highlights?.join('\n') || '',
    });
    setShowDialog(true);
  };

  const getCompany = (companyId) => companies.find(c => c.id === companyId);
  
  const getDealRaised = (dealId) => {
    return investments
      .filter(inv => inv.deal_id === dealId && inv.status === 'closed')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Deal Management</h2>
        <Button onClick={() => setShowDialog(true)} className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
          <Plus className="w-4 h-4 mr-2" />
          Create Deal
        </Button>
      </div>

      <div className="space-y-3">
        {deals.map((deal) => {
          const company = getCompany(deal.company_id);
          const raised = getDealRaised(deal.id);
          return (
            <div key={deal.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt={company?.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-zinc-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium">{deal.title}</div>
                  <div className="text-sm text-zinc-500">{company?.name} • {deal.deal_type}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-zinc-800 text-xs">{deal.status}</Badge>
                    <Badge className="bg-zinc-800 text-xs">${deal.minimum_investment?.toLocaleString()} min</Badge>
                    {raised > 0 && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                        ${raised.toLocaleString()} raised
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(deal)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(deal.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal ? 'Edit Deal' : 'Create Deal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Company *</Label>
                <Select value={formData.company_id} onValueChange={(v) => setFormData({ ...formData, company_id: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Deal Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-zinc-800 border-zinc-700" required />
              </div>
              <div className="space-y-2">
                <Label>Deal Type</Label>
                <Select value={formData.deal_type} onValueChange={(v) => setFormData({ ...formData, deal_type: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="Secondary">Secondary</SelectItem>
                    <SelectItem value="SPV">SPV</SelectItem>
                    <SelectItem value="Direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Minimum Investment *</Label>
                <Input type="number" value={formData.minimum_investment} onChange={(e) => setFormData({ ...formData, minimum_investment: e.target.value })} className="bg-zinc-800 border-zinc-700" required />
              </div>
              <div className="space-y-2">
                <Label>Target Raise</Label>
                <Input type="number" value={formData.target_raise} onChange={(e) => setFormData({ ...formData, target_raise: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Current Raised</Label>
                <Input type="number" value={formData.current_raised} onChange={(e) => setFormData({ ...formData, current_raised: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Share Price</Label>
                <Input type="number" step="0.01" value={formData.share_price} onChange={(e) => setFormData({ ...formData, share_price: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Last Round Price</Label>
                <Input type="number" step="0.01" value={formData.last_round_price} onChange={(e) => setFormData({ ...formData, last_round_price: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Implied Valuation (M)</Label>
                <Input type="number" value={formData.implied_valuation} onChange={(e) => setFormData({ ...formData, implied_valuation: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Closing Date</Label>
                <Input type="date" value={formData.closing_date} onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closing_soon">Closing Soon</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="fully_subscribed">Fully Subscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select value={formData.access_level} onValueChange={(v) => setFormData({ ...formData, access_level: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="members_only">Members Only</SelectItem>
                    <SelectItem value="qualified_only">Qualified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Highlights (one per line)</Label>
                <Textarea value={formData.highlights} onChange={(e) => setFormData({ ...formData, highlights: e.target.value })} className="bg-zinc-800 border-zinc-700" rows={4} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#00ff88] text-black hover:bg-[#00cc6a]">
                {editingDeal ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}