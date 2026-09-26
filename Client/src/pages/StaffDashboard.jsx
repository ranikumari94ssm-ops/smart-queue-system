import { useState, useEffect } from 'react';
import { 
  Users, User, LogOut, CheckSquare, BellRing, Building2, Grid, Home, Menu, X, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState('DEPARTMENT'); 
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState(null);
  
  const [upcomingTickets, setUpcomingTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [stats, setStats] = useState({ served: 0, waiting: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    setUser(JSON.parse(userData));
    
    fetch('/api/queues')
      .then(res => res.json())
      .then(data => setDepartments(data.queues || []))
      .catch(err => console.error(err));
  }, [navigate]);

  const handleSelectDepartment = (dept) => {
    setSelectedDept(dept);
    fetch(`/api/staff/counters/${dept.id}`)
      .then(res => res.json())
      .then(data => { setCounters(data.counters || []); setStep('SEAT'); })
      .catch(err => console.error(err));
  };

  const handleSelectSeat = async (counter) => {
    if (counter.status === 'occupied') return;
    try {
      const res = await fetch(`/api/staff/counters/${counter.id}/occupy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        setSelectedCounter(counter);
        setStep('DASHBOARD');
        refreshDashboardData(counter.id, selectedDept.id);
      } else {
        const errorData = await res.json();
        alert(`Failed to occupy desk: ${errorData.message}`);
      }
    } catch (err) { console.error("Error occupying seat:", err); }
  };

  const refreshDashboardData = (counterId, queueId) => {
    fetch(`/api/staff/queue/${queueId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setUpcomingTickets(data.upcoming || []);
        setActiveTicket(data.active || null);
        setStats({ served: data.servedToday || 0, waiting: data.upcoming?.length || 0 });
      });
  };

  const handleCallNext = async () => {
    try {
      const res = await fetch('/api/staff/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ counterId: selectedCounter.id, queueId: selectedDept.id })
      });
      if (res.ok) refreshDashboardData(selectedCounter.id, selectedDept.id);
    } catch (err) { console.error(err); }
  };

  const handleComplete = async (status = 'completed') => {
    try {
      const res = await fetch('/api/staff/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ticketId: activeTicket.id, status })
      });
      if (res.ok) refreshDashboardData(selectedCounter.id, selectedDept.id);
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    if (selectedCounter) {
      await fetch(`/api/staff/counters/${selectedCounter.id}/release`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (step === 'DEPARTMENT') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-4xl w-full bg-card rounded-3xl shadow-xl p-10 md:p-14 border border-borderline">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-content-primary mb-3 tracking-tight">QueueEase Staff Portal</h1>
            <p className="text-content-secondary text-lg">Select your working department to begin the shift.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {departments.map(dept => (
              <div 
                key={dept.id} 
                onClick={() => handleSelectDepartment(dept)}
                className="group flex items-center p-6 bg-card border border-borderline rounded-2xl hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center mr-5 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Grid size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-content-primary mb-1 tracking-tight">{dept.name}</h3>
                  <p className="text-sm text-content-muted font-medium">Connect to available desks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'SEAT') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-4xl w-full bg-card rounded-3xl shadow-xl p-10 md:p-14 border border-borderline">
          <button onClick={() => setStep('DEPARTMENT')} className="text-content-secondary font-bold mb-8 hover:text-primary flex items-center gap-2 transition-colors bg-background px-4 py-2 rounded-lg border border-borderline w-max">
            ← Back to Departments
          </button>
          <div className="mb-12 border-b border-borderline pb-8">
            <h2 className="text-4xl font-extrabold text-content-primary mb-2 tracking-tight">{selectedDept.name} Counters</h2>
            <p className="text-content-secondary text-lg">Claim an available counter for this session.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {counters.map(c => {
              const isOccupied = c.status === 'occupied';
              return (
                <div 
                  key={c.id} 
                  onClick={() => handleSelectSeat(c)}
                  className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${
                    isOccupied 
                      ? 'border-borderline bg-background text-content-muted cursor-not-allowed opacity-70' 
                      : 'border-borderline bg-card hover:border-primary hover:shadow-md hover:-translate-y-1 cursor-pointer group'
                  }`}
                >
                  <Building2 size={48} strokeWidth={1.5} className={`mb-5 ${isOccupied ? 'text-content-muted/50' : 'text-primary group-hover:scale-110 transition-transform'}`} />
                  <h3 className={`text-2xl font-bold mb-3 tracking-tight ${isOccupied ? 'text-content-muted' : 'text-content-primary'}`}>Counter {c.counter_number}</h3>
                  <span className={`px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full border ${
                    isOccupied ? 'bg-background border-borderline text-content-muted' : 'bg-success/10 border-success/30 text-success group-hover:bg-success group-hover:text-white transition-colors'
                  }`}>
                    {isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

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
                  <User size={22} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">QueueEase</h1>
              </div>
              <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="px-5 space-y-2">
              <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 bg-primary text-white shadow-md relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                <Home size={20} />
                <span className="font-semibold tracking-wide text-sm">Workspace</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-slate-400 hover:bg-slate-800 hover:text-white group">
                <Users size={20} className="group-hover:text-white transition-colors" />
                <span className="font-semibold tracking-wide text-sm">Queue ({upcomingTickets.length})</span>
              </a>
            </nav>
          </div>
          
          <div className="p-5 mb-4">
            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 group border border-transparent">
              <LogOut size={20} className="group-hover:text-white transition-colors" />
              <span className="font-semibold tracking-wide text-sm">End Shift & Logout</span>
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
              <h2 className="text-2xl font-bold text-content-primary tracking-tight leading-tight">{selectedDept?.name}</h2>
              <p className="text-sm font-medium text-content-muted uppercase tracking-widest mt-0.5">Counter {selectedCounter?.counter_number}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-accent/10 text-accent rounded-full border border-accent/20">
              <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm font-bold tracking-wide">Receiving</span>
            </div>
            
            <div className="flex items-center gap-4 border-l border-borderline pl-6">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-content-primary tracking-wide">{user?.name}</p>
                <p className="text-xs text-content-muted font-medium uppercase tracking-wider">Staff</p>
              </div>
              <div className="w-11 h-11 bg-background border border-borderline rounded-full flex items-center justify-center text-primary font-bold uppercase">
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            <div className="xl:col-span-2 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Ticket */}
                <div className="bg-card p-8 rounded-3xl border border-borderline shadow-sm flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                      <Users size={20} />
                    </div>
                    <span className="font-bold text-content-muted uppercase tracking-widest text-xs">Currently Serving</span>
                  </div>
                  
                  {activeTicket ? (
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-6xl font-black text-content-primary mb-6 tracking-tighter">
                        {selectedDept.code.charAt(0)}{activeTicket.token_number}
                      </h3>
                      <div className="space-y-4 mb-8 flex-grow">
                        <div className="bg-background p-4 rounded-xl border border-borderline">
                           <p className="text-xs text-content-muted uppercase tracking-widest font-bold mb-1">Customer</p>
                           <p className="font-semibold text-content-primary text-lg">{activeTicket.customer_name}</p>
                        </div>
                        <div className="bg-background p-4 rounded-xl border border-borderline">
                           <p className="text-xs text-content-muted uppercase tracking-widest font-bold mb-1">Time Called</p>
                           <p className="font-semibold text-content-primary text-lg">{new Date(activeTicket.called_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-auto">
                        <button onClick={() => handleComplete('completed')} className="flex-1 bg-success hover:bg-success/90 text-white py-3.5 rounded-xl font-bold transition-all text-lg">
                          Complete
                        </button>
                        <button onClick={() => handleComplete('no_show')} className="flex-1 bg-card border border-borderline hover:border-primary hover:bg-background text-content-primary py-3.5 rounded-xl font-bold transition-all text-lg">
                          Skip
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-grow py-12 text-center">
                       <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 border border-borderline">
                         <CheckSquare size={32} className="text-content-muted opacity-50" />
                       </div>
                       <p className="text-xl font-bold text-content-primary mb-2 tracking-tight">Ready for Next</p>
                       <p className="text-content-muted font-medium">Your counter is currently idle.</p>
                    </div>
                  )}
                </div>

                {/* Next Token */}
                <div className="bg-card p-8 rounded-3xl border border-borderline shadow-sm flex flex-col relative overflow-hidden">

                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-background border border-borderline text-content-secondary rounded-xl">
                      <User size={20} />
                    </div>
                    <span className="font-bold text-content-muted uppercase tracking-widest text-xs">Up Next</span>
                  </div>
                  
                  {upcomingTickets.length > 0 ? (
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-5xl font-extrabold text-content-secondary mb-6 tracking-tighter">
                         {selectedDept.code.charAt(0)}{upcomingTickets[0].token_number}
                      </h3>
                      <div className="space-y-4 mb-8 flex-grow">
                        <div className="bg-background p-4 rounded-xl border border-borderline">
                           <p className="text-xs text-content-muted uppercase tracking-widest font-bold mb-1">Customer</p>
                           <p className="font-semibold text-content-primary text-lg">{upcomingTickets[0].customer_name}</p>
                        </div>
                        <div className="bg-background p-4 rounded-xl border border-borderline">
                           <p className="text-xs text-content-muted uppercase tracking-widest font-bold mb-1">Waiting Pool</p>
                           <p className="font-semibold text-content-primary text-lg">{upcomingTickets.length} people</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCallNext}
                        disabled={!!activeTicket}
                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-lg ${
                           activeTicket ? 'bg-background border border-borderline text-content-muted cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white shadow-sm'
                        }`}
                      >
                        <BellRing size={22} strokeWidth={2.5} />
                        Call Next Person
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-grow py-12 text-center">
                       <p className="text-xl font-bold text-content-primary mb-2 tracking-tight">Queue is Empty</p>
                       <p className="text-content-muted font-medium mb-8">Everyone has been served!</p>
                       <button 
                         onClick={() => refreshDashboardData(selectedCounter.id, selectedDept.id)}
                         className="px-6 py-2.5 border-2 border-borderline rounded-xl font-bold hover:bg-background hover:border-primary text-content-secondary transition-colors"
                       >
                         Refresh Status
                       </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Queue Table */}
              <div className="bg-card rounded-3xl border border-borderline shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-borderline bg-background flex justify-between items-center">
                  <h3 className="text-lg font-bold text-content-primary tracking-tight">Upcoming Tickets</h3>
                  <button onClick={() => refreshDashboardData(selectedCounter.id, selectedDept.id)} className="text-sm text-primary font-bold hover:underline tracking-wide uppercase">
                     Refresh List
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-background border-b border-borderline text-content-muted text-xs uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-8 py-4">#</th>
                        <th className="px-8 py-4">Token</th>
                        <th className="px-8 py-4">Customer</th>
                        <th className="px-8 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderline">
                      {upcomingTickets.map((t, index) => (
                        <tr key={t.id} className="hover:bg-background transition-colors group">
                          <td className="px-8 py-5 text-content-muted font-medium">{index + 1}</td>
                          <td className="px-8 py-5 font-extrabold text-content-primary group-hover:text-primary transition-colors">{selectedDept.code.charAt(0)}{t.token_number}</td>
                          <td className="px-8 py-5 text-content-secondary font-medium">{t.customer_name}</td>
                          <td className="px-8 py-5"><span className="text-warning bg-warning/10 border border-warning/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Waiting</span></td>
                        </tr>
                      ))}
                      {upcomingTickets.length === 0 && (
                        <tr>
                           <td colSpan="4" className="px-8 py-12 text-center text-content-muted font-medium">No one is waiting in the queue right now.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column Stats */}
            <div className="space-y-8">
              <div className="bg-card p-8 rounded-3xl border border-borderline shadow-sm">
                
                <h3 className="text-xl font-bold text-content-primary mb-8 tracking-tight">Shift Statistics</h3>
                
                <div className="space-y-6">
                  <div className="bg-background p-5 rounded-2xl border border-borderline flex items-center justify-between">
                    <div className="flex items-center gap-4 text-content-muted">
                      <div className="p-3 bg-card border border-borderline text-success rounded-xl"><CheckCircle2 size={20} /></div>
                      <span className="font-bold tracking-wide text-content-secondary">Served</span>
                    </div>
                    <span className="text-3xl font-black text-content-primary">{stats.served}</span>
                  </div>
                  
                  <div className="bg-background p-5 rounded-2xl border border-borderline flex items-center justify-between">
                    <div className="flex items-center gap-4 text-content-muted">
                      <div className="p-3 bg-card border border-borderline text-warning rounded-xl"><Users size={20} /></div>
                      <span className="font-bold tracking-wide text-content-secondary">Waiting</span>
                    </div>
                    <span className="text-3xl font-black text-warning">{stats.waiting}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
