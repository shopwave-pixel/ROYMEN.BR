import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, UserPlus, Search, ShieldCheck, UserCheck, 
  UserX, Mail, Phone, Calendar, ArrowUpDown, Filter, Edit
} from 'lucide-react';
import { User } from '../../types';

interface SimulatedUser extends User {
  status: 'Active' | 'Suspended';
  ordersCount: number;
}

export const UsersManagement: React.FC = () => {
  const { orders } = useApp();

  // Seed default base users
  const baseUsers: SimulatedUser[] = [
    {
      _id: 'usr-1',
      name: 'Jane Cooper',
      email: 'jane.cooper@example.com',
      phone: '+880 1711-223344',
      role: 'admin',
      status: 'Active',
      ordersCount: 4,
      createdAt: '2026-01-15'
    },
    {
      _id: 'usr-2',
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      phone: '+880 1812-345678',
      role: 'customer',
      status: 'Active',
      ordersCount: 2,
      createdAt: '2026-02-10'
    },
    {
      _id: 'usr-3',
      name: 'Emily Watson',
      email: 'emily.w@outlook.com',
      phone: '+880 1913-987654',
      role: 'customer',
      status: 'Suspended',
      ordersCount: 0,
      createdAt: '2026-03-01'
    }
  ];

  // Dynamically harvest customer details from active checkout order instances
  const harvestedUsers = useMemo(() => {
    const usersMap = new Map<string, SimulatedUser>();

    orders.forEach(order => {
      const email = typeof order.user === 'object' ? order.user.email : 'guest@roymen.com';
      const name = typeof order.user === 'object' ? order.user.name : `Customer via ${order.phone}`;
      const userId = typeof order.user === 'object' ? order.user._id : `guest-${order.phone}`;

      if (usersMap.has(userId)) {
        const existing = usersMap.get(userId)!;
        existing.ordersCount += 1;
      } else {
        usersMap.set(userId, {
          _id: userId,
          name: name,
          email: email,
          phone: order.phone,
          role: typeof order.user === 'object' ? order.user.role : 'customer',
          status: 'Active',
          ordersCount: 1,
          createdAt: order.createdAt ? order.createdAt.split('T')[0] : '2026-06-18'
        });
      }
    });

    return Array.from(usersMap.values());
  }, [orders]);

  // Combine lists
  const [usersList, setUsersList] = useState<SimulatedUser[]>(() => {
    const combined = [...baseUsers];
    harvestedUsers.forEach(hu => {
      if (!combined.some(bu => bu._id === hu._id)) {
        combined.push(hu);
      }
    });
    return combined;
  });

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Suspended'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Create user form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'customer' | 'admin'>('customer');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPhone) {
      alert('Please fill in all requested fields.');
      return;
    }

    const newUser: SimulatedUser = {
      _id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      role: newUserRole,
      status: 'Active',
      ordersCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsersList(prev => [newUser, ...prev]);
    setIsModalOpen(false);
    
    // Clear form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('customer');
  };

  const toggleStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u._id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const toggleRole = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u._id === userId) {
        const nextRole = u.role === 'admin' ? 'customer' : 'admin';
        return { ...u, role: nextRole };
      }
      return u;
    }));
  };

  const triggerSort = (field: 'name' | 'orders' | 'date') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort
  const filteredUsers = useMemo(() => {
    return usersList
      .filter(user => {
        const matchesSearch = 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm);
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        let valueA: any = a.name;
        let valueB: any = b.name;

        if (sortBy === 'orders') {
          valueA = a.ordersCount;
          valueB = b.ordersCount;
        } else if (sortBy === 'date') {
          valueA = a.createdAt || '';
          valueB = b.createdAt || '';
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [usersList, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  return (
    <div className="font-sans space-y-8 pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase flex items-center gap-3">
            <Users className="w-7 h-7 text-[#D4AF37]" />
            Users Management
          </h1>
          <p className="text-xs text-slate-450 mt-1">Audit active user catalogs, elevate administrative privileges and block fraudulent accounts.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all shadow"
        >
          <UserPlus className="w-4 h-4" />
          Add simulated User
        </button>
      </div>

      {/* Filter and Search Panels */}
      <div className="bg-[#121522] border border-slate-850 p-5 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by customer name, email or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Filter Role */}
        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Administrators Only</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Suspended">Suspended / Locked</option>
          </select>
        </div>

      </div>

      {/* Users DataTable Grid */}
      <div className="border border-slate-850 rounded-lg overflow-hidden bg-[#121522]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161a29]/80 text-slate-400 font-bold border-b border-slate-800 select-none">
              <tr>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => triggerSort('name')}>
                  <div className="flex items-center gap-1.5">
                    User Contact
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Role / Title</th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors text-center" onClick={() => triggerSort('orders')}>
                  <div className="flex items-center justify-center gap-1.5">
                    Orders Placed
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => triggerSort('date')}>
                  <div className="flex items-center gap-1.5">
                    Registered On
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No registry data matched the specified queries.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center font-display font-bold text-white text-sm">
                          {user.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{user.name}</div>
                          <span className="text-[10px] text-slate-550 font-mono block">{user._id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 space-y-1 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-350">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{user.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          <ShieldCheck className="w-3 h-3" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          Client Account
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-200">
                      {user.ordersCount}
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{user.createdAt || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.status === 'Active' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => toggleRole(user._id)}
                        className={`p-1.5 px-2.5 rounded font-bold uppercase text-[10px] border transition-all ${
                          user.role === 'admin'
                            ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-[#D4AF37] hover:text-slate-950'
                        }`}
                        title="Elevate or degrade workspace credentials"
                      >
                        {user.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>

                      <button
                        onClick={() => toggleStatus(user._id)}
                        className={`p-1.5 rounded transition-all ${
                          user.status === 'Active'
                            ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20 hover:bg-rose-650 hover:text-white'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                        }`}
                        title={user.status === 'Active' ? 'Suspend client ledger' : 'Activate client ledger'}
                      >
                        {user.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#12141C] border border-slate-800 rounded-lg shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-500/10 rounded text-[#D4AF37]">
                <UserPlus className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-medium text-sm text-white uppercase tracking-wider">
                  Create Simulated customer profile
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">
                  Sandbox Injector Mode
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Fahim Ahmed"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">Email handle</label>
                  <input
                    type="email"
                    required
                    placeholder="fahim@gmail.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">Contact Mobile</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1711223344"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded px-4 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">Dashboard Role Authority</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37]"
                >
                  <option value="customer">Customer Access level</option>
                  <option value="admin">Administrator Access level</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3 text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded transition-all"
                >
                  Close panel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-slate-950 rounded transition-all shadow"
                >
                  Inject Customer
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default UsersManagement;
