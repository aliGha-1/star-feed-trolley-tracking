import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Truck, QrCode, Users, FileText,
  Settings, Search, Bell, Egg, ArrowLeftRight,
  ClipboardList, Menu, ShieldCheck, LogOut
} from 'lucide-react';

import Auth from './Auth.jsx';
import Trolleys from './Trolleys.jsx';
import { supabase } from './supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [activePage, setActivePage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);

        if (!session?.user) {
          setProfile(null);
          setProfileError('');
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let active = true;

    async function loadProfile() {
      setProfile(null);
      setProfileError('');

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (!active) return;

      if (error || !data) {
        setProfileError(
          'تعذر تحميل بيانات المستخدم. يرجى مراجعة حسابك.'
        );
        return;
      }

      setProfile(data);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setActivePage('dashboard');
  }

  if (!supabase) {
    return <div className="auth-page">إعدادات الاتصال بقاعدة البيانات غير مكتملة.</div>;
  }

  if (checking) {
    return <div className="auth-page">جارٍ التحقق من تسجيل الدخول...</div>;
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  if (profileError) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>تعذر تحميل الحساب</h2>
          <p>{profileError}</p>
          <button onClick={handleLogout}>تسجيل الخروج</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="auth-page">جارٍ تحميل بيانات الحساب...</div>;
  }

  const isAdmin = profile.role === 'admin';
  const canEdit = isAdmin || profile.role === 'editor';

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'trolleys', label: 'إدارة العربات', icon: Truck },
    { id: 'tracking', label: 'حركة العربات', icon: ArrowLeftRight },
    { id: 'qr', label: 'QR Codes', icon: QrCode },
    ...(isAdmin ? [
      { id: 'users', label: 'المستخدمين', icon: Users },
      { id: 'logs', label: 'سجل العمليات', icon: ClipboardList },
      { id: 'settings', label: 'الإعدادات', icon: Settings }
    ] : []),
    { id: 'reports', label: 'التقارير', icon: FileText }
  ];

  const currentPage = menuItems.find(item => item.id === activePage);

  return (
    <div className="app-shell">

      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Egg size={28} />
          </div>
          <div>
            <h2>STAR FEED</h2>
            <span>EL-TOUKHY HATCHERY</span>
          </div>
        </div>

        <div className="sidebar-label">القائمة الرئيسية</div>

        <nav>
          {menuItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActivePage(item.id);
                  setMenuOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ShieldCheck size={19} />
          <div>
            <strong>نظام إدارة آمن</strong>
            <span>Hatchery Tracking System</span>
          </div>
        </div>
      </aside>

      <main className="main-area">

        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={22} />
          </button>

          <div className="topbar-title">
            <span>ستار فيد الطوخي</span>
            <small>نظام تتبع عربات التفريخ</small>
          </div>

          <div className="topbar-actions">
            <button className="icon-button">
              <Search size={20} />
            </button>

            <button className="icon-button">
              <Bell size={20} />
            </button>

            <div className="user-avatar">
              {(profile.full_name || user.email || 'A').charAt(0).toUpperCase()}
            </div>

            <button
              className="icon-button"
              onClick={handleLogout}
              title="تسجيل الخروج"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="content">

          <div className="welcome-section">
            <div>
              <span className="welcome-tag">HATCHERY MANAGEMENT</span>
              <h1>{currentPage?.label || 'لوحة التحكم'}</h1>
              <p>
                مرحباً {profile.full_name || user.email}
                {' — '}
                {isAdmin ? 'مدير النظام' : canEdit ? 'محرر' : 'مشاهد'}
              </p>
            </div>

            <div className="welcome-icon">
              <Egg size={36} />
            </div>
          </div>

          {activePage === 'trolleys' ? (
            <Trolleys user={user} role={profile.role} />
          ) : activePage === 'dashboard' ? (
            <>
              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Truck size={23} />
                  </div>
                  <span>إجمالي العربات</span>
                  <h2>0</h2>
                  <small>العربات المسجلة بالنظام</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <ArrowLeftRight size={23} />
                  </div>
                  <span>العربات داخل التفريخ</span>
                  <h2>0</h2>
                  <small>العربات الموجودة حاليًا</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <Egg size={23} />
                  </div>
                  <span>العربات في النقل</span>
                  <h2>0</h2>
                  <small>العربات في مرحلة النقل</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    <QrCode size={23} />
                  </div>
                  <span>QR Codes</span>
                  <h2>0</h2>
                  <small>أكواد العربات المسجلة</small>
                </div>

              </div>

              <div className="dashboard-grid">

                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>آخر العمليات</h3>
                      <p>متابعة أحدث حركات العربات</p>
                    </div>
                    <ClipboardList size={22} />
                  </div>

                  <div className="empty-state">
                    <ClipboardList size={42} />
                    <h4>لا توجد عمليات حتى الآن</h4>
                    <p>ستظهر هنا عمليات تسجيل وتحريك وتعديل العربات.</p>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>حالة النظام</h3>
                      <p>ملخص مكونات النظام</p>
                    </div>
                    <ShieldCheck size={22} />
                  </div>

                  <div className="system-list">
                    <div>
                      <span>واجهة النظام</span>
                      <strong className="status">جاهزة</strong>
                    </div>
                    <div>
                      <span>قاعدة البيانات</span>
                      <strong className="status">متصلة</strong>
                    </div>
                    <div>
                      <span>نظام QR</span>
                      <strong className="pending">قيد التجهيز</strong>
                    </div>
                    <div>
                      <span>المستخدم الحالي</span>
                      <strong className="status">مسجل الدخول</strong>
                    </div>
                  </div>
                </div>

              </div>

              <div className="panel quick-panel">
                <div className="panel-heading">
                  <div>
                    <h3>الوصول السريع</h3>
                    <p>الأقسام الأساسية لإدارة التشغيل</p>
                  </div>
                </div>

                <div className="quick-grid">
                  <button onClick={() => setActivePage('trolleys')}>
                    <Truck size={23} />
                    <span>إدارة العربات</span>
                  </button>

                  <button onClick={() => setActivePage('tracking')}>
                    <ArrowLeftRight size={23} />
                    <span>حركة العربات</span>
                  </button>

                  <button onClick={() => setActivePage('qr')}>
                    <QrCode size={23} />
                    <span>طباعة QR</span>
                  </button>

                  <button onClick={() => setActivePage('reports')}>
                    <FileText size={23} />
                    <span>التقارير</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="panel page-placeholder">
              <div className="placeholder-icon">
                {currentPage && <currentPage.icon size={36} />}
              </div>

              <h2>{currentPage?.label || 'القسم غير متاح'}</h2>

              <p>
                هذا القسم تم تجهيزه ضمن هيكل النظام.
                سيتم بناء وظائفه وربطه بقاعدة البيانات في المراحل القادمة.
              </p>

              <button
                className="back-button"
                onClick={() => setActivePage('dashboard')}
              >
                العودة إلى لوحة التحكم
              </button>
            </div>
          )}

          <footer className="app-footer">
            STAR FEED EL-TOUKHY ©️ 2026
            <span>Hatchery Trolley Tracking System</span>
          </footer>

        </div>
      </main>
    </div>
  );
}
