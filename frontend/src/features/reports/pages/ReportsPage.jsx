import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { 
  useDashboardSummary, 
  useSpendAnalytics, 
  useVendorPerformance, 
  useProcurementTrends 
} from '../api/reportsHooks';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { axiosInstance } from '../../../lib/axios';
import useAuthStore from '../../../store/useAuthStore';

const COLORS = ['#8A3223', '#9C7A2E', '#4B6B4A', '#6b6349', '#E4DBC7'];

const ReportsPage = () => {
  const { user } = useAuthStore();
  const token = localStorage.getItem('token'); // or from auth store if available.
  
  const { data: dashData, isLoading: dashLoading } = useDashboardSummary();
  const { data: spendData, isLoading: spendLoading } = useSpendAnalytics();
  const { data: perfData, isLoading: perfLoading } = useVendorPerformance();
  const { data: trendsData, isLoading: trendsLoading } = useProcurementTrends();

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get('/reports/spend?format=csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'spend-analytics.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (dashLoading || spendLoading || perfLoading || trendsLoading) {
    return (
      <div className="p-9 max-w-[1200px] mx-auto flex justify-center items-center h-[50vh]">
        <div className="font-['IBM_Plex_Mono'] text-[13px] text-[#6b6349]">Loading analytics data...</div>
      </div>
    );
  }

  const summary = dashData?.data || {};
  const spendRaw = spendData?.data || [];
  const vendorStats = perfData?.data || [];
  const trendsRaw = trendsData?.data || [];

  // Derived metrics
  const totalSpend = summary.spendToDate || 0;
  const totalPOs = trendsRaw.reduce((sum, t) => sum + (t.poCount || 0), 0);
  const activeRfqs = summary.activeRfqsCount || 0;
  const pendingApprovals = summary.pendingApprovalsCount || 0;

  // Formatting currency
  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatShortCurrency = (val) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  // Transform Trends for Bar Chart
  const barChartData = trendsRaw.map(item => {
    const [year, monthNum] = item.month.split('-');
    const date = new Date(year, parseInt(monthNum) - 1);
    return {
      monthLabel: date.toLocaleString('default', { month: 'short' }),
      spend: item.poTotalValue,
    };
  });

  // Transform Spend for Donut Chart (aggregate by vendor)
  const vendorSpendMap = {};
  spendRaw.forEach(item => {
    if (!vendorSpendMap[item.vendorName]) vendorSpendMap[item.vendorName] = 0;
    vendorSpendMap[item.vendorName] += item.totalSpend;
  });
  const sortedSpend = Object.entries(vendorSpendMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, val]) => ({ name, value: val }));
    
  let pieChartData = [];
  if (sortedSpend.length > 5) {
    const top4 = sortedSpend.slice(0, 4);
    const otherVal = sortedSpend.slice(4).reduce((sum, curr) => sum + curr.value, 0);
    pieChartData = [...top4, { name: 'Other', value: otherVal }];
  } else {
    pieChartData = sortedSpend;
  }


  // Star Rating generator
  const renderStars = (rate) => {
    // Win rate is a proxy for performance here, mapping 0-100 to 0-5 stars
    const stars = Math.round((rate / 100) * 5);
    let str = '';
    for(let i=0; i<5; i++) str += i < stars ? '★' : '☆';
    return str;
  };

  return (
    <div className="p-9 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-[1.5px] border-[#231F16] pb-5">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[26px] text-[#231F16]">Reports & Analytics</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {new Date().getFullYear()} OVERVIEW
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="px-4 py-2 rounded-[2px] border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12.5px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors flex items-center gap-2"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-5">
          <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349] mb-3">Total spend (YTD)</div>
          <div className="font-['Fraunces'] text-[24px] font-semibold text-[#231F16] leading-tight">
            {formatCurrency(totalSpend)}
          </div>
        </div>
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-5">
          <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349] mb-3">Purchase orders</div>
          <div className="font-['Fraunces'] text-[24px] font-semibold text-[#231F16] leading-tight">
            {totalPOs}
          </div>
        </div>
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-5">
          <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349] mb-3">Pending Approvals</div>
          <div className="font-['Fraunces'] text-[24px] font-semibold text-[#231F16] leading-tight">
            {pendingApprovals}
          </div>
        </div>
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-5">
          <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349] mb-3">Active RFQs</div>
          <div className="font-['Fraunces'] text-[24px] font-semibold text-[#231F16] leading-tight">
            {activeRfqs}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-5 mb-5">
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] rounded-sm">
          <div className="p-4 px-5 border-b-[1.5px] border-[#231F16] flex justify-between items-center bg-[#EDE6D6]">
            <h3 className="font-['Fraunces'] font-semibold text-[16px] text-[#231F16]">Monthly procurement spend</h3>
          </div>
          <div className="p-5 h-[280px]">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="monthLabel" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#6b6349' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatShortCurrency} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#6b6349' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(237,230,214,0.5)' }} 
                    contentStyle={{ backgroundColor: '#231F16', borderColor: '#231F16', color: '#EDE6D6', fontFamily: 'IBM Plex Mono', fontSize: 12, borderRadius: 2 }} 
                    itemStyle={{ color: '#EDE6D6' }}
                    labelStyle={{ color: '#EDE6D6' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="spend" fill="#8A3223" radius={[2, 2, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349]">No spend data available.</div>
            )}
          </div>
        </div>

        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] rounded-sm flex flex-col">
          <div className="p-4 px-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
            <h3 className="font-['Fraunces'] font-semibold text-[16px] text-[#231F16]">Spend by Vendor</h3>
          </div>
          <div className="flex-1 p-5 flex items-center justify-start gap-8 min-h-[250px]">
            {pieChartData.length > 0 ? (
              <>
                <div className="w-[140px] h-[140px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#231F16', borderColor: '#231F16', color: '#EDE6D6', fontFamily: 'IBM Plex Mono', fontSize: 12, borderRadius: 2 }} 
                        itemStyle={{ color: '#EDE6D6' }}
                        labelStyle={{ color: '#EDE6D6' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1">
                  <ul className="text-[13.5px] m-0 p-0 flex flex-col gap-3">
                    {pieChartData.map((entry, index) => {
                      const percentage = totalSpend > 0 ? ((entry.value / totalSpend) * 100).toFixed(0) : 0;
                      return (
                        <li key={`item-${index}`} className="flex items-center gap-2 text-[#231F16]">
                          <span className="w-[10px] h-[10px] rounded-[2px] flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="truncate max-w-[160px]" title={entry.name}>{entry.name}</span>
                          <span className="font-['IBM_Plex_Mono'] text-[#6b6349] text-[12px] whitespace-nowrap">— {percentage}%</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            ) : (
              <div className="font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349] w-full text-center">No spend data available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] rounded-sm">
        <div className="p-4 px-5 border-b-[1.5px] border-[#231F16] flex justify-between items-center bg-[#EDE6D6]">
          <h3 className="font-['Fraunces'] font-semibold text-[16px] text-[#231F16]">Vendor performance</h3>
          <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">Ranked by Win Rate</span>
        </div>
        <div className="p-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] pb-3 border-b-[1.5px] border-[#231F16] font-normal">Vendor</th>
                <th className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] pb-3 border-b-[1.5px] border-[#231F16] font-normal">Quotes</th>
                <th className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] pb-3 border-b-[1.5px] border-[#231F16] font-normal">Awarded</th>
                <th className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] pb-3 border-b-[1.5px] border-[#231F16] font-normal">Win Rate</th>
                <th className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] pb-3 border-b-[1.5px] border-[#231F16] font-normal">Avg Promised Delivery</th>
                <th className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] pb-3 border-b-[1.5px] border-[#231F16] font-normal">Rating (Proxy)</th>
              </tr>
            </thead>
            <tbody>
              {vendorStats.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349]">No performance data.</td></tr>
              ) : (
                vendorStats.map((stat, i) => (
                  <tr key={i} className="border-b border-[#C9C0A8] last:border-b-0">
                    <td className="py-3.5 text-[13px] text-[#231F16] font-medium">{stat.vendorName}</td>
                    <td className="py-3.5 font-['IBM_Plex_Mono'] text-[12.5px] text-[#231F16]">{stat.totalQuotations}</td>
                    <td className="py-3.5 font-['IBM_Plex_Mono'] text-[12.5px] text-[#231F16]">{stat.awardedQuotations}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-[80px] h-[6px] bg-[#C9C0A8] rounded-full overflow-hidden">
                          <div className="h-full bg-[#4B6B4A]" style={{ width: `${stat.winRate}%` }}></div>
                        </div>
                        <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">{Math.round(stat.winRate)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-['IBM_Plex_Mono'] text-[12.5px] text-[#231F16]">{stat.avgPromisedDeliveryDays ? `${stat.avgPromisedDeliveryDays.toFixed(1)} days` : 'N/A'}</td>
                    <td className="py-3.5 text-[#9C7A2E] text-[14px] tracking-widest">{renderStars(stat.winRate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
