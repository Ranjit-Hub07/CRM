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
    <div className="bg-[#faf8ff] min-h-screen flex items-center justify-center font-body-md text-[#131b2e]">
      <div
        className="w-full max-w-[1200px] flex rounded-xl overflow-hidden bg-white mx-6"
        style={{ boxShadow: '0px 10px 15px -3px rgba(15,23,42,0.1)', height: '700px' }}
      >
        {/* Login Form Side */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-[400px] w-full mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#3525cd] rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
              </div>
              <span className="text-[#3525cd] font-bold" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '30px' }}>
                SalesForce Pro
              </span>
            </div>

            {/* Headings */}
            <h1 className="text-[#131b2e] font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '30px' }}>
              Welcome back
            </h1>
            <p className="text-[#464555] mb-6" style={{ fontFamily: 'Inter', fontSize: '16px' }}>
              Sign in to continue to your CRM.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-[#ffdad6] text-[#93000a] rounded-lg text-sm flex items-center gap-2" style={{ fontFamily: 'Inter' }}>
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[#131b2e] font-semibold text-xs mb-1" htmlFor="email"
                  style={{ fontFamily: 'Inter', letterSpacing: '0.05em' }}>
                  Email
                </label>
                <input
                  id="email"
                  className="w-full rounded-lg border border-[#c7c4d8] px-4 py-2 text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] focus:outline-none transition-all"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontFamily: 'Inter' }}
                  required
                />
              </div>

              <div>
                <label className="block text-[#131b2e] font-semibold text-xs mb-1" htmlFor="password"
                  style={{ fontFamily: 'Inter', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    className="w-full rounded-lg border border-[#c7c4d8] px-4 py-2 text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] focus:outline-none transition-all pr-10"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ fontFamily: 'Inter' }}
                    required
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#464555] hover:text-[#3525cd] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input className="rounded text-[#3525cd] focus:ring-[#3525cd] border-[#c7c4d8]" type="checkbox" />
                  <span className="text-sm text-[#464555]" style={{ fontFamily: 'Inter' }}>Remember me</span>
                </label>
                <a className="text-sm text-[#3525cd] hover:underline transition-colors" href="#">Forgot password?</a>
              </div>

              <button
                className="w-full bg-[#3525cd] text-white font-semibold text-xs rounded-lg py-3 mt-6 hover:bg-[#3323cc] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
                style={{ fontFamily: 'Inter', letterSpacing: '0.05em' }}
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
            <div className="mt-6 p-3 bg-[#f2f3ff] border border-[#c7c4d8] rounded-lg">
              <p className="text-xs text-[#464555] font-semibold mb-1.5" style={{ fontFamily: 'Inter' }}>Demo Credentials:</p>
              <div className="space-y-1 text-xs text-[#464555]" style={{ fontFamily: 'Inter' }}>
                <p><span className="text-[#3525cd] font-medium">Admin:</span> admin@nexuscrm.com / admin123</p>
                <p><span className="text-[#3525cd] font-medium">Manager:</span> james@nexuscrm.com / manager123</p>
                <p><span className="text-[#3525cd] font-medium">Executive:</span> maria@nexuscrm.com / exec123</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-[#464555]" style={{ fontFamily: 'Inter' }}>
                Don't have an account?{' '}
                <a className="text-[#3525cd] hover:underline" href="#">Contact Sales</a>
              </p>
            </div>
          </div>
        </div>

        {/* Illustration Side */}
        <div className="hidden lg:block w-1/2 relative bg-[#f2f3ff] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-multiply"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyIb6wDP0ivhORjNIPvwwyQTvx8Op8ar38KRnHHtRZNZC0095rOR-PBQZpE2NfMADJFE3bFkbd7E3xNZc11qUYMsIXiKWMMQ45y4c1gMU-3CjMC-7dnTmtnzC-J1MT0NFDXJIHAU8KZiTyKrvbhLTnEHqpfPScmrBSfzTc5GwAC1mtD-joC1lClthfr4ov0OYxBgwERK3bkSvheVWhy08ZcSU-Z8qCmILoEytpJCOaKQf0Lsfz4pQ')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#3525cd]/10 to-transparent"></div>
          <div
            className="absolute bottom-10 left-10 right-10 bg-white/80 backdrop-blur-md p-6 rounded-xl border border-[#c7c4d8]"
            style={{ boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' }}
          >
            <p className="font-semibold text-[#131b2e] mb-2" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>
              "SalesForce Pro has completely transformed our revenue pipeline operations."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold">
                PS
              </div>
              <div>
                <p className="font-semibold text-[#131b2e] text-xs" style={{ fontFamily: 'Inter', letterSpacing: '0.05em' }}>Priya Sharma</p>
                <p className="text-[#464555] text-xs" style={{ fontFamily: 'Inter' }}>VP of Sales, TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
