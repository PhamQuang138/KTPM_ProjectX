import {Link} from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function Footer({hideLogo}: {hideLogo?: boolean}) {
  return (
    <footer className={`${hideLogo ? 'mt-0 border-t-0 p-0 bg-transparent' : 'mt-64 bg-surface-container-lowest border-t border-outline-variant/20 shadow-none'} transition-all duration-700`}>
      {!hideLogo && (
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-12 px-6 py-16 md:grid-cols-2 md:px-margin-desktop">
          <div className="space-y-6">
            <BrandLogo imageClassName="h-14 w-14" />
            <p className="max-w-sm text-sm leading-relaxed text-secondary opacity-80">
              Cộng đồng dành cho người yêu xe: chia sẻ bài viết, quản lý gara, mua bán và trao đổi trực tiếp.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Khám phá</p>
              <ul className="space-y-2">
                {[
                  {label: 'Cộng đồng', to: '/feed'},
                  {label: 'Chợ xe', to: '/market'},
                  {label: 'Gara', to: '/garage'},
                ].map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="inline-block font-mono text-xs uppercase text-secondary transition-all hover:translate-x-1 hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Tài khoản</p>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="inline-block font-mono text-xs uppercase text-secondary transition-all hover:translate-x-1 hover:text-primary">
                    Đăng nhập / đăng ký
                  </Link>
                </li>
                <li>
                  <Link to="/saved" className="inline-block font-mono text-xs uppercase text-secondary transition-all hover:translate-x-1 hover:text-primary">
                    Bài viết đã lưu
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className={`${hideLogo ? 'px-0 py-4 opacity-50' : 'px-6 md:px-margin-desktop py-8 border-t border-white/5'} mx-auto flex max-w-container-max flex-col items-center justify-between gap-4 md:flex-row`}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-secondary/60">
          © {new Date().getFullYear()} CarHub
        </p>
        {!hideLogo && (
          <div className="flex gap-8">
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Tiếng Việt</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Dữ liệu từ CarHub</span>
          </div>
        )}
      </div>
    </footer>
  );
}
