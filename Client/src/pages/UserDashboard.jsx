import { useState, useEffect } from 'react';
import { 
  Home, Ticket, Grid, Activity, User, Bell, LogOut, Search,
  GraduationCap, CreditCard, FileText, Building2, BookOpen, MoreHorizontal, CheckCircle2,
  Menu, X, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const SidebarItem = ({ icon: Icon, text, active, hasNotification }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
    active ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>}
    <div className="relative">
      <Icon size={20} className={`transition-colors duration-300 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
      {hasNotification && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-sidebar"></span>
      )}
    </div>
    <span className={`font-semibold tracking-wide text-sm ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{text}</span>
  </a>
);

const getQueueStyling = (code) => {
  const styles = {
    ACAD: { icon: GraduationCap },
    FEE: { icon: CreditCard },
    DOC: { icon: FileText },
    ADMIN: { icon: Building2 },
    EXAM: { icon: BookOpen },
  };
  return styles[code] || { icon: MoreHorizontal };
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetch('/api/queues')
      .then(res => res.json())
      .then(data => { setQueues(data.queues || []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const handleGenerateToken = async (queue) => {
    if (!user) { navigate('/login'); return; }
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/queues/${queue.id}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: user.name })
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedToken({
          ...data.token, queueName: queue.name,
          estimatedWaitMinutes: data.estimatedWaitMinutes, position: data.position
        });
        setSelectedQueue(null);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2563EB', '#14B8A6', '#1E40AF'] });
      } else alert(data.message);
    } catch (err) { alert("Error generating token"); } 
    finally { setIsGenerating(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background font-sans relative overflow-hidden text-content-primary">

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-content-primary/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 bg-sidebar border-none
        transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
      `}>
        <div className="w-72 flex flex-col h-full justify-between">
          <div>
            <div className="p-8 flex items-center justify-between">
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
            <nav className="px-5 mt-4 space-y-2">
              <SidebarItem icon={Home} text="Dashboard" active />
              <SidebarItem icon={Ticket} text="My Tokens" />
              <SidebarItem icon={Grid} text="Services" />
              <SidebarItem icon={Activity} text="Live Queue" />
              <SidebarItem icon={User} text="Profile" />
              <SidebarItem icon={Bell} text="Notifications" hasNotification />
            </nav>
          </div>
          
          <div className="p-5 mb-4">
            <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 group border border-transparent">
               <LogOut size={20} className="text-slate-400 group-hover:text-white transition-colors" />
               <span className="font-semibold tracking-wide text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        
        {/* Header */}
        <header className="sticky top-0 z-20 bg-card border-b border-borderline px-6 md:px-10 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center w-full max-w-2xl">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-6 text-content-secondary hover:text-content-primary transition-colors md:hidden">
              <Menu size={24} />
            </button>
            <div className="relative w-full max-w-md hidden md:block group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-content-muted group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search services..." 
                className="w-full pl-11 pr-4 py-2.5 border border-borderline rounded-full bg-background text-content-primary placeholder-content-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <button className="text-content-secondary hover:text-primary transition-colors relative">
              <Bell size={22} />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-card"></span>
            </button>
            <div className="flex items-center gap-4 border-l border-borderline pl-6">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-content-primary tracking-wide">{user?.name}</p>
                <p className="text-xs text-content-secondary font-medium uppercase tracking-wider">{user?.role || 'User'}</p>
              </div>
              <div className="w-11 h-11 bg-background border border-borderline rounded-full flex items-center justify-center text-primary font-bold uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-content-primary flex items-center gap-2 tracking-tight">
              Good Morning, {user?.name ? user.name.split(' ')[0] : 'there'}!
            </h2>
            <p className="text-content-secondary mt-2 text-lg">What would you like to do today?</p>
          </div>

          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-borderline border-t-primary rounded-full animate-spin"></div>
                <p className="text-content-muted font-medium">Loading live queues...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {queues.map(queue => {
                const styling = getQueueStyling(queue.code);
                const Icon = styling.icon;
                const waitTime = queue.waiting_count * queue.average_service_minutes;

                return (
                  <div 
                    key={queue.id}
                    onClick={() => setSelectedQueue(queue)}
                    className={`group flex flex-col p-6 bg-card border border-borderline rounded-2xl hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-5 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon size={26} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-content-primary mb-2 tracking-tight">{queue.name}</h3>
                    <p className="text-sm text-content-muted mb-6 flex-grow font-medium">
                      Currently {queue.waiting_count} people waiting.
                    </p>
                    <div className="inline-flex items-center self-start px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-warning bg-warning/10 border border-warning/20 rounded-full group-hover:bg-warning group-hover:text-white group-hover:border-warning transition-colors">
                      <span className="w-1.5 h-1.5 bg-current rounded-full mr-2 opacity-80"></span>
                      ~ {waitTime} min wait
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Banner */}
          <div className="bg-card border border-borderline rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-sm">
            <div className="z-10 mb-6 md:mb-0">
              <div className="flex items-center gap-2 mb-3">
                 <Sparkles size={20} className="text-primary" />
                 <span className="text-primary font-bold tracking-widest uppercase text-xs">Premium Experience</span>
              </div>
              <h3 className="text-3xl font-extrabold text-content-primary mb-2 tracking-tight">Your time is valuable.</h3>
              <p className="text-content-secondary text-lg max-w-md leading-relaxed">Join a queue, track your token on your phone, and get notified in real-time.</p>
            </div>
            <div className="z-10 text-left md:text-right border-l-2 border-borderline pl-0 md:pl-10">
               <h3 className="text-3xl font-extrabold text-content-secondary mb-1 tracking-tight">Less waiting.</h3>
               <h3 className="text-4xl font-black text-primary tracking-tight">More doing.</h3>
            </div>
          </div>
        </div>
      </main>

      {/* Join Queue Modal */}
      {selectedQueue && !generatedToken && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-content-primary/40 backdrop-blur-sm p-4">
           <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-borderline transform transition-all">
              <h2 className="text-3xl font-bold text-content-primary mb-2 tracking-tight">Join Queue</h2>
              <p className="text-content-secondary mb-8 text-lg">Generate a token for <strong className="text-content-primary">{selectedQueue.name}</strong>?</p>
              
              <div className="bg-background rounded-2xl p-5 mb-8 border border-borderline">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-content-secondary font-medium">People waiting</span>
                    <span className="font-bold text-xl text-content-primary">{selectedQueue.waiting_count}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-content-secondary font-medium">Estimated wait</span>
                    <span className="font-bold text-xl text-warning">~ {selectedQueue.waiting_count * selectedQueue.average_service_minutes} mins</span>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setSelectedQueue(null)} disabled={isGenerating} className="flex-1 py-3.5 text-content-primary bg-card hover:bg-background border border-borderline hover:border-primary rounded-xl font-bold transition-all">
                    Cancel
                 </button>
                 <button onClick={() => handleGenerateToken(selectedQueue)} disabled={isGenerating} className="flex-1 py-3.5 text-white bg-primary hover:bg-primary-hover rounded-xl font-bold transition-all">
                    {isGenerating ? 'Generating...' : 'Confirm'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Success Token Modal */}
      {generatedToken && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-content-primary/40 backdrop-blur-sm p-4">
           <div className="bg-card rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border-t-8 border-success relative overflow-hidden">
              <div className="mx-auto w-20 h-20 bg-success/10 border-2 border-success/20 text-success rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-extrabold text-content-primary mb-2 tracking-tight">Success!</h2>
              <p className="text-content-secondary mb-8">Your token is ready.</p>
              
              <div className="border border-borderline rounded-2xl p-6 mb-8 bg-background relative overflow-hidden">
                 <p className="text-xs font-bold text-content-muted tracking-widest uppercase mb-2">Your Token</p>
                 <h1 className="text-6xl font-black text-primary mb-6 tracking-tighter">{generatedToken.queueName.charAt(0)}{generatedToken.token_number}</h1>
                 
                 <div className="space-y-3 text-sm text-left border-t border-borderline pt-5 mt-2">
                    <div className="flex justify-between items-center">
                       <span className="text-content-secondary font-medium">Service</span>
                       <span className="font-bold text-content-primary">{generatedToken.queueName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-content-secondary font-medium">People Ahead</span>
                       <span className="font-bold text-content-primary bg-borderline/50 px-2 py-0.5 rounded-md">{generatedToken.position}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-content-secondary font-medium">Estimated Wait</span>
                       <span className="font-extrabold text-warning">~ {generatedToken.estimatedWaitMinutes} min</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setGeneratedToken(null)} className="flex-1 py-3.5 text-content-primary bg-card hover:bg-background border border-borderline hover:border-primary rounded-xl font-bold transition-all">
                    Close
                 </button>
                 <button onClick={() => { setGeneratedToken(null); navigate('/tokens'); }} className="flex-1 py-3.5 text-white bg-primary hover:bg-primary-hover rounded-xl font-bold transition-all">
                    Live Queue
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
