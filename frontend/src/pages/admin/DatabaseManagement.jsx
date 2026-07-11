import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaDatabase, FaEdit, FaFilter, FaSearch, FaSort, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const statusOptions = [
  { value: '', label: 'All records' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'read', label: 'Read' },
  { value: 'unread', label: 'Unread' }
];

const formatCell = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`;
  if (typeof value === 'object') return value.name || value.title || value.email || value._id || 'Object';
  return String(value);
};

const pickColumns = (records) => {
  const preferred = ['name', 'email', 'title', 'text', 'subject', 'type', 'role', 'score', 'percentage', 'isPublished', 'isApproved', 'passed', 'createdAt'];
  const keys = new Set();
  records.forEach((record) => Object.keys(record).forEach((key) => keys.add(key)));
  const ordered = preferred.filter((key) => keys.has(key));
  const remaining = [...keys].filter((key) => !['_id', '__v', ...ordered].includes(key)).slice(0, 5);
  return ['_id', ...ordered, ...remaining].slice(0, 8);
};

const DatabaseManagement = () => {
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState('students');
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const activeLabel = collections.find((item) => item.key === activeCollection)?.label || 'Records';
  const columns = useMemo(() => pickColumns(records), [records]);

  const fetchCollections = useCallback(async () => {
    const res = await api.get('/database');
    if (res.data.success) setCollections(res.data.collections);
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/database/${activeCollection}`, {
        params: { search, status, sortField, sortOrder, page, limit: 10 }
      });
      if (res.data.success) {
        setRecords(res.data.records);
        setMeta({ page: res.data.page, pages: res.data.pages, total: res.data.total });
      }
    } finally {
      setLoading(false);
    }
  }, [activeCollection, page, search, sortField, sortOrder, status]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const changeCollection = (key) => {
    setActiveCollection(key);
    setSearch('');
    setStatus('');
    setPage(1);
  };

  const handleEdit = async (record) => {
    const editable = { ...record };
    delete editable._id;
    delete editable.__v;
    delete editable.createdAt;
    delete editable.updatedAt;

    const { value, isConfirmed } = await Swal.fire({
      title: `Edit ${activeLabel} record`,
      input: 'textarea',
      inputValue: JSON.stringify(editable, null, 2),
      inputAttributes: { spellcheck: 'false' },
      width: 760,
      showCancelButton: true,
      confirmButtonText: 'Save changes',
      preConfirm: (text) => {
        try {
          return JSON.parse(text);
        } catch (error) {
          Swal.showValidationMessage('Enter valid JSON before saving');
          return false;
        }
      }
    });

    if (!isConfirmed) return;
    const res = await api.put(`/database/${activeCollection}/${record._id}`, value);
    if (res.data.success) {
      Swal.fire('Saved', 'Record updated successfully.', 'success');
      fetchRecords();
      fetchCollections();
    }
  };

  const handleDelete = async (record) => {
    const result = await Swal.fire({
      title: 'Delete this record?',
      text: 'This permanently removes the selected database record.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete'
    });

    if (!result.isConfirmed) return;
    const res = await api.delete(`/database/${activeCollection}/${record._id}`);
    if (res.data.success) {
      Swal.fire('Deleted', 'Record removed from the database.', 'success');
      fetchRecords();
      fetchCollections();
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><FaDatabase className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black">Database Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Browse, search, edit, sort, paginate, and delete MongoDB records.</p>
          </div>
        </div>
        <div className="text-sm font-bold text-slate-500">{meta.total} records</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-2">
        {collections.map((collection) => (
          <button
            key={collection.key}
            onClick={() => changeCollection(collection.key)}
            className={`rounded-xl border px-3 py-3 text-left transition-all ${
              activeCollection === collection.key
                ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <span className="block text-[11px] font-black uppercase tracking-wide truncate">{collection.label}</span>
            <span className="text-xs opacity-80">{collection.count}</span>
          </button>
        ))}
      </div>

      <div className="glass-card rounded-3xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <FaSearch className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={`Search ${activeLabel.toLowerCase()}`}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <FaFilter className="text-slate-400" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full bg-transparent text-sm outline-none">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <FaSort className="text-slate-400" />
            <input
              value={sortField}
              onChange={(event) => setSortField(event.target.value || 'createdAt')}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={6} />
        ) : records.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">No records match the current filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  {columns.map((column) => <th key={column} className="px-3 py-3 text-left">{column}</th>)}
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="border-b border-slate-100 hover:bg-slate-50/70 dark:border-slate-850 dark:hover:bg-slate-900/40">
                    {columns.map((column) => (
                      <td key={column} className="max-w-[220px] truncate px-3 py-3 text-xs">
                        {column === 'createdAt' && record[column]
                          ? new Date(record[column]).toLocaleString()
                          : formatCell(record[column])}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(record)} className="rounded-lg bg-blue-500/10 p-2 text-blue-500 hover:bg-blue-500 hover:text-white" title="Edit record">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(record)} className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500 hover:text-white" title="Delete record">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
          <button
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page <= 1}
            className="rounded-xl bg-slate-100 px-4 py-2 font-bold disabled:opacity-40 dark:bg-slate-900"
          >
            Previous
          </button>
          <span className="font-semibold text-slate-500">Page {meta.page} of {meta.pages}</span>
          <button
            onClick={() => setPage((current) => Math.min(current + 1, meta.pages))}
            disabled={page >= meta.pages}
            className="rounded-xl bg-slate-100 px-4 py-2 font-bold disabled:opacity-40 dark:bg-slate-900"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement;
