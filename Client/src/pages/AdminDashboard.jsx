import { useState, useEffect } from 'react';
import { 
  Users, User, LogOut, Activity, MonitorSmartphone, FileText, Settings, Home,
  Clock, CheckCircle2, TrendingUp, Menu, X, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalServed: 0, activeCounters: 0, avgWaitTime: 0, peakHour: 'N/A' });
  const [activeCountersList, setActiveCountersList] = useState([]);
  const [queueDistribution, setQueueDistribution] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/overview', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setActiveCountersList(data.activeCountersList);
        setQueueDistribution(data.queueDistribution);
      }
    } catch (err) { console.error('Failed to fetch analytics', err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background font-sans relative overflow-hidden text-content-primary">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-content-primary/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 bg-sidebar border-none
        transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
      `}>
        <div className="w-72 flex flex-col h-full justify-between">
          <div>
            <div className="p-8 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 text-white bg-primary rounded-xl shadow-sm">
                  <BarChart3 size={22} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">QueueEase</h1>
              </div>
              <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <nav className="px-5 space-y-2">
              <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary text-white shadow-md relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                <Home size={20} />
                <span className="font-semibold tracking-wide text-sm">Overview</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-all duration-300 group">
                <Users size={20} className="group-hover:text-white transition-colors" />
                <span className="font-semibold tracking-wide text-sm">Staff Directory</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-all duration-300 group">
                <MonitorSmartphone size={20} className="group-hover:text-white transition-colors" />
                <span className="font-semibold tracking-wide text-sm">Active Counters</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-all duration-300 group">
                <FileText size={20} className="group-hover:text-white transition-colors" />
                <span className="font-semibold tracking-wide text-sm">Detailed Reports</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-all duration-300 group">
                <Settings size={20} className="group-hover:text-white transition-colors" />
                <span className="font-semibold tracking-wide text-sm">System Settings</span>
              </a>
            </nav>
          </div>
          
          <div className="p-5 mb-4">
            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-all duration-300 group border border-transparent">
              <LogOut size={20} className="group-hover:text-white transition-colors" />
              <span className="font-semibold tracking-wide text-sm">Secure Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background relative z-10">
        <header className="bg-card border-b border-borderline px-6 md:px-10 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-content-secondary hover:text-content-primary transition-colors md:hidden mr-2">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-content-primary tracking-tight leading-tight">System Overview</h2>
              <p className="text-sm font-medium text-content-muted uppercase tracking-widest mt-0.5">Real-time Metrics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={fetchAnalytics} className="text-sm font-bold text-content-primary bg-card border border-borderline hover:border-primary hover:bg-background px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider hidden sm:block shadow-sm">
              Refresh Data
            </button>
            
            <div className="flex items-center gap-4 border-l border-borderline pl-6">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-content-primary tracking-wide">Admin Portal</p>
                <p className="text-xs text-primary font-bold uppercase tracking-wider">Superuser</p>
              </div>
              <div className="w-11 h-11 bg-background border border-borderline rounded-full flex items-center justify-center text-primary font-bold uppercase shadow-sm">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Served", value: stats.totalServed, icon: Users },
              { label: "Active Counters", value: stats.activeCounters, icon: Activity },
              { label: "Avg Wait Time", value: `${stats.avgWaitTime}m`, icon: Clock },
              { label: "Peak Volume", value: stats.peakHour, icon: TrendingUp }
            ].map((stat, i) => (
              <div key={i} className="group bg-card p-6 rounded-3xl border border-borderline shadow-sm hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <stat.icon size={26} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-content-muted font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-content-primary tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            <div className="xl:col-span-2 bg-card rounded-3xl border border-borderline shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-borderline bg-background flex justify-between items-center">
                <h3 className="font-bold text-content-primary tracking-tight flex items-center gap-3 text-lg">
                  <MonitorSmartphone size={20} className="text-primary" /> Live Counter Network
                </h3>
              </div>
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left">
                  <thead className="bg-background border-b border-borderline text-content-muted text-xs uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-8 py-4">Terminal</th>
                      <th className="px-8 py-4">Department</th>
                      <th className="px-8 py-4">Active Staff</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderline">
                    {activeCountersList.map(counter => (
                      <tr key={counter.id} className="hover:bg-background transition-colors">
                        <td className="px-8 py-5 font-bold text-content-primary text-base">Desk {counter.counter_number}</td>
                        <td className="px-8 py-5 text-content-secondary font-medium">{counter.queue_name}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-background border border-borderline flex items-center justify-center text-xs font-bold text-primary">
                              {counter.staff_name.charAt(0)}
                            </div>
                            <span className="text-content-primary font-medium">{counter.staff_name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-success/10 border border-success/20 text-success">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                            ONLINE
                          </span>
                        </td>
                      </tr>
                    ))}
                    {activeCountersList.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-8 py-12 text-center text-content-muted font-medium text-lg">
                          No active counters currently online.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-borderline shadow-sm flex flex-col relative overflow-hidden">
              <div className="px-8 py-6 border-b border-borderline bg-background relative z-10">
                <h3 className="font-bold text-content-primary tracking-tight flex items-center gap-3 text-lg">
                  <Activity size={20} className="text-accent" /> Queue Load Distribution
                </h3>
              </div>
              <div className="p-8 flex-grow relative z-10">
                <div className="space-y-8">
                  {queueDistribution.map(q => (
                    <div key={q.id}>
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <p className="font-bold text-content-primary text-base tracking-tight mb-1">{q.name}</p>
                          <p className="text-xs font-bold text-warning uppercase tracking-widest">~ {q.est_wait_time} min ETA</p>
                        </div>
                        <span className="font-bold text-warning bg-warning/10 border border-warning/20 px-3 py-1 rounded-lg text-xs tracking-wide">
                           {q.waiting_count} waiting
                        </span>
                      </div>
                      <div className="w-full bg-background border border-borderline rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min((q.waiting_count / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {queueDistribution.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-borderline">
                         <TrendingUp size={24} className="text-content-muted opacity-50" />
                      </div>
                      <p className="text-content-muted font-medium text-lg">No data streams active.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
