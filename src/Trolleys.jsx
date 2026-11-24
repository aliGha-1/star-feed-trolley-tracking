import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import {
  Plus, Search, Edit, Trash2, RefreshCw, Truck, X
} from 'lucide-react';

const emptyForm = {
  trolley_code: '',
  farm_name: '',
  importer: '',
  source: '',
  egg_count: '',
  deposit_date: '',
  fertilization_date: '',
  setter_machine: '',
  setter_side: '',
  transfer_date: '',
  hatcher_machine: '',
  hatch_date: '',
  current_stage: 'داخل التفريخ',
  notes: ''
};

const fields = [
  ['trolley_code', 'كود العربة', true],
  ['farm_name', 'اسم المزرعة'],
  ['importer', 'المستورد'],
  ['source', 'المصدر'],
  ['egg_count', 'عدد البيض', false, 'number'],
  ['deposit_date', 'تاريخ الإيداع', false, 'date'],
  ['fertilization_date', 'تاريخ الإخصاب', false, 'date'],
  ['setter_machine', 'ماكينة التفريخ'],
  ['setter_side', 'رقم / جانب الماكينة'],
  ['transfer_date', 'تاريخ النقل', false, 'date'],
  ['hatcher_machine', 'ماكينة الفقس'],
  ['hatch_date', 'تاريخ الفقس / الخروج', false, 'date']
];

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
    setForm({ ...emptyForm });
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
      fertilization_date: item.fertilization_date || '',
      transfer_date: item.transfer_date || '',
      hatch_date: item.hatch_date || ''
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
      farm_name: form.farm_name.trim() || null,
      importer: form.importer.trim() || null,
      source: form.source.trim() || null,
      egg_count: form.egg_count === '' ? null : Number(form.egg_count),
      deposit_date: form.deposit_date || null,
      fertilization_date: form.fertilization_date || null,
      setter_machine: form.setter_machine.trim() || null,
      setter_side: form.setter_side.trim() || null,
      transfer_date: form.transfer_date || null,
      hatcher_machine: form.hatcher_machine.trim() || null,
      hatch_date: form.hatch_date || null,
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
    setForm({ ...emptyForm });
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
      item.farm_name,
      item.importer,
      item.source,
      item.setter_machine,
      item.hatcher_machine
    ].join(' ').toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2>إدارة العربات</h2>
          <p>إضافة ومتابعة بيانات عربات البيض ومواعيد التفريخ</p>
        </div>

        {canEdit && (
          <button className="primary-btn" onClick={openNewForm}>
            <Plus size={18} />
            إضافة عربة جديدة
          </button>
        )}
      </div>

      {message && <div className="notice">{message}</div>}

      <div className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بكود العربة أو المزرعة أو الماكينة..."
            />
          </div>

          <button className="secondary-btn" onClick={loadTrolleys}>
            <RefreshCw size={17} />
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="empty-state">جارٍ تحميل العربات...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Truck size={35} />
            <p>لا توجد عربات مسجلة حتى الآن</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>كود العربة</th>
                  <th>المزرعة</th>
                  <th>المستورد</th>
                  <th>عدد البيض</th>
                  <th>ماكينة التفريخ</th>
                  <th>تاريخ الإيداع</th>
                  <th>تاريخ الإخصاب</th>
                  <th>تاريخ النقل</th>
                  <th>تاريخ الفقس</th>
                  <th>المرحلة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>{item.trolley_code}</td>
                    <td>{item.farm_name || '-'}</td>
                    <td>{item.importer || '-'}</td>
                    <td>{item.egg_count ?? '-'}</td>
                    <td>
                      {item.setter_machine || '-'}
                      {item.setter_side ? ` - ${item.setter_side}` : ''}
                    </td>
                    <td>{item.deposit_date || '-'}</td>
                    <td>{item.fertilization_date || '-'}</td>
                    <td>{item.transfer_date || '-'}</td>
                    <td>{item.hatch_date || '-'}</td>
                    <td>{item.current_stage || '-'}</td>
                    <td>
                      {canEdit && (
                        <button
                          className="icon-btn"
                          title="تعديل"
                          onClick={() => openEditForm(item)}
                        >
                          <Edit size={17} />
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          className="icon-btn danger"
                          title="حذف"
                          onClick={() => deleteTrolley(item)}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>{editingId ? 'تعديل بيانات العربة' : 'إضافة عربة جديدة'}</h2>
                <p>أدخل بيانات العربة ومواعيد مراحل التفريخ</p>
              </div>

              <button
                className="icon-btn"
                type="button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveTrolley}>
              <div className="form-grid">
                {fields.map(([name, label, required, type]) => (
                  <label className="form-field" key={name}>
                    <span>{label}{required ? ' *' : ''}</span>
                    <input
                      type={type || 'text'}
                      value={form[name] ?? ''}
                      onChange={e => updateField(name, e.target.value)}
                      required={!!required}
                      min={type === 'number' ? '0' : undefined}
                    />
                  </label>
                ))}

                <label className="form-field">
                  <span>المرحلة الحالية</span>
                  <select
                    value={form.current_stage}
                    onChange={e => updateField('current_stage', e.target.value)}
                  >
                    <option>داخل التفريخ</option>
                    <option>تم الإخصاب</option>
                    <option>تم النقل</option>
                    <option>داخل ماكينة الفقس</option>
                    <option>تم الفقس / الخروج</option>
                  </select>
                </label>

                <label className="form-field full-width">
                  <span>ملاحظات</span>
                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={e => updateField('notes', e.target.value)}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving ? 'جارٍ الحفظ...' : 'حفظ بيانات العربة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
