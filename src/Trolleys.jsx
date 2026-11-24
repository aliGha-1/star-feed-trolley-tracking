import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import {
  Plus, Search, Edit, Trash2, X, RefreshCw, Truck
} from 'lucide-react';

const emptyForm = {
  trolley_code: '',
  flock_code: '',
  farm_name: '',
  importer: '',
  source: '',
  egg_count: '',
  deposit_date: '',
  setter_machine: '',
  setter_side: '',
  transfer_date: '',
  hatcher_machine: '',
  current_stage: 'داخل التفريخ',
  notes: ''
};

export default function Trolleys({ user, role }) {
  const [trolleys, setTrolleys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  const canEdit = role === 'admin' || role === 'editor';
  const isAdmin = role === 'admin';

  async function loadTrolleys() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trolleys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage('تعذر تحميل العربات: ' + error.message);
    } else {
      setTrolleys(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTrolleys();
  }, []);

  function updateField(name, value) {
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      ...item,
      egg_count: item.egg_count ?? '',
      deposit_date: item.deposit_date || '',
      transfer_date: item.transfer_date || ''
    });
    setMessage('');
    setShowForm(true);
  }

  async function saveTrolley(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = {
      trolley_code: form.trolley_code.trim(),
      flock_code: form.flock_code.trim() || null,
      farm_name: form.farm_name.trim() || null,
      importer: form.importer.trim() || null,
      source: form.source.trim() || null,
      egg_count: form.egg_count === '' ? null : Number(form.egg_count),
      deposit_date: form.deposit_date || null,
      setter_machine: form.setter_machine.trim() || null,
      setter_side: form.setter_side.trim() || null,
      transfer_date: form.transfer_date || null,
      hatcher_machine: form.hatcher_machine.trim() || null,
      current_stage: form.current_stage,
      notes: form.notes.trim() || null,
      updated_by: user.id
    };

    let result;

    if (editingId) {
      result = await supabase
        .from('trolleys')
        .update(payload)
        .eq('id', editingId);
    } else {
      result = await supabase
        .from('trolleys')
        .insert({
          ...payload,
          created_by: user.id
        });
    }

    setSaving(false);

    if (result.error) {
      setMessage('لم يتم الحفظ: ' + result.error.message);
      return;
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setMessage('تم حفظ بيانات العربة بنجاح');
    await loadTrolleys();
  }

  async function deleteTrolley(item) {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف العربة ${item.trolley_code}؟`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('trolleys')
      .delete()
      .eq('id', item.id);

    if (error) {
      setMessage('تعذر الحذف: ' + error.message);
    } else {
      setMessage('تم حذف العربة');
      await loadTrolleys();
    }
  }

  const filtered = trolleys.filter(item => {
    const text = [
      item.trolley_code,
      item.flock_code,
      item.farm_name,
      item.setter_machine
    ].join(' ').toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const fields = [
    ['trolley_code', 'كود العربة', true],
    ['flock_code', 'كود القطيع'],
    ['farm_name', 'اسم المزرعة'],
    ['importer', 'المستورد'],
    ['source', 'المصدر'],
    ['egg_count', 'عدد البيض', false, 'number'],
    ['deposit_date', 'تاريخ الإيداع', false, 'date'],
    ['setter_machine', 'ماكينة التفريخ'],
    ['setter_side', 'جانب الماكينة'],
    ['transfer_date', 'تاريخ النقل', false, 'date'],
    ['hatcher_machine', 'ماكينة الفقس']
  ];

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d7dee8',
    borderRadius: '9px',
    fontSize: '14px',
    background: '#fff',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    border: 'none',
    borderRadius: '9px',
    padding: '11px 16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <div style={{ direction: 'rtl', padding: '4px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 6px' }}>إدارة العربات</h2>
          <p style={{ margin: 0, color: '#718096' }}>
            تسجيل ومتابعة بيانات عربات التفريخ
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={loadTrolleys}
            style={{ ...buttonStyle, background: '#e8eef6', color: '#24364b' }}
          >
            <RefreshCw size={16} />
          </button>

          {canEdit && (
            <button
              onClick={openNewForm}
              style={{ ...buttonStyle, background: '#123c63', color: '#fff' }}
            >
              <Plus size={17} /> إضافة عربة
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#fff',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #e5eaf0',
        marginBottom: '16px'
      }}>
        <Search size={19} color="#718096" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بكود العربة أو القطيع أو المزرعة..."
          style={{ ...inputStyle, border: 'none', outline: 'none' }}
        />
      </div>

      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '14px',
          background: '#eef5ff',
          borderRadius: '9px',
          color: '#17436b'
        }}>
          {message}
        </div>
      )}

      <div style={{
        background: '#fff',
        border: '1px solid #e5eaf0',
        borderRadius: '12px',
        overflowX: 'auto'
      }}>
        {loading ? (
          <p style={{ padding: '25px', textAlign: 'center' }}>
            جارٍ تحميل العربات...
          </p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 15px', textAlign: 'center' }}>
            <Truck size={38} color="#94a3b8" />
            <h3>لا توجد عربات مسجلة</h3>
            <p style={{ color: '#718096' }}>
              أضف أول عربة لتبدأ استخدام النظام.
            </p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '750px',
            textAlign: 'right'
          }}>
            <thead>
              <tr style={{ background: '#f3f6fa' }}>
                {['كود العربة', 'كود القطيع', 'المزرعة', 'عدد البيض', 'المرحلة', 'الإجراءات'].map(title => (
                  <th key={title} style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} style={{ borderTop: '1px solid #edf0f4' }}>
                  <td style={{ padding: '13px', fontWeight: 'bold' }}>
                    {item.trolley_code}
                  </td>
                  <td style={{ padding: '13px' }}>{item.flock_code || '-'}</td>
                  <td style={{ padding: '13px' }}>{item.farm_name || '-'}</td>
                  <td style={{ padding: '13px' }}>{item.egg_count ?? '-'}</td>
                  <td style={{ padding: '13px' }}>{item.current_stage || '-'}</td>
                  <td style={{ padding: '13px', whiteSpace: 'nowrap' }}>
                    {canEdit && (
                      <button
                        onClick={() => openEditForm(item)}
                        style={{ ...buttonStyle, background: '#eaf2ff', color: '#245b91', marginLeft: '6px' }}
                        title="تعديل"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => deleteTrolley(item)}
                        style={{ ...buttonStyle, background: '#fff0f0', color: '#bd3030' }}
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ color: '#718096', marginTop: '12px' }}>
        إجمالي العربات: {trolleys.length}
      </p>

      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(10,20,35,.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px'
        }}>
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '15px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px'
            }}>
              <h3>{editingId ? 'تعديل بيانات العربة' : 'إضافة عربة جديدة'}</h3>
              <button
                onClick={() => setShowForm(false)}
                style={{ ...buttonStyle, background: '#f1f3f6' }}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveTrolley}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '14px'
              }}>
                {fields.map(([name, label, required, type]) => (
                  <label key={name} style={{ display: 'block' }}>
                    <span style={{ display: 'block', marginBottom: '7px', fontWeight: 'bold' }}>
                      {label}{required ? ' *' : ''}
                    </span>
                    <input
                      type={type || 'text'}
                      value={form[name] ?? ''}
                      required={!!required}
                      min={type === 'number' ? 0 : undefined}
                      onChange={e => updateField(name, e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                ))}

                <label>
                  <span style={{ display: 'block', marginBottom: '7px', fontWeight: 'bold' }}>
                    المرحلة الحالية
                  </span>
                  <select
                    value={form.current_stage}
                    onChange={e => updateField('current_stage', e.target.value)}
                    style={inputStyle}
                  >
                    <option>داخل التفريخ</option>
                    <option>في النقل</option>
                    <option>داخل الفقاسة</option>
                    <option>تم الفقس</option>
                    <option>خرجت من التشغيل</option>
                  </select>
                </label>
              </div>

              <label style={{ display: 'block', marginTop: '15px' }}>
                <span style={{ display: 'block', marginBottom: '7px', fontWeight: 'bold' }}>
                  ملاحظات
                </span>
                <textarea
                  value={form.notes || ''}
                  onChange={e => updateField('notes', e.target.value)}
                  rows="3"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...buttonStyle,
                  width: '100%',
                  marginTop: '18px',
                  background: '#123c63',
                  color: '#fff',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'جارٍ الحفظ...' : editingId ? 'حفظ التعديلات' : 'حفظ العربة'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
