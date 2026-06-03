import { Share2, Globe, Mail } from 'lucide-react';

export default function Footer({ hideLogo }: { hideLogo?: boolean }) {
  return (
    <footer className={`${hideLogo ? 'mt-0 border-t-0 p-0 bg-transparent' : 'mt-64 bg-surface-container-lowest border-t border-outline-variant/20 shadow-none'} transition-all duration-700`}>
      {!hideLogo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-6 md:px-margin-desktop py-16 max-w-container-max mx-auto">
          <div className="space-y-6">
            <h3 className="font-display text-3xl text-on-surface font-bold tracking-tighter">AUTOVISTA</h3>
            <p className="text-secondary text-sm max-w-sm font-sans opacity-80 leading-relaxed">
              Defining the future of luxury automotive trade through precision data and exclusive collector access.
            </p>
            <div className="flex space-x-4">
              <button className="text-on-surface-variant hover:text-primary transition-all hover:-translate-y-1">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-all hover:-translate-y-1">
                <Globe className="w-5 h-5" />
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-all hover:-translate-y-1">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Platform</p>
              <ul className="space-y-2">
                {['Heritage', 'Sustainability', 'Careers'].map((link) => (
                  <li key={link}>
                    <a href="#" className="font-mono text-xs uppercase text-secondary hover:text-primary transition-all inline-block hover:translate-x-1">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Legal</p>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service'].map((link) => (
                  <li key={link}>
                    <a href="#" className="font-mono text-xs uppercase text-secondary hover:text-primary transition-all inline-block hover:translate-x-1">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className={`${hideLogo ? 'px-0 py-4 opacity-50' : 'px-6 md:px-margin-desktop py-8 border-t border-white/5'} max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4`}>
        <p className="font-mono text-[9px] text-secondary/60 tracking-[0.2em] uppercase">
          © {new Date().getFullYear()} AUTOVISTA
        </p>
        {!hideLogo && (
          <div className="flex gap-8">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">ENGLISH (US)</span>
            <span className="font-mono text-[10px] text-on-surface-variant flex items-center gap-2 tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM: OK
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
