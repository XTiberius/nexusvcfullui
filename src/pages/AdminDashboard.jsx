import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DealsManagement from '../components/admin/DealsManagement';
import OffersManagement from '../components/admin/OffersManagement';
import InvestmentsManagement from '../components/admin/InvestmentsManagement';
import AccessRequestsManagement from '../components/admin/AccessRequestsManagement';
import UsersManagement from '../components/admin/UsersManagement';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-[#00ff88]" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-zinc-500">Manage deals, companies, investments, and user access</p>
        </motion.div>

        <Tabs defaultValue="deals" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="deals" className="data-[state=active]:bg-zinc-800">
              <FileText className="w-4 h-4 mr-2" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="offers" className="data-[state=active]:bg-zinc-800">
              <DollarSign className="w-4 h-4 mr-2" />
              Offers
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-zinc-800">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-zinc-800">
              <UserCheck className="w-4 h-4 mr-2" />
              Access Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deals">
            <DealsManagement />
          </TabsContent>

          <TabsContent value="offers">
            <OffersManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="access">
            <AccessRequestsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}