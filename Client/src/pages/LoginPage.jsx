import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Shield, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [role, setRole] = useState('User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const roles = [
    { id: 'User', icon: User },
    { id: 'Staff', icon: Briefcase },
    { id: 'Admin', icon: Shield },
  ];

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !emailRegex.test(val)) setEmailError('Please enter a valid email address.');
    else setEmailError('');
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      
      {/* Left Column - Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-white p-16 flex-col justify-between relative overflow-hidden shadow-2xl z-10">
        
        <div className="relative z-10 max-w-lg mt-20">
          <h2 className="mb-12 text-5xl font-bold leading-tight text-white">
            Manage<br />Queues<br /><span className="text-primary">Smarter</span>
          </h2>
          
          <div className="space-y-6 text-lg text-slate-300">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <span>Save time on campus</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <span>Real-time tracking</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <span>Frictionless student experience</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <span>Enterprise-grade security</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pb-10">
          <p className="text-xl italic font-medium text-slate-400">
            "Technology that respects your time."
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex flex-col justify-center w-full max-w-md px-8 py-12 mx-auto lg:w-1/2 lg:max-w-none lg:px-16 xl:px-24 bg-background">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-primary rounded-lg shadow-sm">
            <User size={20} />
          </div>
          <h1 className="text-2xl font-bold text-content-primary">QueueEase</h1>
        </div>
        <p className="mb-10 text-sm text-content-secondary">University Queue Management System</p>

        {/* Role Switcher */}
        <div className="flex p-1 mb-8 bg-card border border-borderline rounded-lg shadow-sm">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                role === r.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-content-secondary hover:bg-background hover:text-content-primary'
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>

        {/* Welcome Text */}
        <h2 className="mb-2 text-3xl font-extrabold text-content-primary">Welcome Back</h2>
        <p className="mb-8 text-content-muted">Login to your {role.toLowerCase()} account</p>

        {/* Form */}
        <form 
          className="space-y-6" 
          onSubmit={async (e) => {
            e.preventDefault();
            
            if (emailError) {
              setError("Please fix the validation errors before submitting.");
              return;
            }

            setError('');
            setLoading(true);

            try {
              const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
              });

              const data = await res.json();

              if (!res.ok) throw new Error(data.message || 'Login failed');

              if (rememberMe) localStorage.setItem('rememberedEmail', email);
              else localStorage.removeItem('rememberedEmail');

              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));

              if (role === 'Admin') navigate('/admin');
              else if (role === 'Staff') navigate('/staff');
              else navigate('/dashboard');

            } catch (err) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          {error && (
            <div className="p-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg font-medium">
              {error}
            </div>
          )}
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-content-muted" />
              </div>
              <input
                type="text"
                placeholder="Email or Student ID"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full py-3 pl-10 pr-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-card text-content-primary placeholder-content-muted shadow-sm ${
                  emailError ? 'border-danger' : 'border-borderline'
                }`}
              />
            </div>
            {emailError && (
              <p className="mt-1.5 text-sm text-danger font-medium">{emailError}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-content-muted" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-3 pl-10 pr-10 border border-borderline bg-card text-content-primary placeholder-content-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-content-muted hover:text-content-primary focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary bg-card border-borderline rounded focus:ring-primary cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-content-secondary cursor-pointer hover:text-content-primary font-medium">
                Remember me
              </label>
            </div>
            <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm font-bold text-primary hover:text-primary-hover">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-white font-bold transition-all bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Log in'}
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-content-secondary font-medium">
          New to QueueEase?{' '}
          <button type="button" onClick={() => navigate('/register')} className="font-bold text-primary hover:text-primary-hover">
            Create an account
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-sidebar/60 backdrop-blur-sm p-4">
           <div className="bg-card rounded-2xl p-8 max-w-md w-full shadow-2xl border border-borderline">
              <h2 className="text-2xl font-bold text-content-primary mb-2">Reset Password</h2>
              <p className="text-content-secondary mb-6">Enter your email address and we'll send you a link to reset your password.</p>

              {forgotStatus ? (
                 <div className="p-4 mb-6 text-sm text-success bg-success/10 border border-success/20 rounded-lg font-medium">
                    {forgotStatus}
                 </div>
              ) : (
                 <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full py-3 px-4 mb-6 border border-borderline bg-background text-content-primary placeholder-content-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
                 />
              )}

              <div className="flex gap-3">
                 <button
                    onClick={() => { setShowForgotModal(false); setForgotStatus(''); setForgotEmail(''); }}
                    className="flex-1 py-3 text-content-primary bg-card border border-borderline hover:bg-background hover:border-primary rounded-lg font-bold transition-all"
                 >
                    Close
                 </button>
                 {!forgotStatus && (
                   <button
                      onClick={() => {
                        if(forgotEmail) setForgotStatus('A password reset link has been sent to ' + forgotEmail);
                      }}
                      className="flex-1 py-3 text-white font-bold bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-sm"
                   >
                      Send Link
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
