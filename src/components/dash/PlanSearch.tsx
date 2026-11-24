import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useI18n } from '../../i18n';
import type { Plan } from '../../types/blueprint';
import { searchPlan } from './planView';

/**
 * Header search that searches the actual split: movement, session name or
 * focus. Picking a hit opens the full blueprint at that point (the plan view
 * has every exercise listed).
 */
export const PlanSearch = ({ plan, onOpen }: { plan: Plan | null; onOpen: () => void }) => {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => (plan ? searchPlan(plan, q) : []), [plan, q]);

  const disabled = !plan;

  return (
    <div className="relative max-w-md">
      <div
        className={`flex items-center gap-2 rounded-full border bg-white px-3.5 py-2 ${
          disabled ? 'border-slate-200/70 opacity-60' : 'border-slate-200 focus-within:border-[#65A30D]'
        }`}
      >
        <Search size={15} className="shrink-0 text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          disabled={disabled}
          placeholder={disabled ? t('search.empty') : t('search.placeholder')}
          aria-label={t('search.placeholder')}
          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {q && (
          <button onClick={() => setQ('')} aria-label={t('search.clear')} className="shrink-0 text-slate-400 hover:text-slate-700">
            <X size={14} />
          </button>
        )}
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.4)]">
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-500">{t('search.none', { q: q.trim() })}</p>
          ) : (
            <ul>
              {hits.map((h, i) => (
                <li key={h.exercise + i}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setQ('');
                      onOpen();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[#F4F5F2]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">{h.exercise}</span>
                      <span className="block truncate text-[11px] text-slate-500">
                        {h.day} · {h.focus}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
