import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { db } from '../../src/services/db';
import { useCommissions, useCommissionSplitRules, useProfiles } from '../../src/hooks/useData';
import { Commission, CommissionSplitRule, CommissionStatus, User, UserRole } from '../../types';
import { POLICY_TYPE_SUGGESTIONS } from '../forms/PolicyForm';
import { SensitiveData } from '../ui/SensitiveData';
import { Plus, Trash2, Loader2, CheckCircle, Percent, Users } from 'lucide-react';
import { useToast, useConfirm } from '../ui/Feedback';
import { auditService } from '../../src/services/audit';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Splits & Auszahlung (Konzept 4.4): Beteiligungs-Regelwerk pro Berater,
 * offene Auszahlungen aus bezahlten Courtagen (inkl. automatischer
 * Storno-Verrechnung über negative CLAWBACK-Splits) und Ein-Klick-Abrechnung.
 */

interface PayoutTabProps {
  tenantId?: string;
}

export const PayoutTab: React.FC<PayoutTabProps> = ({ tenantId }) => {
  const { data: rules, refetch: refetchRules } = useCommissionSplitRules(tenantId);
  const { data: commissions, refetch: refetchCommissions } = useCommissions();
  const { data: users } = useProfiles(tenantId);
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();

  const [isRuleOpen, setIsRuleOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({ agentId: '', line: '', rate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingAgent, setPayingAgent] = useState<string | null>(null);

  const advisors = users.filter((u: User) =>
    u.role === UserRole.BROKER_AGENT || u.role === UserRole.BROKER_ADMIN);

  const agentName = (id?: string | null) => {
    const u = users.find((x: User) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : 'Unbekannt';
  };

  // Open payouts: PAID (positive) or CLAWBACK (negative) splits not yet paid out.
  const payable = (commissions as Commission[]).filter((c) =>
    c.splitAgentId && c.splitAmount != null && !c.splitPaidAt &&
    (c.status === ('PAID' as CommissionStatus) || c.status === ('CLAWBACK' as CommissionStatus)));

  const byAgent = new Map<string, Commission[]>();
  for (const c of payable) {
    const list = byAgent.get(c.splitAgentId!) ?? [];
    list.push(c);
    byAgent.set(c.splitAgentId!, list);
  }

  const paidJournal = (commissions as Commission[])
    .filter((c) => c.splitPaidAt)
    .sort((a, b) => (b.splitPaidAt ?? '').localeCompare(a.splitPaidAt ?? ''))
    .slice(0, 15);

  const saveRule = async () => {
    setError(null);
    if (!ruleForm.agentId) { setError('Berater wählen.'); return; }
    const rate = Number(ruleForm.rate);
    if (!rate || rate <= 0 || rate > 100) { setError('Satz zwischen 1 und 100 % angeben.'); return; }
    setSaving(true);
    try {
      await db.commissionSplitRules.create({
        tenantId, agentId: ruleForm.agentId,
        line: ruleForm.line.trim() || null, rate,
        validFrom: new Date().toISOString().slice(0, 10),
      } as any);
      setIsRuleOpen(false);
      setRuleForm({ agentId: '', line: '', rate: '' });
      refetchRules();
    } catch (e: any) {
      setError(e?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  const removeRule = async (r: CommissionSplitRule) => {
    if (!(await confirm({ title: 'Split-Regel löschen?', danger: true, confirmLabel: 'Löschen' }))) return;
    await db.commissionSplitRules.remove(r.id);
    toast.success('Split-Regel gelöscht.');
    refetchRules();
  };

  /** Settle all open splits of one agent (marks split_paid_at). */
  const payOut = async (agentId: string) => {
    const list = byAgent.get(agentId) ?? [];
    const total = list.reduce((s, c) => s + (c.splitAmount ?? 0), 0);
    if (!(await confirm({ title: 'Auszahlung abrechnen?', body: `${agentName(agentId)}: ${list.length} Positionen, Saldo CHF ${total.toLocaleString()}.`, confirmLabel: 'Abrechnen' }))) return;
    setPayingAgent(agentId);
    try {
      const today = new Date().toISOString().slice(0, 10);
      for (const c of list) {
        await db.commissions.update(c.id, { splitPaidAt: today } as any);
      }
      refetchCommissions();
      auditService.log({ tenantId, actorId: user?.id, actorName: user ? `${user.firstName} ${user.lastName}` : null, action: 'PAYOUT', entityType: 'COMMISSION', entityId: agentId, summary: `Auszahlung an ${agentName(agentId)}: CHF ${total.toLocaleString()} (${list.length} Positionen)` });
      toast.success('Auszahlung verbucht.');
    } finally {
      setPayingAgent(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Split rules */}
        <Card title="Split-Regelwerk" className="lg:col-span-1" noPadding>
          <div className="p-4 space-y-3">
            {rules.length === 0 && (
              <p className="text-sm text-slate-500 italic">Noch keine Regeln. Ohne Regel wird kein Berater-Split gebucht.</p>
            )}
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 group">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{agentName(r.agentId)}</div>
                  <div className="text-xs text-slate-500">{r.line || 'alle Sparten'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-600 flex items-center gap-0.5">{r.rate}<Percent size={12} /></span>
                  <button onClick={() => removeRule(r)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" icon={<Plus size={14} />} onClick={() => { setError(null); setIsRuleOpen(true); }}>
              Regel hinzufügen
            </Button>
          </div>
        </Card>

        {/* Open payouts per agent */}
        <div className="lg:col-span-2">
          <Card title="Offene Auszahlungen" noPadding>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {byAgent.size === 0 && (
                <div className="px-6 py-10 text-center text-slate-500 italic text-sm">
                  Keine offenen Splits. Splits entstehen automatisch, sobald Courtagen mit
                  zugeordnetem Berater als «bezahlt» abgeglichen werden.
                </div>
              )}
              {[...byAgent.entries()].map(([agentId, list]) => {
                const credit = list.filter((c) => (c.splitAmount ?? 0) >= 0).reduce((s, c) => s + (c.splitAmount ?? 0), 0);
                const clawback = list.filter((c) => (c.splitAmount ?? 0) < 0).reduce((s, c) => s + (c.splitAmount ?? 0), 0);
                const saldo = credit + clawback;
                return (
                  <div key={agentId} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Users size={18} /></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{agentName(agentId)}</p>
                      <p className="text-xs text-slate-500">
                        {list.length} Positionen · Gutschriften <SensitiveData>CHF {credit.toLocaleString()}</SensitiveData>
                        {clawback < 0 && <> · Storno-Verrechnung <span className="text-red-500"><SensitiveData>CHF {clawback.toLocaleString()}</SensitiveData></span></>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase">Saldo</p>
                      <p className={`font-mono font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}><SensitiveData>CHF {saldo.toLocaleString()}</SensitiveData></p>
                    </div>
                    <Button size="sm" icon={payingAgent === agentId ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                      disabled={payingAgent === agentId} onClick={() => payOut(agentId)}>
                      Abrechnen
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Journal */}
      <Card title="Auszahlungs-Journal" noPadding>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">Ausbezahlt am</th>
              <th className="px-6 py-3">Berater</th>
              <th className="px-6 py-3">Position</th>
              <th className="px-6 py-3 text-right">Split</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paidJournal.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">Noch keine Auszahlungen.</td></tr>
            )}
            {paidJournal.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{c.splitPaidAt}</td>
                <td className="px-6 py-3 font-medium">{agentName(c.splitAgentId)}</td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{c.description}</td>
                <td className={`px-6 py-3 text-right font-mono ${(c.splitAmount ?? 0) < 0 ? 'text-red-600' : ''}`}>
                  <SensitiveData>CHF {(c.splitAmount ?? 0).toLocaleString()}</SensitiveData>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* RULE MODAL */}
      <Modal isOpen={isRuleOpen} onClose={() => setIsRuleOpen(false)} title="Split-Regel hinzufügen" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Berater *</label>
            <select value={ruleForm.agentId} onChange={(e) => setRuleForm({ ...ruleForm, agentId: e.target.value })} className={inputCls}>
              <option value="">– wählen –</option>
              {advisors.map((u: User) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sparte (leer = alle)</label>
              <input list="split-line-suggestions" value={ruleForm.line} onChange={(e) => setRuleForm({ ...ruleForm, line: e.target.value })} className={inputCls} />
              <datalist id="split-line-suggestions">
                {POLICY_TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Beteiligung (%) *</label>
              <input type="number" value={ruleForm.rate} onChange={(e) => setRuleForm({ ...ruleForm, rate: e.target.value })} className={inputCls} placeholder="z.B. 50" />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsRuleOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={saveRule} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={18} /> : 'Speichern'}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';
