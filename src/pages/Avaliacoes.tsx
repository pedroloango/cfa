import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Star, ClipboardList, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useStudents } from "@/hooks/useStudents";
import { EvaluationForm, Evaluation } from "@/components/students/EvaluationForm";
import { AttendanceForm, AttendanceRecord } from "@/components/students/AttendanceForm";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "@/lib/supabase";
import { EvaluationTable } from "@/components/evaluations/EvaluationTable";
import { EvaluationFilters } from "@/components/evaluations/EvaluationFilters";
import { EvaluationRadarCharts } from "@/components/evaluations/EvaluationRadarCharts";
import { EvaluationTrendChart } from "@/components/evaluations/EvaluationTrendChart";
import { getStoredStudents } from "@/components/students/studentStorage";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Avaliacoes = () => {
  const { data: students = [] } = useStudents();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceCategoryFilter, setAttendanceCategoryFilter] = useState("all");
  const [attendanceStudentFilter, setAttendanceStudentFilter] = useState("all");
  const { toast } = useToast();
  const categories = Array.from(new Set(students.map(s => s.category))).sort();

  useEffect(() => {
    loadEvaluations();
    loadAttendanceRecords();
  }, []);

  useEffect(() => {
    filterEvaluations();
  }, [evaluations, searchTerm, categoryFilter]);

  const loadEvaluations = async () => {
    try {
      const { data: evaluationsData, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          student:students(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      if (evaluationsData) {
        const formattedEvaluations = evaluationsData.map(evaluation => ({
          ...evaluation,
          date: new Date(evaluation.date),
          student: evaluation.student
        }));
        setEvaluations(formattedEvaluations);
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast({
        title: "Erro ao carregar avaliações",
        description: "Não foi possível carregar as avaliações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          details:attendance_details(
            *,
            student:students(*)
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Erro ao carregar registros de presença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros de presença.",
        variant: "destructive",
      });
    }
  };

  const filterEvaluations = () => {
    let filtered = [...evaluations];

    if (searchTerm) {
      filtered = filtered.filter(evaluation =>
        evaluation.student?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(evaluation =>
        evaluation.student?.category === categoryFilter
      );
    }

    setFilteredEvaluations(filtered);
  };

  const handleSaveEvaluation = async (evaluation: Evaluation) => {
    try {
      if (!evaluation.student?.id) {
        throw new Error("Aluno não selecionado");
      }

      // Get the current user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error("Usuário não autenticado");
      }
      const user = JSON.parse(userStr);

      const evaluationData = {
        student_id: evaluation.student.id,
        date: evaluation.date.toISOString(),
        technical: evaluation.technical,
        tactical: evaluation.tactical,
        physical: evaluation.physical,
        mental: evaluation.mental,
        notes: evaluation.notes,
        created_by: user.id
      };

      let error;
      if (evaluation.id) {
        const { error: updateError } = await supabase
          .from('evaluations')
          .update(evaluationData)
          .eq('id', evaluation.id)
          .select();
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('evaluations')
          .insert([evaluationData])
          .select();
        error = insertError;
      }

      if (error) {
        console.error('Error details:', error);
        throw new Error(error.message || 'Erro ao salvar avaliação');
      }

      await loadEvaluations();
        setIsEvaluationModalOpen(false);
      setSelectedEvaluation(null);
      toast({
        title: "Sucesso",
        description: `Avaliação ${evaluation.id ? 'atualizada' : 'criada'} com sucesso!`,
      });
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast({
        title: "Erro ao salvar avaliação",
        description: error instanceof Error ? error.message : "Não foi possível salvar a avaliação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvaluation = async (id: number) => {
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadEvaluations();
      toast({
        title: "Sucesso",
        description: "Avaliação excluída com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast({
        title: "Erro ao excluir avaliação",
        description: "Não foi possível excluir a avaliação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const calculateAttendanceStats = () => {
    const stats = new Map<string, { present: number; absent: number; total: number }>();
    
    attendanceRecords.forEach(record => {
      const category = record.category;
      const present = record.details?.filter(d => d.present).length || 0;
      const absent = record.details?.filter(d => !d.present).length || 0;
      const total = present + absent;
      
      if (!stats.has(category)) {
        stats.set(category, { present: 0, absent: 0, total: 0 });
      }
      
      const current = stats.get(category)!;
      stats.set(category, {
        present: current.present + present,
        absent: current.absent + absent,
        total: current.total + total
      });
    });

    return Array.from(stats.entries()).map(([category, { present, absent, total }]) => ({
      category,
      present,
      absent,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    }));
  };

  const attendanceData = calculateAttendanceStats();

  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    const matchesCategory = attendanceCategoryFilter === "all" || record.category === attendanceCategoryFilter;
    const matchesStudent = attendanceStudentFilter === "all" || 
      record.details?.some(detail => detail.student?.id.toString() === attendanceStudentFilter);
    return matchesCategory && matchesStudent;
  });

  const getAverageRatings = (studentId: number | string) => {
    const studentEvaluations = evaluations.filter(e => e.student?.id === studentId);
    if (studentEvaluations.length === 0) return null;

    const latestEvaluation = studentEvaluations[0];
    return [
      { skill: "Técnica", value: latestEvaluation.technical },
      { skill: "Tática", value: latestEvaluation.tactical },
      { skill: "Física", value: latestEvaluation.physical },
      { skill: "Mental", value: latestEvaluation.mental },
    ];
  };

  const handleSaveAttendance = async (record: AttendanceRecord) => {
    try {
      const { data: attendanceRecord, error: recordError } = await supabase
        .from('attendance_records')
        .insert([{
          date: record.date.toISOString(),
          category: record.category
        }])
        .select()
        .single();

      if (recordError) throw recordError;

      if (attendanceRecord) {
        const details = record.details.map(detail => ({
          attendance_record_id: attendanceRecord.id,
          student_id: detail.student.id,
          present: detail.present
        }));

        const { error: detailsError } = await supabase
          .from('attendance_details')
          .insert(details);

        if (detailsError) throw detailsError;

        await loadAttendanceRecords();
        setIsAttendanceModalOpen(false);
        toast({
          title: "Sucesso",
          description: "Presença registrada com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Erro ao salvar presença",
        description: "Não foi possível salvar o registro de presença. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-2 sm:p-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Avaliações</h2>
            <p className="text-muted-foreground">
              Gerencie as avaliações e presenças dos alunos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAttendanceModalOpen(true)}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Registrar Presença
            </Button>
            <Button
              onClick={() => setIsEvaluationModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Presença por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} alunos`, '']}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="present" 
                      name="Presentes" 
                      fill="#0D9F4F"
                      label={{ position: 'top' }}
                    />
                    <Bar 
                      dataKey="absent" 
                      name="Ausentes" 
                      fill="#FF4B4B"
                      label={{ position: 'top' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Presença</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      dataKey="percentage"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2">
          <div className="relative flex-1 max-w-full sm:max-w-sm w-full">
            <Input
              type="search"
              placeholder="Buscar avaliações..."
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">Categoria</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCategoryFilter("all")}>Todas</DropdownMenuItem>
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
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Avaliação Geral</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>{evaluation.student?.name}</TableCell>
                    <TableCell>{evaluation.student?.category}</TableCell>
                    <TableCell>
                      {new Date(evaluation.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {((evaluation.technical + evaluation.tactical + evaluation.physical + evaluation.mental) / 4).toFixed(1)}
                    </TableCell>
                    <TableCell>{evaluation.notes}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedEvaluation(evaluation);
                            setIsEvaluationModalOpen(true);
                          }}>
                            <Star className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhuma avaliação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Registros de Presença</h3>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  {attendanceCategoryFilter === "all" ? "Todas as Categorias" : attendanceCategoryFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setAttendanceCategoryFilter("all")}>
                  Todas as Categorias
                </DropdownMenuItem>
                {Array.from(new Set(students.map(s => s.category))).map((cat) => (
                  <DropdownMenuItem 
                    key={cat} 
                    onClick={() => setAttendanceCategoryFilter(cat)}
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  {attendanceStudentFilter === "all" ? "Todos os Alunos" : 
                    students.find(s => s.id.toString() === attendanceStudentFilter)?.name || "Aluno"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setAttendanceStudentFilter("all")}>
                  Todos os Alunos
                </DropdownMenuItem>
                {students.map((student) => (
                  <DropdownMenuItem 
                    key={student.id} 
                    onClick={() => setAttendanceStudentFilter(student.id.toString())}
                  >
                    {student.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Presentes</TableHead>
                  <TableHead>Ausentes</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendanceRecords.length > 0 ? (
                  filteredAttendanceRecords.map((record) => {
                    const presentCount = record.details?.filter(d => d.present).length || 0;
                    const absentCount = record.details?.filter(d => !d.present).length || 0;
                    const total = presentCount + absentCount;

                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{record.category}</TableCell>
                        <TableCell className="text-green-600">{presentCount}</TableCell>
                        <TableCell className="text-red-600">{absentCount}</TableCell>
                        <TableCell>{total}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum registro de presença encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          </div>
        </div>

        <EvaluationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        categories={categories}
        />

        <EvaluationRadarCharts
          students={students}
          evaluations={evaluations}
          getAverageRatings={getAverageRatings}
        />

          <EvaluationTrendChart evaluations={evaluations} />

      <EvaluationTable
        evaluations={filteredEvaluations}
        onView={(evaluation) => {
          setSelectedEvaluation(evaluation);
          setIsEvaluationModalOpen(true);
        }}
        onEdit={(evaluation) => {
          setSelectedEvaluation(evaluation);
          setIsEvaluationModalOpen(true);
        }}
        onDelete={handleDeleteEvaluation}
      />

      <EvaluationForm
        open={isEvaluationModalOpen}
        onClose={() => {
          setIsEvaluationModalOpen(false);
          setSelectedEvaluation(null);
        }}
        onSave={handleSaveEvaluation}
        initialData={selectedEvaluation}
        studentsList={students}
      />

      <AttendanceForm
        open={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onSave={handleSaveAttendance}
        students={students}
      />
    </MainLayout>
  );
};

export default Avaliacoes;
