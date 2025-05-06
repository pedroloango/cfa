import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { StudentDB } from "@/components/students/studentStorage";
import { Evaluation } from "@/components/students/EvaluationForm";

interface AverageRating {
  skill: string;
  value: number;
}

interface EvaluationRadarChartsProps {
  students: StudentDB[];
  evaluations: Evaluation[];
  getAverageRatings: (studentId: number | string) => AverageRating[] | null;
}

export function EvaluationRadarCharts({
  students,
  evaluations,
  getAverageRatings,
}: EvaluationRadarChartsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {students
        .filter(student =>
          evaluations.some(evaluation => evaluation.student?.id === student.id)
        )
        .slice(0, 3)
        .map(student => {
          const averageRatings = getAverageRatings(student.id);
          return (
            <Card key={student.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {student.name} ({student.category})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {averageRatings ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={averageRatings}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar
                          name="Média"
                          dataKey="value"
                          stroke="#0D9F4F"
                          fill="#0D9F4F"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Sem dados de avaliação
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
