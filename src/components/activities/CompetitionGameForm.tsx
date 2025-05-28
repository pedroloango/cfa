import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Pode ser útil para Local ou Nome do Campeonato se for longo
import { DatePicker } from "@/components/ui/date-picker"; // Reutilizar o DatePicker
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useFeeSettingsCategories } from "@/hooks/useFeeSettingsCategories"; // Importar o novo hook
import { useEffect } from "react"; // Adicionado useEffect

// TODO: Mover para um arquivo de tipos compartilhado se necessário
export interface CompetitionGame {
  id?: string; // ou number
  championshipName: string;
  category: string;
  date: Date; 
  time: string;
  location: string;
  selectedHour?: string;
  selectedMinute?: string;
}

const competitionGameSchema = z.object({
  championshipName: z.string().min(3, { message: "Nome do campeonato deve ter pelo menos 3 caracteres." }),
  category: z.string().min(1, { message: "Selecione uma categoria." }),
  date: z.date({ required_error: "Data é obrigatória." }),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):([0-5])0$/, { message: "Horário inválido. Os minutos devem terminar em 0." }),
  location: z.string().min(3, { message: "Local deve ter pelo menos 3 caracteres." }),
  selectedHour: z.string().optional(),
  selectedMinute: z.string().optional(),
}).refine(data => data.selectedHour && data.selectedMinute, {
  message: "Hora e minuto são obrigatórios",
  path: ["time"],
});

interface CompetitionGameFormProps {
  initialData?: CompetitionGame;
  onSave: (data: CompetitionGame) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minuteOptions = Array.from({ length: 6 }, (_, i) => (i * 10).toString().padStart(2, '0'));

export const CompetitionGameForm = ({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: CompetitionGameFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger
  } = useForm<CompetitionGame>({
    resolver: zodResolver(competitionGameSchema),
    defaultValues: initialData ? {
      ...initialData,
      selectedHour: initialData.time?.split(':')[0] || "",
      selectedMinute: initialData.time?.split(':')[1] || "",
    } : {
      championshipName: "",
      category: "",
      date: new Date(),
      time: "",
      selectedHour: "10",
      selectedMinute: "00",
      location: "",
    },
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useFeeSettingsCategories();
  const availableCategories = categoriesData || [];

  const selectedHour = watch("selectedHour");
  const selectedMinute = watch("selectedMinute");

  useEffect(() => {
    if (selectedHour && selectedMinute) {
      setValue("time", `${selectedHour}:${selectedMinute}`);
      trigger("time");
    } else {
      setValue("time", "");
    }
  }, [selectedHour, selectedMinute, setValue, trigger]);

  const onSubmit = (data: CompetitionGame) => {
    const dataToSave = { ...data };
    delete dataToSave.selectedHour;
    delete dataToSave.selectedMinute;
    onSave(dataToSave);
    if(!initialData) { 
        reset({
            championshipName: "",
            category: "",
            date: new Date(),
            time: "",
            selectedHour: "10", 
            selectedMinute: "00",
            location: "",
        });
    }
  };

  const selectedCategoryValue = watch("category");

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Jogo/Atividade" : "Cadastrar Novo Jogo/Atividade"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="championshipName">Nome do Campeonato</Label>
              <Input 
                id="championshipName" 
                {...register("championshipName")} 
                placeholder="Ex: Copa Futuro Craque"
                disabled={isLoading}
              />
              {errors.championshipName && <p className="text-sm text-red-500">{errors.championshipName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={selectedCategoryValue || field.value}
                    disabled={isLoading || isLoadingCategories}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={isLoadingCategories ? "Carregando categorias..." : "Selecione a categoria"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : availableCategories.length > 0 ? (
                        availableCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-cat" disabled>Nenhuma categoria encontrada</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker 
                    date={field.value}
                    setDate={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Horário</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Controller
                    name="selectedHour"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {hourOptions.map(hour => (
                            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex items-center">:</div>
                <div className="flex-1">
                  <Controller
                    name="selectedMinute"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Minuto" />
                        </SelectTrigger>
                        <SelectContent>
                          {minuteOptions.map(minute => (
                            <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time.message}</p>}
              {errors.selectedHour && !errors.time && <p className="text-sm text-red-500 mt-1">Hora é obrigatória.</p>}
              {errors.selectedMinute && !errors.time && <p className="text-sm text-red-500 mt-1">Minuto é obrigatório.</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Textarea 
              id="location" 
              {...register("location")} 
              placeholder="Ex: Campo da Praça Central, Ginásio Municipal"
              disabled={isLoading}
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isLoadingCategories}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-football-green hover:bg-football-dark-green" disabled={isLoading || isLoadingCategories}>
            {isLoading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Salvar Jogo")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 