
import { Student } from "./StudentForm";
import { getLocalData, saveLocalData } from "@/utils/localStorage";

export interface StudentDB extends Student {
  id: number;
  number?: number; // Number property as optional
}

export const getStoredStudents = (): StudentDB[] => {
  return getLocalData<StudentDB[]>("students", []);
};

// Function to format a date string for display without timezone issues
export const formatDateForDisplay = (dateString: string | undefined): string => {
  if (!dateString) return "";
  
  // Create a date object from the string and adjust for timezone
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Format as DD/MM/YYYY
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};

export const saveStudent = (student: Student): StudentDB => {
  const students = getStoredStudents();
  
  const existingIndex = students.findIndex((s) => s.id === student.id);
  let updatedStudents: StudentDB[];
  let savedStudent: StudentDB;
  
  if (existingIndex !== -1) {
    savedStudent = { ...student } as StudentDB;
    updatedStudents = [...students];
    updatedStudents[existingIndex] = savedStudent;
  } else {
    savedStudent = { 
      ...student, 
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1 
    } as StudentDB;
    updatedStudents = [...students, savedStudent];
  }
  
  saveLocalData("students", updatedStudents);
  return savedStudent;
};

export const deleteStudent = (studentId: number) => {
  const students = getStoredStudents();
  const updatedStudents = students.filter((s) => s.id !== studentId);
  saveLocalData("students", updatedStudents);
};
