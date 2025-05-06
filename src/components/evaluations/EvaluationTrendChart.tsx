import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Evaluation } from '@/components/students/EvaluationForm';

interface TrendChartProps {
  evaluations: Evaluation[];
}

export function EvaluationTrendChart({ evaluations }: TrendChartProps) {
  const { data, studentNames } = useMemo(() => {
    // Unique sorted dates
    const dates = Array.from(new Set(evaluations.map(ev => ev.date))).sort();
    // Unique student names
    const studentNames = Array.from(new Set(evaluations.map(ev => ev.student?.name)));

    // Build data rows per date
    const data = dates.map(date => {
      const row: Record<string, number | string> = { 
        date: format(date, "dd/MM/yyyy", { locale: ptBR })
      };
      evaluations
        .filter(ev => ev.date === date)
        .forEach(ev => {
          // average score
          const avg = Number(((ev.technical + ev.tactical + ev.physical + ev.mental) / 4).toFixed(1));
          row[ev.student?.name || ''] = avg;
        });
      return row;
    });

    return { data, studentNames };
  }, [evaluations]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d0ed57'];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          {studentNames.map((name, idx) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={colors[idx % colors.length]}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 