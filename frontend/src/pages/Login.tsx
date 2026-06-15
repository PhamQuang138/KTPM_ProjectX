import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'motion/react';
import {ArrowLeft, Eye, EyeOff} from 'lucide-react';
import {useAuthStore} from '../store/useAuthStore';
import {apiRequest} from '../lib/api';
import BrandLogo from '../components/BrandLogo';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRules = [
    {label: 'Trên 8 ký tự', valid: password.length > 8},
    {label: 'Có chữ in hoa', valid: /[A-Z]/.test(password)},
    {label: 'Có chữ thường', valid: /[a-z]/.test(password)},
    {label: 'Có chữ số', valid: /\d/.test(password)},
    {label: 'Có ký tự đặc biệt', valid: /[^A-Za-z0-9]/.test(password)},
  ];

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
    setPassword('');
    setConfirmPassword('');
    setResetCode('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Mật khẩu nhập lại không khớp.');
          return;
        }

        await signup({
          name,
          email,
          password,
          avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`,
        });
        navigate('/garage');
        return;
      }

      if (mode === 'login') {
        await login(email, password);
        navigate('/garage');
        return;
      }

      if (mode === 'forgot') {
        await apiRequest<{success: boolean; message: string}>('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({email}),
        });
        setMode('reset');
        setMessage('Mã OTP đã được gửi đến email của bạn. Nhập mã bên dưới để đổi sang mật khẩu mới.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Mật khẩu nhập lại không khớp.');
        return;
      }

      await apiRequest<{success: boolean}>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({email, code: resetCode, password}),
      });

      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setResetCode('');
      setMessage('Đã đặt lại mật khẩu. Vui lòng đăng nhập bằng mật khẩu mới.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hoàn tất yêu cầu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    mode === 'login'
      ? 'Đăng nhập'
      : mode === 'signup'
        ? 'Tạo tài khoản'
        : mode === 'forgot'
          ? 'Quên mật khẩu'
          : 'Đặt lại mật khẩu';

  const description =
    mode === 'login'
      ? 'Nhập thông tin để truy cập gara cá nhân.'
      : mode === 'signup'
        ? 'Tạo hồ sơ và bắt đầu chia sẻ với cộng đồng.'
        : mode === 'forgot'
          ? 'Nhập email tài khoản, hệ thống sẽ gửi mã OTP 6 chữ số.'
          : 'Nhập mã OTP từ email và chọn mật khẩu mới.';

  return (
    <main className="min-h-screen w-full flex overflow-hidden bg-background">
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-margin-desktop overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5kVwu5SHQh1PJ7LQNALeYFPKycpVdnwgjoVz_D1W2a4Y1YzJkFSvIV-fsKoORr_EwcgQrzeaIzMKThmwG9amhlv-uGXStiielaInrUbmcK_mTlPpCi_odlc-hW9_3I3fA92yBTyZe_OZnaLmgo8U36iaMVaZVom2Sy0EeVUsmSxr1Br_-5ghlmUQnA9HHp0PN-6hl1pM9FwbMw67sLMG_oDoClfyZTSHrcUeAPtU4x2zU8Mi0VOop-2L5g7ad-ZumbqnqUM7WgA"
            alt="Hình ảnh xe sang"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.5, duration: 1}}
          className="relative z-10 space-y-4 max-w-lg"
        >
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase">Dự án đam mê</span>
          </div>
          <h1 className="font-display text-5xl text-on-background tracking-tighter leading-tight">
            Kỹ thuật chuẩn xác. Trải nghiệm khác biệt.
          </h1>
          <p className="font-sans text-lg text-on-surface-variant/80 leading-relaxed">
            Không gian dành cho người yêu xe, nơi quản lý gara, chia sẻ câu chuyện và kết nối giao dịch.
          </p>
        </motion.div>
      </section>

      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-surface-container-lowest">
        <div className="w-full max-w-md flex flex-col space-y-10">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại khám phá
            </Link>

            <div className="flex items-center justify-between">
              <BrandLogo imageClassName="h-12 w-12" />
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="font-mono text-[10px] text-primary uppercase tracking-[0.2em] hover:underline hover:tracking-[0.3em] transition-all"
              >
                {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
              </button>
            </div>

            <h2 className="font-display text-3xl md:text-4xl text-on-surface uppercase tracking-tight">{title}</h2>
            <p className="font-sans text-sm text-on-surface-variant opacity-80">{description}</p>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-6">
              {mode === 'signup' && (
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container border-none border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface font-sans py-4 px-4 transition-all"
                    id="name"
                    placeholder="TÊN HIỂN THỊ"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
              )}

              <div className="relative group">
                <input
                  className="w-full bg-surface-container border-none border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface font-sans py-4 px-4 transition-all"
                  id="email"
                  placeholder={mode === 'login' ? 'EMAIL HOẶC TÊN ĐĂNG NHẬP' : 'ĐỊA CHỈ EMAIL'}
                  type={mode === 'login' ? 'text' : 'email'}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {mode === 'reset' && (
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container border-none border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface font-sans py-4 px-4 transition-all"
                    id="reset-code"
                    placeholder="Mã OTP 6 chữ số"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={resetCode}
                    onChange={(event) => setResetCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="block font-mono text-[8px] text-on-surface-variant uppercase tracking-widest">Bảo mật</span>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[10px] font-mono text-primary uppercase tracking-widest hover:text-on-primary-container transition-colors"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      className="w-full bg-surface-container border-none border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface font-sans py-4 pl-4 pr-12 transition-all"
                      id="password"
                      placeholder={mode === 'reset' ? 'MẬT KHẨU MỚI' : 'MẬT KHẨU'}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={mode === 'signup' || mode === 'reset' ? 9 : undefined}
                      maxLength={128}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {(mode === 'signup' || mode === 'reset') && (
                    <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {passwordRules.map((rule) => (
                        <span key={rule.label} className={`text-xs ${rule.valid ? 'text-green-400' : 'text-on-surface-variant'}`}>
                          {rule.valid ? '✓' : '○'} {rule.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(mode === 'signup' || mode === 'reset') && (
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container border-none border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface font-sans py-4 px-4 transition-all"
                    id="confirm-password"
                    placeholder={mode === 'signup' ? 'XÁC NHẬN MẬT KHẨU' : 'XÁC NHẬN MẬT KHẨU MỚI'}
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={9}
                    maxLength={128}
                    required
                  />

                  {confirmPassword.length > 0 && (
                    <p className={`mt-2 text-xs ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                      {password === confirmPassword ? '✓ Mật khẩu khớp' : '✕ Mật khẩu không khớp'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {message && <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>}
            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            <button
              className="relative overflow-hidden w-full py-5 bg-primary text-on-primary font-mono text-[10px] uppercase tracking-[0.3em] rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-primary/10 shimmer-effect disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Đang xử lý...'
                : mode === 'login'
                  ? 'Đăng nhập'
                  : mode === 'signup'
                    ? 'Tạo tài khoản'
                    : mode === 'forgot'
                      ? 'Gửi OTP'
                      : 'Đặt lại mật khẩu'}
            </button>

            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors"
              >
                Quay lại đăng nhập
              </button>
            )}
          </form>

          <div className="pt-8 flex justify-center">
            <p className="font-mono text-[9px] text-on-surface-variant/40 uppercase tracking-[0.4em]">
              © {new Date().getFullYear()} CarHub. Bảo lưu mọi quyền.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
