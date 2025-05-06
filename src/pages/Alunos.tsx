import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, MoreVertical, Edit, Trash2, Star, Upload } from "lucide-react";
import { StudentForm, Student } from "@/components/students/StudentForm";
import { DeleteConfirmation } from "@/components/students/DeleteConfirmation";
import { EvaluationForm, Evaluation } from "@/components/students/EvaluationForm";
import { ImportStudentsForm } from "@/components/students/ImportStudentsForm";
import { useToast } from "@/components/ui/use-toast";
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from "@/hooks/useStudents";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getLocalData, saveLocalData } from '@/utils/localStorage';

const Alunos = () => {
  const { data: students = [], isLoading } = useStudents();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEvaluationFormOpen, setIsEvaluationFormOpen] = useState(false);
  const [isImportFormOpen, setIsImportFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    let result = [...students];
    
    if (searchTerm) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      result = result.filter(student => 
        student.category === categoryFilter
      );
    }
    
    if (statusFilter) {
      result = result.filter(student => 
        student.status === statusFilter
      );
    }
    
    setFilteredStudents(result);
  }, [students, searchTerm, categoryFilter, statusFilter]);

  const calculateCategoryDistribution = (studentsData: Student[]) => {
    const distribution = studentsData.reduce((acc: { [key: string]: number }, student) => {
      acc[student.category] = (acc[student.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([category, count]) => ({
      category,
      count
    }));
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentFormOpen(true);
  };

  const openEvaluationForm = (student: Student) => {
    setSelectedStudent(student);
    setIsEvaluationFormOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveStudent = (student: Student) => {
    const isExisting = student.id !== 0;
    if (isExisting) {
      updateStudent.mutate(student, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Aluno atualizado com sucesso." });
        },
      });
    } else {
      createStudent.mutate(student as Omit<Student, 'id'>, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Novo aluno adicionado com sucesso." });
        },
      });
    }
  };

  const handleDeleteStudent = () => {
    if (selectedStudent) {
      deleteStudent.mutate(selectedStudent.id, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Aluno excluído com sucesso." });
          setIsDeleteDialogOpen(false);
        },
      });
    }
  };

  const handleSaveEvaluation = (evaluation: Evaluation) => {
    const evaluations = getLocalData<Evaluation[]>("evaluations", []);
    const updatedEvaluations = [...evaluations, evaluation];
    
    saveLocalData("evaluations", updatedEvaluations);
    
    toast({
      title: "Sucesso",
      description: "Avaliação salva com sucesso.",
    });
    
    setIsEvaluationFormOpen(false);
  };

  const handleImportStudents = (importedStudents: Omit<Student, 'id'>[]) => {
    importedStudents.forEach(student => {
      createStudent.mutate(student, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Alunos importados com sucesso." });
        },
      });
    });
  };

  const categories = [
    "Sub-7",
    "Sub-9", 
    "Sub-11",
    "Sub-13",
    "Sub-15",
    "Sub-17"
  ];

  const calculateStudentStats = () => {
    const total = students.length;
    const scholars = students.filter(student => student.hasScholarship).length;
    const paying = total - scholars;
    
    return {
      total,
      scholars,
      paying
    };
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return students.filter(student => {
      if (!student.birthDate) return false;
      
      const birthDate = new Date(student.birthDate);
      const birthDateThisYear = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );
      
      return birthDateThisYear >= today && birthDateThisYear <= nextWeek;
    }).sort((a, b) => {
      const dateA = new Date(a.birthDate || "");
      const dateB = new Date(b.birthDate || "");
      return dateA.getDate() - dateB.getDate();
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-2 sm:p-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Alunos</h2>
            <p className="text-muted-foreground">
              Gerencie todos os alunos da escola
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsImportFormOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" /> Importar
            </Button>
            <Button 
              className="bg-football-green hover:bg-football-dark-green"
              onClick={() => {
                setSelectedStudent(null);
                setIsStudentFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Aluno
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calculateCategoryDistribution(students)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Alunos" fill="#0D9F4F" label={{ position: 'top' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total de Alunos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <p className="text-4xl font-bold text-football-green">{students.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2">
          <div className="relative flex-1 max-w-full sm:max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar alunos..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">Categoria</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCategoryFilter("")}>Todas</DropdownMenuItem>
              {categories.map((cat) => (
                <DropdownMenuItem 
                  key={cat} 
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("")}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Ativo")}>Ativo</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Pagamento Pendente")}>Pendente</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Inativo")}>Inativo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Atleta</TableHead>
                <TableHead>Data de Nasc.</TableHead>
                <TableHead>RG</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Início em</TableHead>
                <TableHead>Polo</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Nome do Responsável</TableHead>
                <TableHead>CPF do Responsável</TableHead>
                <TableHead>Whatsapp</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      {student.birthDate 
                        ? new Date(student.birthDate).toLocaleDateString("pt-BR") 
                        : ""}
                    </TableCell>
                    <TableCell>{student.rg}</TableCell>
                    <TableCell>{student.cpf}</TableCell>
                    <TableCell>{student.category}</TableCell>
                    <TableCell>
                      {student.joinDate && /^\d{4}-\d{2}-\d{2}/.test(student.joinDate)
                        ? new Date(student.joinDate).toLocaleDateString('pt-BR')
                        : student.joinDate
                      }
                    </TableCell>
                    <TableCell>{student.polo}</TableCell>
                    <TableCell>{student.status}</TableCell>
                    <TableCell>{student.responsibleName}</TableCell>
                    <TableCell>{student.responsibleCpf}</TableCell>
                    <TableCell>{student.whatsapp}</TableCell>
                    <TableCell>{student.address}</TableCell>
                    <TableCell>{student.position}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(student)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEvaluationForm(student)}>
                            <Star className="mr-2 h-4 w-4" /> Avaliar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => openDeleteDialog(student)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-6 text-muted-foreground">
                    Nenhum aluno encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <StudentForm
        open={isStudentFormOpen}
        onClose={() => setIsStudentFormOpen(false)}
        onSave={handleSaveStudent}
        initialData={selectedStudent || undefined}
      />

      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteStudent}
      />

      <EvaluationForm
        open={isEvaluationFormOpen}
        onClose={() => setIsEvaluationFormOpen(false)}
        onSave={handleSaveEvaluation}
        student={selectedStudent}
        studentsList={students}
      />

      <ImportStudentsForm
        open={isImportFormOpen}
        onClose={() => setIsImportFormOpen(false)}
        onImport={handleImportStudents}
      />
    </MainLayout>
  );
};

export default Alunos;
