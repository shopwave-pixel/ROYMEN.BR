import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, ShoppingBag, Users, Percent, Landmark, 
  BarChart2, RefreshCw, Calendar, ArrowRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

export const Analytics: React.FC = () => {
  const { orders, products, categories, getDashboardStats } = useApp();
  const stats = getDashboardStats();

  // Premium Royal Gold and Dark Slate color tokens
  const COLORS = ['#D4AF37', '#9A8025', '#C0C0C0', '#4F46E5', '#10B981', '#EF4444', '#EC4899', '#8B5CF6'];

  // Process Daily Sales trend (Last 7 Days)
  const salesTrendData = useMemo(() => {
    // Generate actual last 7 days keys
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const salesMap = new Map<string, { date: string; revenue: number; volume: number }>();
    dates.forEach(date => {
      // Human-readable format (e.g. June 18)
      const label = new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      salesMap.set(date, { date: label, revenue: 0, volume: 0 });
    });

    // populate from active orders
    orders.forEach(order => {
      if (order.orderStatus === 'Cancelled' || !order.createdAt) return;
      const key = order.createdAt.split('T')[0];
      if (salesMap.has(key)) {
        const item = salesMap.get(key)!;
        item.revenue += order.totalPrice;
        item.volume += 1;
      }
    });

    // Fallback/Seed standard realistic baseline curve if zero orders are logged to keep graph lively
    let dataList = Array.from(salesMap.values());
    const totalActualRev = dataList.reduce((sum, d) => sum + d.revenue, 0);

    if (totalActualRev === 0) {
      dataList = [
        { date: 'Jun 12', revenue: 125000, volume: 15 },
        { date: 'Jun 13', revenue: 98000, volume: 12 },
        { date: 'Jun 14', revenue: 175000, volume: 21 },
        { date: 'Jun 15', revenue: 210000, volume: 24 },
        { date: 'Jun 16', revenue: 145000, volume: 18 },
        { date: 'Jun 17', revenue: 188000, volume: 22 },
        { date: 'Jun 18', revenue: 245000, volume: 28 },
      ];
    }

    return dataList;
  }, [orders]);

  // Process styles category allocation distribution
  const categoryChartData = useMemo(() => {
    const catMap = new Map<string, number>();

    orders.forEach(order => {
      if (order.orderStatus === 'Cancelled') return;
      order.orderItems?.forEach(item => {
        // Find corresponding product category or use generic
        const p = products.find(prod => {
          if (typeof item.product === 'object' && item.product !== null) {
            return (item.product as any)._id === prod._id;
          }
          return prod._id === item.product;
        });

        const categoryId = p ? p.category : 'cat-trad';
        catMap.set(categoryId, (catMap.get(categoryId) || 0) + (item.price * item.quantity));
      });
    });

    const dataset = Array.from(catMap.entries()).map(([catId, revenue]) => {
      const cat = categories.find(c => c._id === catId);
      return {
        name: cat ? cat.name : 'Heritage Couture',
        value: revenue
      };
    });

    // Fallback if no checkout sales logs exist
    if (dataset.length === 0) {
      return [
        { name: 'Traditional Panjabi', value: 345000 },
        { name: 'Classic Sherwani', value: 480000 },
        { name: 'Exquisite Shalwar', value: 165005 },
        { name: 'Premium Waistcoats', value: 290000 },
      ];
    }

    return dataset;
  }, [orders, products, categories]);

  // Process logistics fulfillment status
  const logisticChartData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      'Pending': 0,
      'Confirmed': 0,
      'Processing': 0,
      'Shipped': 0,
      'Delivered': 0,
      'Cancelled': 0
    };

    orders.forEach(order => {
      if (statusCounts[order.orderStatus] !== undefined) {
        statusCounts[order.orderStatus] += 1;
      }
    });

    const actualCount = orders.length;

    // Fallback if zero items
    if (actualCount === 0) {
      return [
        { name: 'Pending Audit', orders: 3, fill: '#F59E0B' },
        { name: 'Confirmed', orders: 5, fill: '#3B82F6' },
        { name: 'Processing', orders: 8, fill: '#6366F1' },
        { name: 'Shipped Aboard', orders: 12, fill: '#8B5CF6' },
        { name: 'Delivered', orders: 34, fill: '#10B981' },
        { name: 'Cancelled', orders: 2, fill: '#EF4444' },
      ];
    }

    return [
      { name: 'Pending Audit', orders: statusCounts['Pending'], fill: '#F59E0B' },
      { name: 'Confirmed', orders: statusCounts['Confirmed'], fill: '#3B82F6' },
      { name: 'Processing', orders: statusCounts['Processing'], fill: '#6366F1' },
      { name: 'Shipped Aboard', orders: statusCounts['Shipped'], fill: '#8B5CF6' },
      { name: 'Delivered', orders: statusCounts['Delivered'], fill: '#10B981' },
      { name: 'Cancelled', orders: statusCounts['Cancelled'], fill: '#EF4444' },
    ];
  }, [orders]);

  // Process gateway distribution
  const gatewayChartData = useMemo(() => {
    const methods: Record<string, number> = { COD: 0, bKash: 0, Nagad: 0 };
    orders.forEach(o => {
      if (methods[o.paymentMethod] !== undefined) {
        methods[o.paymentMethod] += o.totalPrice;
      }
    });

    const totalActual = Object.values(methods).reduce((a, b) => a + b, 0);

    if (totalActual === 0) {
      return [
        { name: 'Cash On Delivery', value: 340000 },
        { name: 'bKash Wallet', value: 685000 },
        { name: 'Nagad Wallet', value: 250000 },
      ];
    }

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <div className="font-sans space-y-8 pb-16">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-[#D4AF37]" />
            Business Analytics report
          </h1>
          <p className="text-xs text-slate-450 mt-1">Audit consolidated earnings, style segment allocations, and customer checkouts ratios.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 text-slate-400 p-2 py-1 rounded text-xs select-none max-w-xs flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Simulation Mode: Active</span>
        </div>
      </div>

      {/* Analytics Bento Cards widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Gross Revenue indicator */}
        <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-[#D4AF37]/5 rounded-full transition-all group-hover:scale-110 pointer-events-none" />
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Gross Valuation</p>
          <div className="text-2xl font-black font-mono text-white pt-1">
            {stats.totalRevenue.toLocaleString()} <span className="text-xs text-[#D4AF37] font-semibold">BDT</span>
          </div>
          <p className="text-[10px] text-emerald-450 font-mono pt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Avg Ticket: {Math.round(stats.averageOrderValue).toLocaleString()} BDT</span>
          </p>
        </div>

        {/* Fulfillment Rate indicator */}
        <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-blue-500/5 rounded-full transition-all group-hover:scale-110 pointer-events-none" />
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Fulfillment Rate</p>
          <div className="text-2xl font-black font-mono text-white pt-1">
            {stats.orderFulfillmentRate.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-450 font-mono pt-1">
            Ratio of complete delivered shipments
          </p>
        </div>

        {/* Customer registries indicator */}
        <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-purple-500/5 rounded-full transition-all group-hover:scale-110 pointer-events-none" />
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Core Registries</p>
          <div className="text-2xl font-black font-mono text-white pt-1">
            {stats.totalUsers} <span className="text-xs text-slate-500">Accounts</span>
          </div>
          <p className="text-[10px] text-amber-450 font-mono pt-1">
            Sourced & active client profiles
          </p>
        </div>

        {/* SKUs indicator */}
        <div className="bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-indigo-500/5 rounded-full transition-all group-hover:scale-110 pointer-events-none" />
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Catalogued SKUs</p>
          <div className="text-2xl font-black font-mono text-white pt-1">
            {stats.totalProducts} <span className="text-xs text-slate-500">Models</span>
          </div>
          <p className="text-[10px] text-[#D4AF37]/80 font-mono pt-1">
            Interactive couture catalogs active
          </p>
        </div>

      </div>

      {/* Visual Report Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LINE SALES DYNAMIC GRADIENT GRAPH */}
        <div className="lg:col-span-8 bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-medium text-xs text-white uppercase tracking-wider">
              Daily Gross Earnings Trend
            </h3>
            <span className="text-[10px] text-slate-550 font-mono uppercase font-bold">Past 7 Days Segment</span>
          </div>
          
          <div className="h-80 w-full font-mono text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" opacity={0.25} />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '4px' }}
                  labelClassName="text-slate-200 text-xs font-bold font-sans"
                  itemStyle={{ color: '#D4AF37', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Earnings (BDT)" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGold)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CLASS DISTRIBUTION CHART */}
        <div className="lg:col-span-4 bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-4">
          <h3 className="font-display font-medium text-xs text-white uppercase tracking-wider">
            Revenue Share By Group
          </h3>
          
          <div className="h-72 w-full font-sans text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '4px', fontSize: '11px' }}
                  itemStyle={{ color: '#F3F4F6' }}
                  formatter={(val: any) => `${val.toLocaleString()} BDT`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legends list */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-805">
            {categoryChartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-450 truncate" title={item.name}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BAR LOGISTICS FULFILLMENT STATUS */}
        <div className="lg:col-span-6 bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-4">
          <h3 className="font-display font-medium text-xs text-white uppercase tracking-wider">
            Logistic Station Distributions
          </h3>
          
          <div className="h-72 w-full font-mono text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logisticChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" opacity={0.2} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '4px' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="orders" name="Order count">
                  {logisticChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PAYMENT CHANNELS DUAL PROGRESS CHART */}
        <div className="lg:col-span-6 bg-[#121522] border border-slate-850 p-6 rounded-lg space-y-4">
          <h3 className="font-display font-medium text-xs text-white uppercase tracking-wider">
            Finance Gateway Share
          </h3>
          
          <div className="h-72 w-full font-sans text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gatewayChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={75}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  dataKey="value"
                >
                  {gatewayChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : index === 1 ? '#D4AF37' : '#EF4444'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '4px' }}
                  formatter={(val: any) => `${val.toLocaleString()} BDT`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
