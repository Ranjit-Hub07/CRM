import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../store/apiSlice';
import { setCredentials } from '../store/authSlice';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: result.token, user: result.user }));
      navigate('/dashboard');
    } catch (err) {
      setError(err?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="bg-[#faf8ff] min-h-screen flex items-center justify-center font-body-md text-[#131b2e] p-4">
      <div
        className="w-full max-w-[480px] rounded-2xl bg-white p-8 sm:p-10 border border-[#e2e0ed]"
        style={{ boxShadow: '0px 10px 25px -5px rgba(15,23,42,0.08), 0px 8px 10px -6px rgba(15,23,42,0.04)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-[#3525cd] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#3525cd]/20">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
          </div>
          <span className="text-[#3525cd] font-bold text-2xl tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            SalesForce Pro
          </span>
        </div>

        {/* Headings */}
        <div className="text-center mb-6">
          <h1 className="text-[#131b2e] font-bold text-2xl mb-1.5" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Welcome back
          </h1>
          <p className="text-[#464555] text-sm" style={{ fontFamily: 'Inter' }}>
            Sign in to continue to your CRM account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3.5 bg-[#ffdad6] text-[#93000a] rounded-xl text-sm flex items-center gap-2.5" style={{ fontFamily: 'Inter' }}>
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[#131b2e] font-semibold text-xs mb-1.5" htmlFor="email"
              style={{ fontFamily: 'Inter', letterSpacing: '0.05em' }}>
              Email address
            </label>
            <input
              id="email"
              className="w-full rounded-xl border border-[#c7c4d8] px-4 py-2.5 text-sm focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 focus:outline-none transition-all"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontFamily: 'Inter' }}
              required
            />
          </div>

          <div>
            <label className="block text-[#131b2e] font-semibold text-xs mb-1.5" htmlFor="password"
              style={{ fontFamily: 'Inter', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                className="w-full rounded-xl border border-[#c7c4d8] px-4 py-2.5 text-sm focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 focus:outline-none transition-all pr-11"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontFamily: 'Inter' }}
                required
              />
              <button
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#464555] hover:text-[#3525cd] transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input className="rounded text-[#3525cd] focus:ring-[#3525cd] border-[#c7c4d8]" type="checkbox" />
              <span className="text-xs text-[#464555]" style={{ fontFamily: 'Inter' }}>Remember me</span>
            </label>
            <a className="text-xs text-[#3525cd] font-medium hover:underline transition-colors" href="#">Forgot password?</a>
          </div>

          <button
            className="w-full bg-[#3525cd] hover:bg-[#2e20b5] text-white font-semibold text-sm rounded-xl py-3 mt-2 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#3525cd]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
            style={{ fontFamily: 'Inter' }}
          >
            {isLoading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                Signing In…
              </>
            ) : (
              <>
                Sign In
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3.5 bg-[#f2f3ff] border border-[#c7c4d8]/60 rounded-xl">
          <p className="text-xs text-[#464555] font-semibold mb-2" style={{ fontFamily: 'Inter' }}>Click to autofill credentials:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setEmail('admin@nexuscrm.com'); setPassword('admin123'); setError(''); }}
              className="text-left p-2 rounded-lg bg-white border border-[#c7c4d8]/70 hover:border-[#3525cd] hover:bg-indigo-50/50 transition-all cursor-pointer"
            >
              <span className="block text-[11px] font-bold text-[#3525cd]">Admin</span>
              <span className="block text-[10px] text-[#464555] truncate">admin@...</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('rahul@nexuscrm.com'); setPassword('manager123'); setError(''); }}
              className="text-left p-2 rounded-lg bg-white border border-[#c7c4d8]/70 hover:border-[#3525cd] hover:bg-indigo-50/50 transition-all cursor-pointer"
            >
              <span className="block text-[11px] font-bold text-[#3525cd]">Manager</span>
              <span className="block text-[10px] text-[#464555] truncate">rahul@...</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('sneha@nexuscrm.com'); setPassword('exec123'); setError(''); }}
              className="text-left p-2 rounded-lg bg-white border border-[#c7c4d8]/70 hover:border-[#3525cd] hover:bg-indigo-50/50 transition-all cursor-pointer"
            >
              <span className="block text-[11px] font-bold text-[#3525cd]">Executive</span>
              <span className="block text-[10px] text-[#464555] truncate">sneha@...</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#464555]" style={{ fontFamily: 'Inter' }}>
            Don't have an account?{' '}
            <a className="text-[#3525cd] font-semibold hover:underline" href="#">Contact Sales</a>
          </p>
        </div>
      </div>
    </div>
  );
}
