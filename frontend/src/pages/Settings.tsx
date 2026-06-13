import {FormEvent, type ReactNode, useEffect, useState} from 'react';
import {Bell, Bot, Check, LayoutGrid, Moon, RotateCcw, Save, Type} from 'lucide-react';
import {motion} from 'motion/react';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import {useSettingsStore, type UserSettings} from '../store/useSettingsStore';
import {useSidebarStore} from '../store/useSidebarStore';

export default function Settings() {
  const {isOpen} = useSidebarStore();
  const stored = useSettingsStore((state) => state.settings);
  const save = useSettingsStore((state) => state.save);
  const [form, setForm] = useState<UserSettings>(stored);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => setForm(stored), [stored]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      await save(form);
      setMessage('Đã lưu và áp dụng cài đặt.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể lưu cài đặt.');
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => setForm({
    themePreference: 'system',
    displayDensity: 'comfortable',
    fontScale: 'normal',
    autoOpenChatbot: false,
    notifySocial: true,
    notifyMarketplace: true,
    notifyMessages: true,
  });

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar />
      <motion.main
        animate={{marginLeft: isOpen ? '16rem' : '0rem', width: isOpen ? 'calc(100% - 16rem)' : '100%'}}
        className="w-full pb-24 transition-all duration-300 max-md:!ml-0 max-md:!w-full"
      >
        <TopNav title="Cài đặt" />
        <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6 px-5 py-8 md:px-12">
          <header>
            <h1 className="font-display text-4xl font-bold">Cá nhân hóa CarHub</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Các lựa chọn được đồng bộ theo tài khoản và áp dụng trên thiết bị đang dùng.</p>
          </header>

          <SettingsSection icon={Moon} title="Giao diện" description="Điều chỉnh màu sắc, mật độ và cỡ chữ.">
            <ChoiceRow
              label="Chủ đề"
              value={form.themePreference}
              options={[['system', 'Theo hệ thống'], ['dark', 'Tối'], ['light', 'Sáng']]}
              onChange={(value) => setForm({...form, themePreference: value as UserSettings['themePreference']})}
            />
            <ChoiceRow
              label="Mật độ hiển thị"
              value={form.displayDensity}
              options={[['comfortable', 'Thoải mái'], ['compact', 'Gọn']]}
              onChange={(value) => setForm({...form, displayDensity: value as UserSettings['displayDensity']})}
            />
            <ChoiceRow
              label="Cỡ chữ"
              value={form.fontScale}
              options={[['small', 'Nhỏ'], ['normal', 'Chuẩn'], ['large', 'Lớn']]}
              onChange={(value) => setForm({...form, fontScale: value as UserSettings['fontScale']})}
            />
          </SettingsSection>

          <SettingsSection icon={Bot} title="Trợ lý AI" description="Kiểm soát cách trợ lý xuất hiện khi đăng nhập.">
            <Toggle
              label="Tự động mở trợ lý"
              description="Mở cửa sổ tìm xe AI một lần khi bắt đầu phiên truy cập."
              checked={form.autoOpenChatbot}
              onChange={(checked) => setForm({...form, autoOpenChatbot: checked})}
            />
          </SettingsSection>

          <SettingsSection icon={Bell} title="Thông báo" description="Chỉ tạo những nhóm thông báo bạn muốn nhận.">
            <Toggle label="Tương tác cộng đồng" description="Lượt thích, bình luận và người theo dõi mới." checked={form.notifySocial} onChange={(checked) => setForm({...form, notifySocial: checked})} />
            <Toggle label="Chợ xe" description="Lượt lưu và bình luận trên tin bán xe." checked={form.notifyMarketplace} onChange={(checked) => setForm({...form, notifyMarketplace: checked})} />
            <Toggle label="Tin nhắn" description="Tin nhắn mới từ thành viên khác." checked={form.notifyMessages} onChange={(checked) => setForm({...form, notifyMessages: checked})} />
          </SettingsSection>

          {message && <p className="rounded-xl border border-white/10 bg-surface-container px-4 py-3 text-sm">{message}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={reset} className="btn-secondary"><RotateCcw className="h-4 w-4" /> Khôi phục mặc định</button>
            <button type="submit" disabled={isSaving} className="btn-primary"><Save className="h-4 w-4" /> {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}</button>
          </div>
        </form>
      </motion.main>
      <MobileNav />
    </div>
  );
}

function SettingsSection({icon: Icon, title, description, children}: {icon: typeof LayoutGrid; title: string; description: string; children: ReactNode}) {
  return (
    <section className="glass-card rounded-2xl p-6">
      <div className="mb-5 flex gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Icon className="h-5 w-5" /></div>
        <div><h2 className="font-display text-lg font-bold">{title}</h2><p className="text-xs text-on-surface-variant">{description}</p></div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ChoiceRow({label, value, options, onChange}: {label: string; value: string; options: [string, string][]; onChange: (value: string) => void}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Type className="h-4 w-4 text-primary" /> {label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(([option, text]) => (
          <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-xl border px-4 py-2 text-sm transition ${value === option ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 bg-surface-container text-on-surface-variant'}`}>
            {value === option && <Check className="mr-1 inline h-3.5 w-3.5" />}{text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({label, description, checked, onChange}: {label: string; description: string; checked: boolean; onChange: (checked: boolean) => void}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-white/10 bg-surface-container p-4">
      <span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-on-surface-variant">{description}</span></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-primary" />
    </label>
  );
}
