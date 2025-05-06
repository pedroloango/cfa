
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const recentStudents = [
  {
    id: 1,
    name: "Lucas Silva",
    category: "Sub-13",
    lastActivity: "Aula ontem",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Pedro Santos",
    category: "Sub-15",
    lastActivity: "Avaliação hoje",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Rafael Oliveira",
    category: "Sub-11",
    lastActivity: "Pagamento pendente",
    status: "Pendente",
  },
  {
    id: 4,
    name: "João Mendes",
    category: "Sub-17",
    lastActivity: "Aula hoje",
    status: "Ativo",
  },
  {
    id: 5,
    name: "Thiago Costa",
    category: "Sub-13",
    lastActivity: "Faltou ontem",
    status: "Ativo",
  },
];

export function RecentStudents() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Alunos Recentes</CardTitle>
        <CardDescription>
          Lista dos alunos com atividades recentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {student.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {student.lastActivity}
                </p>
                <Badge
                  variant={student.status === "Ativo" ? "default" : "outline"}
                  className={
                    student.status === "Ativo"
                      ? "bg-football-green hover:bg-football-dark-green"
                      : "text-orange-500 border-orange-500"
                  }
                >
                  {student.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
