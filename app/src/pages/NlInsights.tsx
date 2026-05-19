import { useState } from 'react';
import { Card, GuardrailBadge, PageHeader, SimpleChart, StatusChip } from '../components/ui';
import { nlTranscripts } from '../data';
import { ChevronDown, ChevronUp, Send, Sparkles } from 'lucide-react';

const samples = nlTranscripts.map((t) => t.question);

export function NlInsights() {
  const [selectedId, setSelectedId] = useState(nlTranscripts[0].id);
  const [draft, setDraft] = useState('');
  const [sqlOpen, setSqlOpen] = useState(false);

  const item = nlTranscripts.find((t) => t.id === selectedId) ?? nlTranscripts[0];

  return (
    <div>
      <PageHeader
        title="NL Insights"
        subtitle="Natural-language → governed metrics · grounded · cited · regulator-defensible"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card title="Pre-canned questions" subtitle="Pick one or type your own">
            <div className="space-y-1 max-h-[640px] overflow-y-auto">
              {nlTranscripts.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    t.id === selectedId ? 'bg-accent/10 border border-accent' : 'border border-transparent hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="text-[11px] text-ink-dim">{t.persona}</div>
                  <div className="text-sm">{t.question}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent flex-shrink-0" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={samples[Math.floor(Math.random() * samples.length)]}
                className="flex-1 bg-transparent text-sm focus:outline-none px-2 py-2"
              />
              <button
                className="btn-primary"
                onClick={() => {
                  if (!draft) return;
                  setDraft('');
                  setSelectedId(nlTranscripts[Math.floor(Math.random() * nlTranscripts.length)].id);
                }}
              >
                <Send size={14} /> Ask
              </button>
            </div>
            <div className="text-[11px] text-ink-dim mt-2">
              Intent classifier → metric resolver → SQL generator (Claude on Bedrock) → guardrail validator → execution
            </div>
          </Card>

          <Card>
            <div className="text-[11px] text-ink-dim mb-1">{item.persona} · resolved intent</div>
            <div className="font-semibold mb-1">{item.question}</div>
            <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
              <span className="chip-accent">{item.intent}</span>
              {item.metrics.map((m) => <span key={m} className="chip">metric · {m}</span>)}
              {item.dimensions.map((d) => <span key={d} className="chip">dim · {d}</span>)}
            </div>
          </Card>

          <Card title="Answer" subtitle={`${item.guardrails.rows} rows · ${item.guardrails.sensitivity}`}>
            <div className="text-sm leading-relaxed mb-4">{item.summary}</div>
            {item.chart !== 'table' && item.data.length > 0 && (
              <SimpleChart kind={item.chart} data={item.data} height={220} tone="accent" />
            )}
            {item.chart === 'table' && (
              <div className="text-xs text-ink-dim">Returned as table — see citations for source rows</div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <GuardrailBadge label={`RBAC ${item.guardrails.rbac}`} ok={item.guardrails.rbac === 'OK'} />
              <GuardrailBadge label={`Info-barrier ${item.guardrails.informationBarrier}`} ok={item.guardrails.informationBarrier === 'OK'} />
              <GuardrailBadge label={item.guardrails.tokenized ? 'Tokenized for downstream' : 'No tokenization required'} ok />
              <StatusChip status="Compliant" />
            </div>
          </Card>

          <Card>
            <button
              onClick={() => setSqlOpen((x) => !x)}
              className="w-full flex items-center justify-between text-sm font-medium"
            >
              <span>Generated SQL</span>
              {sqlOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {sqlOpen && (
              <pre className="id-mono text-[11px] mt-3 bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto">
                {item.sql}
              </pre>
            )}
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Citations (source rows)">
              <ul className="space-y-1">
                {item.citations.map((c) => (
                  <li key={c} className="id-mono text-xs">{c}</li>
                ))}
              </ul>
            </Card>
            <Card title="Follow-up suggestions">
              <ul className="space-y-1 text-sm">
                {item.followups.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
