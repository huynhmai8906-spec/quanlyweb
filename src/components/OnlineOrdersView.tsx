import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  NursingBookingRow,
  ServiceOrderRow,
  TriageReportRow,
  PatientProfileRow,
} from '../types';

interface OnlineOrdersViewProps {
  onTriggerToast?: (title: string, desc: string, type: 'success' | 'warning' | 'emergency') => void;
}

const STATUS_FLOW: Record<string, { label: string; next?: string; nextLabel?: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', next: 'confirmed', nextLabel: 'Xác nhận', color: 'bg-amber-100 text-amber-900' },
  confirmed: { label: 'Đã xác nhận', next: 'in_progress', nextLabel: 'Bắt đầu phục vụ', color: 'bg-sky-100 text-sky-900' },
  in_progress: { label: 'Đang phục vụ', next: 'done', nextLabel: 'Hoàn tất', color: 'bg-indigo-100 text-indigo-900' },
  done: { label: 'Hoàn tất', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Đã huỷ', color: 'bg-stone-200 text-stone-700' },
};

const vnd = (n: number) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;
const time = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_FLOW[status] ?? STATUS_FLOW.pending;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
};

export const OnlineOrdersView: React.FC<OnlineOrdersViewProps> = ({ onTriggerToast }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<NursingBookingRow[]>([]);
  const [orders, setOrders] = useState<ServiceOrderRow[]>([]);
  const [triage, setTriage] = useState<TriageReportRow[]>([]);
  const [profiles, setProfiles] = useState<PatientProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const notify = (title: string, desc: string, type: 'success' | 'warning' | 'emergency' = 'success') =>
    onTriggerToast?.(title, desc, type);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const isStaff = session?.user.app_metadata?.role === 'staff';

  // Initial load + realtime subscription
  useEffect(() => {
    if (!supabase || !isStaff) return;
    const db = supabase;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const [b, o, t, p] = await Promise.all([
        db.from('nursing_bookings').select('*').order('created_at', { ascending: false }).limit(100),
        db.from('service_orders').select('*').order('created_at', { ascending: false }).limit(100),
        db.from('triage_reports').select('*').order('created_at', { ascending: false }).limit(50),
        db.from('patient_profiles').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      if (cancelled) return;
      const err = b.error || o.error || t.error || p.error;
      setLoadError(err ? err.message : null);
      setBookings((b.data as NursingBookingRow[]) ?? []);
      setOrders((o.data as ServiceOrderRow[]) ?? []);
      setTriage((t.data as TriageReportRow[]) ?? []);
      setProfiles((p.data as PatientProfileRow[]) ?? []);
      setLoading(false);
    };
    load();

    const channel = db
      .channel('gocare-online-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nursing_bookings' }, (payload) => {
        const row = payload.new as NursingBookingRow;
        if (payload.eventType === 'INSERT') {
          setBookings((prev) => [row, ...prev]);
          notify('Lịch Điều Dưỡng Mới!', `${row.patient_name} vừa đặt "${row.service_name}" từ web khách hàng.`);
        } else if (payload.eventType === 'UPDATE') {
          setBookings((prev) => prev.map((x) => (x.id === row.id ? row : x)));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, (payload) => {
        const row = payload.new as ServiceOrderRow;
        if (payload.eventType === 'INSERT') {
          setOrders((prev) => [row, ...prev]);
          notify('Đơn Dịch Vụ Mới!', `Đơn ${row.id.slice(0, 8)} trị giá ${vnd(row.total)} vừa được tạo.`);
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev) => prev.map((x) => (x.id === row.id ? row : x)));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'triage_reports' }, (payload) => {
        const row = payload.new as TriageReportRow;
        setTriage((prev) => [row, ...prev]);
        if (row.urgent) notify('CẢNH BÁO SÀNG LỌC KHẨN', `Bệnh nhân báo mức đau ${row.pain_level}/10.`, 'emergency');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patient_profiles' }, (payload) => {
        setProfiles((prev) => [payload.new as PatientProfileRow, ...prev]);
      })
      .subscribe();

    return () => {
      cancelled = true;
      db.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaff]);

  const updateStatus = async (table: 'nursing_bookings' | 'service_orders', id: string, status: string) => {
    if (!supabase) return;
    const { error } = await supabase.from(table).update({ status }).eq('id', id);
    if (error) {
      notify('Không cập nhật được trạng thái', error.message, 'warning');
      return;
    }
    // Realtime echoes the UPDATE back; update locally too so the UI reacts instantly
    if (table === 'nursing_bookings') setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    else setOrders((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    notify('Đã cập nhật trạng thái', `Trạng thái mới: ${STATUS_FLOW[status]?.label ?? status}. Đã lưu vào database dùng chung.`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  };

  // ---------- Not configured ----------
  if (!isSupabaseConfigured) {
    return (
      <div className="p-space-lg max-w-3xl">
        <div className="p-6 rounded-2xl border border-amber-300 bg-amber-50 text-amber-950 space-y-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">database</span>
            Chưa kết nối database dùng chung
          </h3>
          <p className="text-sm">
            Thêm <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> (cùng giá trị với web
            khách hàng) vào file <code>.env</code> khi chạy local, hoặc vào Environment Variables trên Vercel rồi
            deploy lại.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Login gate ----------
  if (!authReady) return <div className="p-space-lg text-sm text-on-surface-variant">Đang kiểm tra phiên đăng nhập…</div>;

  if (!session || !isStaff) {
    return (
      <div className="p-space-lg flex justify-center">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md p-6 rounded-2xl bg-surface-clean border border-outline-variant/30 shadow-sm space-y-4"
        >
          <div>
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              Đăng nhập nhân viên GoCare
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Chỉ tài khoản có quyền <code>staff</code> mới xem được đơn từ web khách hàng.
            </p>
          </div>
          {session && !isStaff && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              Tài khoản <strong>{session.user.email}</strong> chưa có quyền nhân viên.{' '}
              <button type="button" className="underline font-semibold" onClick={() => supabase?.auth.signOut()}>
                Đăng xuất
              </button>
            </div>
          )}
          <input
            type="email"
            required
            placeholder="Email nhân viên"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/50 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/50 text-sm"
          />
          {loginError && <p className="text-xs text-rose-700">{loginError}</p>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-sm hover:opacity-90"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    );
  }

  // ---------- Dashboard ----------
  const pendingCount =
    bookings.filter((b) => b.status === 'pending').length + orders.filter((o) => o.status === 'pending').length;
  const revenue =
    bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + Number(b.price), 0) +
    orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0);
  const profileName = (userId: string | null) =>
    profiles.find((p) => p.user_id === userId)?.full_name ?? (userId ? `KH ${userId.slice(0, 6)}` : 'Khách vãng lai');

  const stats = [
    { label: 'Lịch điều dưỡng', value: bookings.length, icon: 'home_health' },
    { label: 'Đơn dịch vụ', value: orders.length, icon: 'shopping_cart' },
    { label: 'Chờ xác nhận', value: pendingCount, icon: 'pending_actions' },
    { label: 'Doanh thu tạm tính', value: vnd(revenue), icon: 'payments' },
  ];

  return (
    <div className="p-space-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Đang đồng bộ realtime với web khách hàng
        </div>
        <div className="text-xs text-on-surface-variant flex items-center gap-3">
          <span>{session.user.email}</span>
          <button className="underline" onClick={() => supabase?.auth.signOut()}>
            Đăng xuất
          </button>
        </div>
      </div>

      {loadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
          Lỗi đọc database: {loadError}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-surface-clean border border-outline-variant/30 shadow-sm">
            <span className="material-symbols-outlined text-primary">{s.icon}</span>
            <div className="text-2xl font-bold text-on-surface mt-1">{s.value}</div>
            <div className="text-xs text-on-surface-variant">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Nursing bookings */}
      <section className="rounded-2xl bg-surface-clean border border-outline-variant/30 shadow-sm overflow-hidden">
        <header className="px-5 py-3 border-b border-outline-variant/20 font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">home_health</span>
          Lịch đặt điều dưỡng (trang /nursing)
        </header>
        {loading && <p className="p-5 text-sm text-on-surface-variant">Đang tải…</p>}
        {!loading && bookings.length === 0 && (
          <p className="p-5 text-sm text-on-surface-variant">Chưa có lịch nào. Đơn mới sẽ hiện ở đây ngay khi khách đặt.</p>
        )}
        <div className="divide-y divide-outline-variant/20">
          {bookings.map((b) => {
            const flow = STATUS_FLOW[b.status] ?? STATUS_FLOW.pending;
            return (
              <div key={b.id} className="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-on-surface">{b.patient_name}</strong>
                    <StatusBadge status={b.status} />
                    {b.urgency === 'immediate' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">HỎA TỐC</span>
                    )}
                  </div>
                  <div className="text-sm text-on-surface">{b.service_name} · {vnd(b.price)}</div>
                  <div className="text-xs text-on-surface-variant">
                    {b.phone} · {b.address}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {b.nurse_name ? `ĐD: ${b.nurse_name} (${b.nurse_cchn}) · ` : ''}
                    {b.scheduled_at} · đặt lúc {time(b.created_at)}
                  </div>
                  {b.medical_note && <div className="text-xs italic text-on-surface-variant">“{b.medical_note}”</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {flow.next && (
                    <button
                      onClick={() => updateStatus('nursing_bookings', b.id, flow.next!)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold"
                    >
                      {flow.nextLabel}
                    </button>
                  )}
                  {b.status === 'pending' && (
                    <button
                      onClick={() => updateStatus('nursing_bookings', b.id, 'cancelled')}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-semibold"
                    >
                      Huỷ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Service orders */}
      <section className="rounded-2xl bg-surface-clean border border-outline-variant/30 shadow-sm overflow-hidden">
        <header className="px-5 py-3 border-b border-outline-variant/20 font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">shopping_cart</span>
          Đơn giỏ dịch vụ (trang chủ)
        </header>
        {!loading && orders.length === 0 && (
          <p className="p-5 text-sm text-on-surface-variant">Chưa có đơn nào.</p>
        )}
        <div className="divide-y divide-outline-variant/20">
          {orders.map((o) => {
            const flow = STATUS_FLOW[o.status] ?? STATUS_FLOW.pending;
            const items = Array.isArray(o.items) ? o.items : [];
            return (
              <div key={o.id} className="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-on-surface">
                      {o.user_id ? profileName(o.user_id) : o.customer_email ?? 'Khách vãng lai'}
                    </strong>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-sm text-on-surface">
                    {items.map((i) => i.name ?? i.title ?? 'Dịch vụ').join(', ') || '—'}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Tổng {vnd(o.total)} · đặt lúc {time(o.created_at)}
                  </div>
                </div>
                {flow.next && (
                  <button
                    onClick={() => updateStatus('service_orders', o.id, flow.next!)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shrink-0"
                  >
                    {flow.nextLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Patients + triage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-surface-clean border border-outline-variant/30 shadow-sm overflow-hidden">
          <header className="px-5 py-3 border-b border-outline-variant/20 font-bold text-on-surface">
            Hồ sơ khách đăng ký ({profiles.length})
          </header>
          <div className="divide-y divide-outline-variant/20 max-h-80 overflow-y-auto">
            {profiles.map((p) => (
              <div key={p.id} className="px-5 py-3 text-sm">
                <strong>{p.full_name ?? '—'}</strong>
                <span className="text-xs text-on-surface-variant">
                  {' '}· {p.birth_year ?? '?'} · {p.gender ?? '?'} · Người thân: {p.guardian_name ?? '—'} ({p.emergency_phone ?? '—'})
                </span>
                {p.service_need && <div className="text-xs text-on-surface-variant">Nhu cầu: {p.service_need}</div>}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl bg-surface-clean border border-outline-variant/30 shadow-sm overflow-hidden">
          <header className="px-5 py-3 border-b border-outline-variant/20 font-bold text-on-surface">
            Sàng lọc triệu chứng ({triage.length})
          </header>
          <div className="divide-y divide-outline-variant/20 max-h-80 overflow-y-auto">
            {triage.map((t) => (
              <div key={t.id} className="px-5 py-3 text-sm flex items-center justify-between">
                <span>
                  {profileName(t.user_id)} · đau {t.pain_level}/10
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.urgent ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-700'}`}>
                  {t.urgent ? 'KHẨN' : 'Theo dõi'} · {time(t.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
