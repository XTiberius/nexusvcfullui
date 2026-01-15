import React, { useState } from 'react';
import { localApi } from '@/api/localApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Upload, FileText, Plus } from 'lucide-react';

export default function OffersManagement() {
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const { data: investments = [] } = useQuery({
    queryKey: ['investments'],
    queryFn: () => localApi.entities.Investment.list('-created_date', 100),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => localApi.entities.Deal.list('-created_date', 100),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => localApi.entities.Company.list('-created_date', 100),
  });

  const { data: entities = [] } = useQuery({
    queryKey: ['entities'],
    queryFn: () => localApi.entities.Entity.list('-created_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localApi.entities.Investment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['investments']);
      setShowDialog(false);
      setSelectedOffer(null);
    },
  });

  const getDeal = (dealId) => deals.find(d => d.id === dealId);
  const getCompany = (companyId) => companies.find(c => c.id === companyId);
  const getEntity = (entityId) => entities.find(e => e.id === entityId);

  const openOffers = investments.filter(i => i.status === 'open');
  const pendingOffers = investments.filter(i => i.status === 'pending');
  const closedOffers = investments.filter(i => i.status === 'closed');
  const rejectedOffers = investments.filter(i => i.status === 'rejected');

  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
    setNotes(offer.notes || '');
    setNewStatus(offer.status);
    setShowDialog(true);
  };

  const handleUpdateOffer = () => {
    if (!selectedOffer) return;
    updateMutation.mutate({
      id: selectedOffer.id,
      data: {
        status: newStatus,
        notes: notes,
      },
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOffer) return;

    setUploadingDoc(true);
    try {
      const { file_url } = await localApi.integrations.Core.UploadFile({ file });
      const updatedDocs = [...(selectedOffer.documents || []), file_url];
      await localApi.entities.Investment.update(selectedOffer.id, {
        documents: updatedDocs,
      });
      queryClient.invalidateQueries(['investments']);
      setSelectedOffer({ ...selectedOffer, documents: updatedDocs });
    } finally {
      setUploadingDoc(false);
    }
  };

  const statusConfig = {
    open: { label: 'Open', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    closed: { label: 'Closed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };

  const OfferCard = ({ offer }) => {
    const deal = getDeal(offer.deal_id);
    const company = getCompany(offer.company_id);
    const entity = getEntity(offer.entity_id);
    const status = statusConfig[offer.status];

    return (
      <div
        onClick={() => handleOfferClick(offer)}
        className="glass-card rounded-xl p-4 hover:border-[#00ff88]/30 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-2">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company?.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-zinc-500" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium text-sm">{company?.name}</div>
            <div className="text-xs text-zinc-500">{deal?.title}</div>
          </div>
          <Badge className={`${status.color} border`}>{status.label}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <div>
            <span className="text-zinc-500">Amount:</span>
            <div className="font-semibold">${offer.amount?.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-zinc-500">Investor:</span>
            <div className="text-zinc-300 truncate">{offer.created_by}</div>
          </div>
          {entity && (
            <div className="col-span-2">
              <span className="text-zinc-500">Entity:</span>
              <div className="text-zinc-300">{entity.entity_name} ({entity.entity_type})</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Offer Management</h2>

      <div className="space-y-6">
        {/* Open Offers */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            Open Offers ({openOffers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {openOffers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
          </div>
          {openOffers.length === 0 && <div className="text-zinc-600 text-sm">No open offers</div>}
        </div>

        {/* Pending Offers */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Pending Offers ({pendingOffers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingOffers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
          </div>
          {pendingOffers.length === 0 && <div className="text-zinc-600 text-sm">No pending offers</div>}
        </div>

        {/* Closed Offers */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            Closed Offers ({closedOffers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {closedOffers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
          </div>
          {closedOffers.length === 0 && <div className="text-zinc-600 text-sm">No closed offers</div>}
        </div>

        {/* Rejected Offers */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full" />
            Rejected Offers ({rejectedOffers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rejectedOffers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
          </div>
          {rejectedOffers.length === 0 && <div className="text-zinc-600 text-sm">No rejected offers</div>}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Offer</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4 mt-4">
              <div>
                <div className="font-medium mb-2">{getCompany(selectedOffer.company_id)?.name}</div>
                <div className="text-sm text-zinc-500 mb-1">{getDeal(selectedOffer.deal_id)?.title}</div>
                <div className="text-lg font-semibold text-[#00ff88]">${selectedOffer.amount?.toLocaleString()}</div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  rows={4}
                  placeholder="Add notes about this offer..."
                />
              </div>

              <div className="space-y-2">
                <Label>Documents</Label>
                <div className="space-y-2">
                  {selectedOffer.documents?.map((doc, i) => (
                    <a
                      key={i}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#00ff88] hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Document {i + 1}
                    </a>
                  ))}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 rounded-lg p-2 border border-zinc-700 hover:border-zinc-600 transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingDoc}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateOffer}
                  className="flex-1 bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                >
                  Update Offer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}