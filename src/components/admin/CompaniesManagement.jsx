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

export default function CompaniesManagement() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    long_description: '',
    sector: 'AI/ML',
    stage: 'Series A',
    valuation: '',
    founded_year: '',
    headquarters: '',
    website: '',
    team_size: '',
    total_raised: '',
    key_investors: '',
    status: 'active',
    is_featured: false,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Company.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Company.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['companies']),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      description: '',
      long_description: '',
      sector: 'AI/ML',
      stage: 'Series A',
      valuation: '',
      founded_year: '',
      headquarters: '',
      website: '',
      team_size: '',
      total_raised: '',
      key_investors: '',
      status: 'active',
      is_featured: false,
    });
    setEditingCompany(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      valuation: formData.valuation ? parseFloat(formData.valuation) : undefined,
      founded_year: formData.founded_year ? parseInt(formData.founded_year) : undefined,
      team_size: formData.team_size ? parseInt(formData.team_size) : undefined,
      total_raised: formData.total_raised ? parseFloat(formData.total_raised) : undefined,
      key_investors: formData.key_investors ? formData.key_investors.split(',').map(i => i.trim()).filter(Boolean) : [],
    };

    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      ...company,
      key_investors: company.key_investors?.join(', ') || '',
    });
    setShowDialog(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Company Management</h2>
        <Button onClick={() => setShowDialog(true)} className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => (
          <div key={company.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-zinc-500" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-zinc-500">{company.sector} • {company.stage}</div>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-zinc-800 text-xs">${company.valuation}M</Badge>
                  {company.is_featured && <Badge className="bg-[#00ff88]/10 text-[#00ff88] text-xs">Featured</Badge>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(company)} className="flex-1">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(company.id)}>
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Edit Company' : 'Add Company'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Company Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-zinc-800 border-zinc-700" required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Logo URL</Label>
                <Input value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-zinc-800 border-zinc-700" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Sector *</Label>
                <Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {['AI/ML', 'Deep Tech', 'Fintech', 'Healthcare', 'Climate Tech', 'Enterprise SaaS', 'Cybersecurity', 'Robotics', 'Space Tech', 'Biotech'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage *</Label>
                <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {['Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Pre-IPO', 'Secondary'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valuation (M)</Label>
                <Input type="number" value={formData.valuation} onChange={(e) => setFormData({ ...formData, valuation: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Founded Year</Label>
                <Input type="number" value={formData.founded_year} onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Headquarters</Label>
                <Input value={formData.headquarters} onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Team Size</Label>
                <Input type="number" value={formData.team_size} onChange={(e) => setFormData({ ...formData, team_size: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Website</Label>
                <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Key Investors (comma separated)</Label>
                <Input value={formData.key_investors} onChange={(e) => setFormData({ ...formData, key_investors: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#00ff88] text-black hover:bg-[#00cc6a]">
                {editingCompany ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}