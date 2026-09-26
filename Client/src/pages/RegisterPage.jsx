import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !emailRegex.test(val)) setEmailError('Invalid email address.');
    else setEmailError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (emailError) return setError("Please fix the validation errors.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'User' })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans flex-col-reverse lg:flex-row">
      
      {/* Left Column - Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-white p-16 flex-col justify-between relative overflow-hidden shadow-2xl z-10">
        
        <div className="relative z-10 max-w-lg mt-20">
          <h2 className="mb-12 text-5xl font-bold leading-tight text-white">
            Join<br />QueueEase<br /><span className="text-primary">Today</span>
          </h2>
          <div className="space-y-6 text-lg text-slate-300">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <span>Create an account instantly</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <span>Generate tokens on the go</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <span>Track waiting times securely</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 pb-10">
          <p className="text-xl italic font-medium text-slate-400">
            "Streamlining campus services."
          </p>
        </div>
      </div>

      {/* Right Column - Register Form */}
      <div className="flex flex-col justify-center w-full max-w-md px-8 py-12 mx-auto lg:w-1/2 lg:max-w-none lg:px-16 xl:px-24 bg-background">
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 text-white bg-primary rounded-lg shadow-sm">
            <User size={20} />
          </div>
          <h1 className="text-2xl font-bold text-content-primary">QueueEase</h1>
        </div>

        <h2 className="mb-2 mt-8 text-3xl font-extrabold text-content-primary">Create an Account</h2>
        <p className="mb-8 text-content-muted">Enter your details to sign up as a student/user</p>

        <form className="space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="p-4 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg font-medium">
              {error}
            </div>
          )}
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-5 h-5 text-content-muted" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full py-3 pl-10 pr-3 border border-borderline bg-card text-content-primary placeholder-content-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-content-muted" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full py-3 pl-10 pr-3 border bg-card text-content-primary placeholder-content-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm ${
                  emailError ? 'border-danger' : 'border-borderline'
                }`}
              />
            </div>
            {emailError && <p className="mt-1.5 text-sm text-danger font-medium">{emailError}</p>}
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
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-content-muted" />
              </div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full py-3 pl-10 pr-3 border border-borderline bg-card text-content-primary placeholder-content-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-white font-bold transition-all bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-content-secondary font-medium">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-bold text-primary hover:text-primary-hover">
            Log in here
          </button>
        </p>
      </div>

    </div>
  );
};

export default RegisterPage;
