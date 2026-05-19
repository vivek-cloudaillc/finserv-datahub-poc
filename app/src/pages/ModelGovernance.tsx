import { useState } from 'react';
import { Card, PageHeader, SimpleChart, StatusChip } from '../components/ui';
import { modelCards } from '../data';

export function ModelGovernance() {
  const [selectedId, setSelectedId] = useState(modelCards[0].id);
  const item = modelCards.find((m) => m.id === selectedId) ?? modelCards[0];

  return (
    <div>
      <PageHeader
        title="Model Governance (SR 11-7)"
        subtitle="Registry · model cards · validation · drift · fairness · challenger framework"
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card title="Model registry">
            <div className="space-y-1 max-h-[640px] overflow-y-auto">
              {modelCards.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    m.id === selectedId ? 'bg-accent/10 border border-accent' : 'border border-transparent hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{m.name}</span>
                    <StatusChip status={m.status} />
                  </div>
                  <div className="text-[11px] text-ink-dim mt-0.5">
                    {m.version} · drift {Math.round(m.drift * 100)}% · next {m.nextReview}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{item.name}</div>
                <div className="text-xs text-ink-dim mt-1">{item.purpose}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusChip status={item.status} />
                  <StatusChip status={item.sr11_7} />
                  <span className="chip">version {item.version}</span>
                  <span className="chip">owner {item.owner}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-3">
            <Card title="Performance">
              {item.performance.length > 0 ? (
                <SimpleChart
                  kind="bar"
                  data={item.performance.map((p) => ({ name: p.metric, value: typeof p.value === 'number' ? p.value : 0 }))}
                  height={180}
                />
              ) : <div className="text-xs text-ink-dim">No metrics tracked</div>}
            </Card>
            <Card title="Fairness">
              {item.fairness.length > 0 ? (
                <SimpleChart
                  kind="bar"
                  data={item.fairness.map((p) => ({ name: p.metric, value: p.value }))}
                  height={180}
                  tone="gold"
                />
              ) : <div className="text-xs text-ink-dim">Not applicable</div>}
            </Card>
            <Card title="Drift / health">
              <div className="space-y-2 text-sm">
                <div>Last validated: <span className="font-medium">{item.lastValidated}</span></div>
                <div>Next review: <span className="font-medium">{item.nextReview}</span></div>
                <div>Drift score: <span className={`font-medium ${item.drift > 0.05 ? 'text-warn' : 'text-ok'}`}>{(item.drift * 100).toFixed(1)}%</span></div>
              </div>
            </Card>
          </div>

          <Card title="Training-data lineage">
            <ul className="text-sm space-y-1">
              {item.trainingData.map((t) => (
                <li key={t} className="id-mono text-xs">{t}</li>
              ))}
            </ul>
          </Card>

          <Card title="SR 11-7 chain">
            <ol className="text-sm space-y-1 list-decimal pl-5">
              <li>Identification · model registered with purpose and use case</li>
              <li>Development · documented methodology, data, assumptions</li>
              <li>Independent validation · pre-deployment, current</li>
              <li>Approval · risk-aligned governance committee</li>
              <li>Monitoring · drift, fairness, performance — current</li>
              <li>Challenger · in-place backup model for credit + claims</li>
              <li>Retirement · scheduled prior to next material business change</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
