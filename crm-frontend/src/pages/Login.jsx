import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/', { replace: true });
      } else if (mode === 'register') {
        await signUp(email, password, fullName);
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
        setMode('login');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccess('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const titles = {
    login: { heading: 'Đăng nhập', sub: 'Chào mừng trở lại. Nhập thông tin để tiếp tục.' },
    register: { heading: 'Tạo tài khoản', sub: 'Điền thông tin để đăng ký tài khoản mới.' },
    forgot: { heading: 'Quên mật khẩu', sub: 'Nhập email để nhận link đặt lại mật khẩu.' },
  };

  return (
    <div className="min-h-screen flex bg-[#F9F5EE]">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #3F2A00 0%, #7b5800 50%, #C89A3D 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 border-[40px] border-white"></div>
        <div className="absolute bottom-32 -left-20 w-72 h-72 rounded-full opacity-10 border-[30px] border-white"></div>
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full opacity-5 bg-white"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">Vĩnh Hưng Heritage</h1>
            <p className="text-white/60 text-xs">Premium CRM System</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight tracking-tight">
              Quản lý kinh doanh<br />
              <span className="text-[#F1BF5E]">thông minh hơn</span>
            </h2>
            <p className="text-white/70 mt-4 text-base leading-relaxed">
              Hệ thống CRM chuyên nghiệp dành riêng cho ngành yến sào. Theo dõi khách hàng, cơ hội bán hàng và doanh thu trong một nền tảng duy nhất.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              'Kanban bán hàng trực quan, kéo-thả dễ dàng',
              'Phân quyền 3 cấp: Admin, Trưởng nhóm, Sales',
              'Báo cáo doanh thu theo thời gian thực',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F1BF5E]/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#F1BF5E]" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2026 Yến Sào Vĩnh Hưng. Premium Bird's Nest Products.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-[#C89A3D]/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#C89A3D] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <div>
              <h1 className="text-[#1f1b15] font-bold text-lg leading-tight">Vĩnh Hưng Heritage</h1>
              <p className="text-[#8B8375] text-xs">Premium CRM</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1f1b15] mb-1">{titles[mode].heading}</h2>
            <p className="text-sm text-[#8B8375]">{titles[mode].sub}</p>
          </div>

          {/* Error / Success alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Google SSO — chỉ hiện ở login */}
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white border border-[#E3D7C8] hover:border-[#C89A3D] rounded-xl py-3 text-sm font-medium text-[#1f1b15] transition-all duration-200 shadow-sm hover:shadow-md mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Tiếp tục với Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-[#E3D7C8]"></div>
                <span className="text-xs text-[#8B8375]">hoặc đăng nhập bằng email</span>
                <div className="flex-1 h-px bg-[#E3D7C8]"></div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name — chỉ hiện khi đăng ký */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#4f4637] mb-1.5">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8375]" size={16} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E3D7C8] rounded-xl text-sm text-[#1f1b15] placeholder-[#C0B8AC] focus:outline-none focus:border-[#C89A3D] focus:ring-2 focus:ring-[#C89A3D]/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#4f4637] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8375]" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@yensaovinhung.vn"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E3D7C8] rounded-xl text-sm text-[#1f1b15] placeholder-[#C0B8AC] focus:outline-none focus:border-[#C89A3D] focus:ring-2 focus:ring-[#C89A3D]/20 transition-all"
                />
              </div>
            </div>

            {/* Password — ẩn khi quên mật khẩu */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-[#4f4637]">Mật khẩu</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} className="text-xs text-[#C89A3D] hover:underline">
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8375]" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-[#E3D7C8] rounded-xl text-sm text-[#1f1b15] placeholder-[#C0B8AC] focus:outline-none focus:border-[#C89A3D] focus:ring-2 focus:ring-[#C89A3D]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B8375] hover:text-[#4f4637] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C89A3D] hover:bg-[#b08735] text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                { login: 'Đăng nhập', register: 'Tạo tài khoản', forgot: 'Gửi email đặt lại' }[mode]
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="text-center mt-8 space-y-2">
            {mode === 'login' && (
              <p className="text-xs text-[#8B8375]">
                Chưa có tài khoản?{' '}
                <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className="text-[#C89A3D] hover:underline font-medium">
                  Đăng ký
                </button>
              </p>
            )}
            {(mode === 'register' || mode === 'forgot') && (
              <p className="text-xs text-[#8B8375]">
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-[#C89A3D] hover:underline font-medium">
                  ← Quay lại đăng nhập
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
