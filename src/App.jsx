import React, { useState } from 'react';
import {
  LayoutDashboard, Truck, QrCode, Users, FileText,
  Settings, Search, Bell, Egg, ArrowLeftRight,
  ClipboardList, Menu, ShieldCheck
} from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'trolleys', label: 'إدارة العربات', icon: Truck },
    { id: 'tracking', label: 'حركة العربات', icon: ArrowLeftRight },
    { id: 'qr', label: 'QR Codes', icon: QrCode },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'logs', label: 'سجل العمليات', icon: ClipboardList },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
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
            <div className="user-avatar">A</div>
          </div>
        </header>

        <div className="content">

          <div className="welcome-section">
            <div>
              <span className="welcome-tag">HATCHERY MANAGEMENT</span>
              <h1>{currentPage?.label || 'لوحة التحكم'}</h1>
              <p>
                نظام الإدارة الذكي لتتبع عربات البيض ومراحل التفريخ.
              </p>
            </div>
            <div className="welcome-icon">
              <Egg size={36} />
            </div>
          </div>

          {activePage === 'dashboard' ? (
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
                      <strong className="status">جاهزة للبناء</strong>
                    </div>
                    <div>
                      <span>قاعدة البيانات</span>
                      <strong className="pending">لم يتم الربط</strong>
                    </div>
                    <div>
                      <span>نظام QR</span>
                      <strong className="pending">لم يتم الربط</strong>
                    </div>
                    <div>
                      <span>المستخدمين</span>
                      <strong className="pending">لم يتم الربط</strong>
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
              <h2>{currentPage?.label}</h2>
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
            STAR FEED EL-TOUKHY © 2026
            <span>Hatchery Trolley Tracking System</span>
          </footer>

        </div>
      </main>
    </div>
  );
}
