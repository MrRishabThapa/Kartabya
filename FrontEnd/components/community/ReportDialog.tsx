'use client';

import { Flag, X } from 'lucide-react';
import { useState } from 'react';

const reasons = ['False or misleading information', 'Harassment or bullying', 'Threats or unsafe content', 'Spam or unrelated content'];

export default function ReportDialog({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(reasons[0]);
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><Flag size={19} /></div><h2 id="report-title" className="text-lg font-extrabold text-slate-800">Report content</h2><p className="mt-1 text-sm leading-6 text-slate-500">Your report is private and will be reviewed by the moderation team.</p></div><button aria-label="Close report dialog" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button></div>
        {submitted ? <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Report submitted. Thank you for helping keep the community safe.</div> : <><div className="mt-6 space-y-2">{reasons.map((reason) => <label key={reason} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-colors ${selected === reason ? 'border-brand-primary-light bg-brand-primary-bg text-brand-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><input type="radio" name="reason" checked={selected === reason} onChange={() => setSelected(reason)} className="accent-brand-primary" />{reason}</label>)}</div><button onClick={() => setSubmitted(true)} className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700">Submit report</button></>}
      </div>
    </div>
  );
}
