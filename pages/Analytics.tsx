import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAssets, usePolicies } from '../src/hooks/useData';
import { AssetType } from '../types';

export const Analytics: React.FC = () => {
    const { data: assets } = useAssets();
    const { data: policies } = usePolicies();

    // Process Asset Data for Pie Chart
    const assetDistribution = assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + asset.value;
        return acc;
    }, {} as Record<AssetType, number>);

    const assetData = Object.entries(assetDistribution).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
    const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899'];

    // Process Policy Data
    const policyByInsurer = policies.reduce((acc, p) => {
        acc[p.insurer] = (acc[p.insurer] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const policyData = Object.entries(policyByInsurer).map(([name, value]) => ({ name, value }));


  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Analysen & Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Vermögensverteilung (Portfolio)" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={assetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {assetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>

        <Card title="Versicherer Verteilung" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={policyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                         {policyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
      </div>
    </Layout>
  );
};