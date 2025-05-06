
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';

const data = [
  {
    subject: 'Técnica',
    Média: 80,
    Melhor: 95,
    fullMark: 100,
  },
  {
    subject: 'Tática',
    Média: 75,
    Melhor: 90,
    fullMark: 100,
  },
  {
    subject: 'Físico',
    Média: 85,
    Melhor: 92,
    fullMark: 100,
  },
  {
    subject: 'Mental',
    Média: 70,
    Melhor: 88,
    fullMark: 100,
  },
  {
    subject: 'Disciplina',
    Média: 90,
    Melhor: 98,
    fullMark: 100,
  },
];

export function PerformanceChart() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Desempenho</CardTitle>
        <CardDescription>Métricas de avaliação dos atletas</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <Radar name="Média" dataKey="Média" stroke="#0D9F4F" fill="#0D9F4F" fillOpacity={0.4} />
            <Radar name="Melhor" dataKey="Melhor" stroke="#FFD700" fill="#FFD700" fillOpacity={0.4} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
