import { Bar, BarChart, Cell, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function GraficoProteina({ dados, meta, max = 150 }: { dados: { rotulo: string; proteina: number }[]; meta: number; max?: number }) {
  const topo = Math.max(max + 20, ...dados.map((d) => d.proteina + 10));
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <BarChart data={dados} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <ReferenceArea y1={meta} y2={max} fill="rgb(var(--verde))" fillOpacity={0.12} />
          <ReferenceLine y={meta} stroke="rgb(var(--verde))" strokeDasharray="4 4" />
          <XAxis dataKey="rotulo" tick={{ fill: 'rgb(var(--suave))', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, topo]} tick={{ fill: 'rgb(var(--suave))', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgb(var(--elevado))' }}
            contentStyle={{ background: 'rgb(var(--superficie))', border: '1px solid rgb(var(--borda))', borderRadius: 12, color: 'rgb(var(--texto))' }}
            formatter={(v: number) => [`${v} g`, 'Proteína']}
          />
          <Bar dataKey="proteina" radius={[8, 8, 4, 4]}>
            {dados.map((d, i) => (
              <Cell key={i} fill={d.proteina >= meta ? 'rgb(var(--verde))' : 'rgb(var(--ouro))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
