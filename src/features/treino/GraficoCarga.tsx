import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatar } from '@/lib/datas';

export function GraficoCarga({ dados }: { dados: { data: string; carga: number; reps: number }[] }) {
  if (dados.length === 0) return <p className="py-6 text-center text-sm text-suave">Sem registros ainda. Depois do primeiro treino a evolução aparece aqui.</p>;
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <LineChart data={dados.map((d) => ({ ...d, rotulo: formatar(d.data, 'dd/MM') }))} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="rgb(var(--borda))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="rotulo" tick={{ fill: 'rgb(var(--suave))', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgb(var(--suave))', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} unit=" kg" width={58} />
          <Tooltip
            contentStyle={{ background: 'rgb(var(--superficie))', border: '1px solid rgb(var(--borda))', borderRadius: 12, color: 'rgb(var(--texto))' }}
            formatter={(v: number, _n, p) => [`${v} kg × ${(p.payload as { reps: number }).reps}`, 'Melhor série']}
          />
          <Line type="monotone" dataKey="carga" stroke="rgb(var(--ouro))" strokeWidth={3} dot={{ r: 4, fill: 'rgb(var(--ouro))' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
