import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import QuestionnaireList from "../components/QuestionnaireList";
import "./admi.css"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  LogOut,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Download,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
interface User {
  id: string;
  name: string;
  role: string;
  faculty: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Questionnaire {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedAt?: string;
  teacherId: string;
  teacherName?: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  startTime: string;
  endTime: string;
  questions: Question[];
  status: "upcoming" | "active" | "completed";
  questionnaireId: string;
  faculty: string;
}

interface ExamResult {
  userName: string;
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
    submitted_at: string;
  answers: { [key: string]: number };
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}


const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Date non disponible";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "Date invalide" : date.toLocaleString();
};




  const { faculty } = useParams();
  const { setUser } = useUser();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [examForm, setExamForm] = useState({ 
    duration: 60, 
    startTime: "", 
    endTime: "",
    title: "",
    subject: ""
    
  });
  
  const [isSchedulingExam, setIsSchedulingExam] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState({
    exams: false,
    questionnaires: false,
    results: false,
    users: false
  });
  const { toast } = useToast();
  

  const fetchExams = async () => {
    setIsLoading(prev => ({...prev, exams: true}));
    try {
      const res = await fetch(`http://localhost:3001/api/exams?faculty=${user.faculty}`); 
    
      if (!res.ok) throw new Error("Échec du chargement des examens");
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error("Erreur lors du chargement des examens:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les examens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({...prev, exams: false}));
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchQuestionnaires = async () => {
    setIsLoading(prev => ({...prev, questionnaires: true}));
    try {
      const res = await fetch("http://localhost:3001/api/questionnaires/submitted", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error("Échec du chargement des questionnaires");
      const data = await res.json();
      setQuestionnaires(data);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les questionnaires",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({...prev, questionnaires: false}));
    }
  };

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchResults = async () => {
    setIsLoading(prev => ({...prev, results: true}));
    try {
      const res = await fetch("http://localhost:3001/api/results", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error("Échec du chargement des résultats");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Erreur lors du chargement des résultats:", err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les résultats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({...prev, results: false}));
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

const openScheduleExamDialog = async (questionnaire: Questionnaire) => {
  console.log("Questionnaire sélectionné :", questionnaire);

  try {
    const res = await fetch(`http://localhost:3001/api/questionnaires/${questionnaire.id}/questions`);
    if (!res.ok) {
      throw new Error("Impossible de récupérer les questions du questionnaire");
    }

    const questions = await res.json();
    console.log("Questions liées au questionnaire :", questions);

    const enrichedQuestionnaire = {
      ...questionnaire,
      questions
    };

    setSelectedQuestionnaire(enrichedQuestionnaire);
    setExamForm(prev => ({
      ...prev,
      title: questionnaire.title,
      subject: questionnaire.subject
    }));
    setIsSchedulingExam(true);

  } catch (error) {
    console.error("Erreur lors du chargement des questions :", error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les questions du questionnaire",
      variant: "destructive"
    });
  }
    
};
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/questionnaires/approve/${id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Approval failed");
      }
      
      setQuestionnaires(prev => prev.map(q => q.id === id ? { ...q, status: "approved" } : q));
      toast({ title: "Succès", description: "Questionnaire approuvé." });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Erreur", 
        description: err instanceof Error ? err.message : "Could not approve", 
        variant: "destructive" 
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/questionnaires/reject/${id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Rejection failed");
      }
      
      setQuestionnaires(prev => prev.filter(q => q.id !== id));
      toast({ title: "Rejeté", description: "Questionnaire rejeté." });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Erreur", 
        description: err instanceof Error ? err.message : "Could not reject", 
        variant: "destructive" 
      });
    }
  };

  const validateExamForm = (): boolean => {
    if (!examForm.title || !examForm.subject) {
      toast({
        title: "Erreur",
        description: "Le titre et la matière sont obligatoires",
        variant: "destructive",
      });
      return false;
    }

    if (examForm.duration <= 0) {
      toast({
        title: "Erreur",
        description: "La durée doit être positive",
        variant: "destructive",
      });
      return false;
    }

    if (!examForm.startTime || !examForm.endTime) {
      toast({
        title: "Erreur",
        description: "Les dates de début et fin sont obligatoires",
        variant: "destructive",
      });
      return false;
    }

    const now = new Date();
    const startDate = new Date(examForm.startTime);
    const endDate = new Date(examForm.endTime);

    if (startDate <= now) {
      toast({
        title: "Erreur",
        description: "La date de début doit être dans le futur",
        variant: "destructive",
      });
      return false;
    }

    if (endDate <= startDate) {
      toast({
        title: "Erreur",
        description: "La date de fin doit être après la date de début",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const scheduleExam = async () => {
    if (!selectedQuestionnaire || !user?.faculty) {
      toast({
        title: "Erreur",
        description: "Questionnaire ou faculté manquant",
        variant: "destructive",
      });
      return;
    }

    if (!validateExamForm()) return;

    try {
      const payload = {
        title: examForm.title,
        subject: examForm.subject,
        duration: Number(examForm.duration),
        startTime: examForm.startTime,
        endTime: examForm.endTime,
        faculty: user.faculty,
        questionnaire_id: selectedQuestionnaire?.id|| null,
        questions: selectedQuestionnaire?.questions|| [],
        teacherId: selectedQuestionnaire?.teacherId
      };
      console.log("Questions liées au questionnaire :", selectedQuestionnaire?.questions);

      console .log ("payload envoyer:",payload)
      

      const response = await fetch('http://localhost:3001/api/exams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Échec de la planification de l\'examen');
      }

      const result = await response.json();
      toast({
        title: "Succès",
        description: "Examen planifié avec succès",
      });
      setIsSchedulingExam(false);
      fetchExams();
    } catch (error) {
      console.error('Erreur lors de la planification:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Échec de la planification de l'examen",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet examen ?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/exams/${examId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Échec de la suppression de l'examen");
      }

      setExams(prev => prev.filter(ex => ex.id !== examId));
      toast({ 
        title: "Succès", 
        description: "Examen supprimé avec succès" 
      });
    } catch (error) {
      console.error("Erreur de suppression:", error);
      toast({ 
        title: "Erreur", 
        description: error instanceof Error ? error.message : "Impossible de supprimer l'examen",
        variant: "destructive" 
      });
    }
  };

  const exportResultsToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(results.map(result => ({
        "ID Examen": result.examId,
        "Nom Étudiant": result.studentName,
        "Score": result.score,
        "Total Questions": result.totalQuestions,
        "Date de complétion": new Date(result.completedAt).toLocaleString(),
      })));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Résultats");
      XLSX.writeFile(workbook, "resultats_examens.xlsx");
    } catch (error) {
      console.error("Erreur d'export:", error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les résultats",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: questionnaires.length,
    submitted: questionnaires.filter(q => q.status === "submitted").length,
    approved: questionnaires.filter(q => q.status === "approved").length,
    rejected: questionnaires.filter(q => q.status === "rejected").length,
  };

  const indexOfLastQuestionnaire = currentPage * itemsPerPage;
  const indexOfFirstQuestionnaire = indexOfLastQuestionnaire - itemsPerPage;
  const currentQuestionnaires = questionnaires.slice(
    indexOfFirstQuestionnaire, 
    indexOfLastQuestionnaire
  );

  const renderFacultyMessage = () => {
    switch (faculty) {
      case "informatique":
        return (
          <div>
            <h2 className="text-lg font-semibold">Faculté d'Informatique</h2>
            <p>Gérez les examens, utilisateurs et résultats pour l'informatique.</p>
          </div>
        );
      case "polytechnique":
        return (
          <div>
            <h2 className="text-lg font-semibold">Faculté Polytechnique</h2>
            <p>Administration des modules d'ingénierie, gestion des enseignants et étudiants.</p>
          </div>
        );
      case "etudes-de-la-bible":
        return (
          <div>
            <h2 className="text-lg font-semibold">Faculté d'Études Bibliques</h2>
            <p>Supervisez les examens bibliques et la formation des pasteurs.</p>
          </div>
        );
      case "medecine":
        return (
          <div>
            <h2 className="text-lg font-semibold">Faculté de Médecine</h2>
            <p>Planifiez les examens médicaux et organisez les stages hospitaliers.</p>
          </div>
        );
      case "droit":
        return (
          <div>
            <h2 className="text-lg font-semibold">Faculté de Droit</h2>
            <p>Contrôlez les examens de droit et les affectations des enseignants.</p>
          </div>
        );
      case "sciences-economiques":
        return (
          <div>
            <h2 className="text-lg font-semibold">Faculté des Sciences Économiques</h2>
            <p>Gérez le contenu relatif à la comptabilité, finance et économie.</p>
          </div>
        );
      default:
        return (
          <div className="text-red-600">
            <p>⚠ Faculté inconnue: <strong>{faculty}</strong></p>
          </div>
        );
    }
  };

  return (
    <div className="dashbord-contrainer">
      <div className="p-6">
          <img src="https://i.postimg.cc/mZwbqh7Z/1752262954454.jpg"alt="logo UPL" width="60" height="60" ></img>
        <h2>Bienvenue {user?.name} 👋</h2>

        {renderFacultyMessage()}
        <QuestionnaireList faculty={user.faculty} />
             <Button onClick={onLogout} variant="outline">
          <LogOut className="flex justify-end mb-4" /> Déconnexion
        </Button>
      </div>
      <Tabs defaultValue="submitted">
        <TabsList>
          <TabsTrigger value="submitted">Soumis ({stats.submitted})</TabsTrigger>
          <TabsTrigger value="approved">Approuvés ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejetés ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="scheduled">Planifiés ({exams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="submitted">
          <h2 className="text-xl font-semibold my-4">Questionnaires à valider</h2>
          {isLoading.questionnaires ? (
            <p>Chargement des questionnaires...</p>
          ) : currentQuestionnaires.filter(q => q.status === "submitted").length === 0 ? (
            <p>Aucun questionnaire à valider.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentQuestionnaires
                  .filter(q => q.status === "submitted")
                  .map(q => (
                    <Card key={q.id}>
                      <CardHeader>
                        <CardTitle>{q.title}</CardTitle>
                        <CardDescription>Matière: {q.subject}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {q.questions?.map((question, i) => (
                          <div key={question.id} className="mb-2">
                            <p className="font-semibold">{i + 1}. {question.question}</p>
                            {question.options.map((opt, idx) => (
                              <p 
                                key={idx} 
                                className={question.correctAnswer === idx ? "text-green-600" : "text-gray-600"}
                              >
                                {idx + 1}. {opt}
                              </p>
                            ))}
                          </div>
                        ))}
                      </CardContent>
                      <div className="flex justify-between p-4">
                        <Button onClick={() => handleApprove(q.id)}>✅ Approuver</Button>
                        <Button onClick={() => handleReject(q.id)} variant="destructive">❌ Rejeter</Button>
                      </div>
                    </Card>
                  ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button 
                  onClick={() => setCurrentPage(prev => prev + 1)} 
                  disabled={indexOfLastQuestionnaire >= questionnaires.length}
                >
                  Suivant
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="approved">
          <h2 className="text-xl font-semibold my-4">Questionnaires approuvés</h2>
          {isLoading.questionnaires ? (
            <p>Chargement des questionnaires...</p>
          ) : questionnaires.filter(q => q.status === "approved").length === 0 ? (
            <p>Aucun questionnaire approuvé.</p>
          ) : (
            questionnaires
              .filter(q => q.status === "approved")
              .map(q => (
                <Card key={q.id} className="mb-4">
                  <CardHeader>
                    <CardTitle>{q.title}</CardTitle>
                    <CardDescription>Matière: {q.subject}</CardDescription>
                  </CardHeader>
                  <div className="p-4 flex justify-end gap-2">
                    <Button 
                      onClick={() => openScheduleExamDialog(q)} 
                      variant="outline" 
                      size="sm"
                    >
                      📅 Planifier cet examen
                    </Button>
                  </div>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="rejected">
          <h2 className="text-xl font-semibold my-4">Questionnaires rejetés</h2>
          {isLoading.questionnaires ? (
            <p>Chargement des questionnaires...</p>
          ) : questionnaires.filter(q => q.status === "rejected").length === 0 ? (
            <p>Aucun questionnaire rejeté.</p>
          ) : (
            questionnaires
              .filter(q => q.status === "rejected")
              .map(q => (
                <Card key={q.id} className="mb-4">
                  <CardHeader>
                    <CardTitle>{q.title}</CardTitle>
                    <CardDescription>Matière: {q.subject}</CardDescription>
                  </CardHeader>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="scheduled">
          <h2 className="text-xl font-semibold my-4">Examens planifiés</h2>
          {isLoading.exams ? (
            <p>Chargement des examens...</p>
          ) : exams.length > 0 ? (
            <div className="space-y-4">
              {exams.map(exam => (
                <Card key={exam.id}>
                  <CardHeader>
                    <CardTitle>{exam.title}</CardTitle>
                    <CardDescription>
                      {exam.subject} • Durée: {exam.duration} minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(exam.startTime).toLocaleDateString()} • 
                        {new Date(exam.startTime).toLocaleTimeString()} - 
                        {new Date(exam.endTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        Annuler l'examen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>Aucun examen planifié pour le moment.</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogue de planification d'examen */}
    
        {isSchedulingExam && selectedQuestionnaire && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Planification d'examen</h2>
        <button
          onClick={() => setIsSchedulingExam(false)}
          className="text-white hover:text-gray-200 text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6">
        <p className="text-sm text-gray-500">
          Questionnaire sélectionné : <strong>{selectedQuestionnaire.title}</strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-700">Titre</Label>
            <Input
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              placeholder="Ex: Examen de mi-parcours"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Matière</Label>
            <Input
              value={examForm.subject}
              onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
              placeholder="Ex: Mathématiques"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Durée (en minutes)</Label>
            <Input
              type="number"
              min="1"
              value={examForm.duration}
              onChange={(e) =>
                setExamForm({ ...examForm, duration: parseInt(e.target.value) || 60 })
              }
              placeholder="60"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Début</Label>
            <Input
              type="datetime-local"
              value={examForm.startTime}
              onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Fin</Label>
            <Input
              type="datetime-local"
              value={examForm.endTime}
              onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-6 py-4 flex justify-end gap-4">
        <Button variant="outline" onClick={() => setIsSchedulingExam(false)}>
          Annuler
        </Button>
        <Button onClick={scheduleExam} className="bg-blue-600 hover:bg-blue-700 text-white">
          Planifier
        </Button>
      </div>
    </div>
  </div>
)}


      {/* Section Résultats */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Résultats des Étudiants</h2>
          <Button 
            onClick={exportResultsToExcel} 
            variant="outline" 
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={results.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter vers Excel
          </Button>
        </div>

        {isLoading.results ? (
          <p>Chargement des résultats...</p>
        ) : results.length === 0 ? (
          <p>Aucun résultat reçu pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Étudiant</th>
                  <th className="px-4 py-2 text-left">Examen</th>
                  <th className="px-4 py-2 text-left">Score</th>
                  <th className="px-4 py-2 text-left">Questions</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{result.userName}</td>
                    <td className="px-4 py-2">
                      {exams.find(e => e.id === result.examId)?.title || result.examId}
                    </td>
                    <td className="px-4 py-2">{result.score}%</td>
                    <td className="px-4 py-2">
                      {Math.round((result.score * result.totalQuestions) / 100)}/{result.totalQuestions}
                    </td>
                   <td>
                         {result.submitted_at
                        ? new Date(result.submitted_at).toLocaleString()
                           : "Date non disponible"}
                  </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;