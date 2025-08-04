import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { LogOut, Clock, CheckCircle, BookOpen } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useExam } from '../contexts/ExamContext';
import "./StudentDashboard.css"
interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  startTime: string;
  endTime: string;
  questions: Question[];
  status: 'upcoming' | 'active' | 'completed';
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  faculty: string;
}

interface ExamResult {
  examId: string;
  score: number;
  totalQuestions: number;
  completedAt?: string;
    submittedAt: string;
    
}

interface StudentDashboardProps {
  user: User | null;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const { faculty } = useParams();
  const { toast } = useToast();

  // Utilisation du contexte Exam
  const {
    exams,
    setExams,
    activeExam,
    setActiveExam,
    examStarted,
    setExamStarted
  } = useExam();

  const [results, setResults] = useState<ExamResult[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (!user || !user.faculty) {
  setError("Utilisateur ou faculté non renseigné.");
  return;
}
  
  const fetchData = async () => {
      console.log("📩 Requête reçue pour faculty :", user.faculty );
      try {
        setLoading(true);
        setError(null);

        const examsResponse = await fetch(`http://localhost:3001/api/exams?faculty=${user.faculty}`, {
          

          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!examsResponse.ok) throw new Error('Failed to fetch exams');
        const examsData = await examsResponse.json();
        console.log ("donner recue du backend")
        console.error("Erreur lors du chargement des examens:", error);

        const resultsResponse = await fetch('http://localhost:3001/api/results', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!resultsResponse.ok) throw new Error('Failed to fetch results');
        const resultsData = await resultsResponse.json();

        const now = new Date();
        const filteredExams = examsData
          .filter((exam: any) => exam.faculty === user.faculty)
          .map((exam: any) => {
            const start = new Date(exam.startTime);
            const end = new Date(exam.endTime);
            let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
            if (now > end) status = 'completed';
            else if (now >= start) status = 'active';
            return { ...exam, status };
          });

        setExams(filteredExams);
        setResults(resultsData);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        toast({
          title: "Erreur",
          description: "Impossible de charger les examens",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, user?.faculty]);

  useEffect(() => {
    if (!activeExam || !examStarted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeExam, examStarted, timeLeft]);

  const startExam = (exam: typeof activeExam) => {
    console.log (" startExam appeler avec :",exam)
    if (!exam) return;

    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      console.log ("examen pas encors commencer ");
      toast({
        title: "Examen non disponible",
        description: `L'examen commence le ${startTime.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (now > endTime) {
      console. log("examen deja terminer");
      toast({
        title: "Examen terminé",
        description: "Le temps imparti est écoulé",
        variant: "destructive",
      });
      return;
    }

    if (!exam.questions || !Array.isArray(exam.questions) || exam.questions.length === 0) {
      console.log("pas des question ")
      toast({
        title: "Examen invalide",
        description: "Aucune question trouvée pour cet examen.",
        variant: "destructive",
      });
      return;
    }

    setActiveExam(exam);
    setTimeLeft(Math.floor((endTime.getTime() - now.getTime()) / 1000));
    setCurrentQuestion(0);
    setAnswers({});
    setExamStarted(true);
    setTimeout(()  => {
      console.log ("verifiecation apres 500ms");
      console.log("activeExam=",exam);
      console.log("examStarted =",true);
    },500)
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    if (!examStarted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (!activeExam) return;
    if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (direction === 'next' && currentQuestion < activeExam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!activeExam || !Array.isArray(activeExam.questions)) return;

    const score = activeExam.questions.reduce((acc, question) => {
      return acc + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / activeExam.questions.length) * 100);
    const newResult = {
    examId: activeExam.id,
    score: percentage,
    studentName: user?.name || "",
    totalQuestions: activeExam.questions.length,
    submittedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    studentId: user?.id,
    answers: answers,
    faculty: user?.faculty,
  };
    console.log("🔍 Données envoyées au backend :", newResult);
    
    

    try {
      const response = await fetch('http://localhost:3001/api/exams/submit-exam', {
        
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
       body: JSON.stringify(newResult)
      });
      if (!response.ok) {
  const errorData = await response.json();
  console.error('Erreur backend:', errorData);
  throw new Error(errorData.message || 'Failed to submit exam');
}


      setResults(prev => [...prev, newResult]);
      toast({
        title: "Examen terminé",
        description: `Votre score: ${percentage}%`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Échec de l'enregistrement des résultats",
        variant: "destructive",
      });
    } finally {
      setActiveExam(null);
      setExamStarted(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      
      {examStarted && activeExam ? (
        <div className="exam-container">
          <header className="exam-header">
            <div>
              <h1>{activeExam.title}</h1>
              <p>Question {currentQuestion + 1}/{activeExam.questions.length}</p>
            </div>
            <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
              <Clock size={18} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </header>

          <Progress value={((currentQuestion + 1) / activeExam.questions.length) * 100} className="progress-bar" />

          <div className="question-card">
            <h2>{activeExam.questions[currentQuestion].question}</h2>
            <div className="options-grid">
              {activeExam.questions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`option ${answers[activeExam.questions[currentQuestion].id] === index ? 'selected' : ''}`}
                  onClick={() => selectAnswer(activeExam.questions[currentQuestion].id, index)}
                >
                  <div className="option-indicator">
                    {answers[activeExam.questions[currentQuestion].id] === index && <div className="indicator-dot" />}
                  </div>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="navigation-buttons">
            <Button
              onClick={() => navigateQuestion('prev')}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              Précédent
            </Button>
            {currentQuestion === activeExam.questions.length - 1 ? (
              <Button onClick={handleSubmitExam} className="submit-btn">
                Terminer
              </Button>
            ) : (
              <Button onClick={() => navigateQuestion('next')}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <header className="dashboard-header">
            <div>
                <img src="https://i.postimg.cc/mZwbqh7Z/1752262954454.jpg"alt="logo UPL" width="60" height="60" ></img>
              <h1>Tableau de Bord Étudiant</h1>
              <h2>Bienvenue {user ? user.name : "Étudiant"}</h2>
              <p>Faculté : {user?.faculty}</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut size={16} className="mr-2" />
              Déconnexion
            </Button>
          </header>

          <section className="exams-section">
            <h2>Examens Disponibles</h2>
            {loading ? (
              <p>Chargement des examens...</p>
            ) : exams.length === 0 ? (
              <p>Aucun examen disponible</p>
            ) : (
              <div className="exams-grid">
                {exams.map((exam) => (
                  <Card key={exam.id} className="exam-card">
                    <CardHeader>
                      <CardTitle>
                        <BookOpen size={16} className="mr-2" />
                        {exam.title}
                      </CardTitle>
                      <CardDescription>{exam.subject}</CardDescription>
                      <Badge className={`status-${exam.status}`}>
                        {exam.status === 'active' ? 'Actif' :
                         exam.status === 'upcoming' ? 'À venir' : 'Terminé'}
                      </Badge>
                    </CardHeader>
                    
                      <CardContent>
                      <p><strong>Durée:</strong> {exam.duration} min</p>
                      <p><strong>Début:</strong> {new Date(exam.startTime).toLocaleString()}</p>
                      <p><strong>Fin:</strong> {new Date(exam.endTime).toLocaleString()}</p>
                      {exam.status === 'active' && (
                        <Button onClick={() => startExam(exam)} className="start-exam-btn">
                          Commencer
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="results-section">
            <h2>Mes Résultats</h2>
            {loading ? (
              <p>Chargement des résultats...</p>
            ) : results.length === 0 ? (
              <p>Aucun résultat disponible</p>
            ) : (
              <div className="results-list">
                {results.map((result, index) => {
                  const exam = exams.find(e => e.id === result.examId);
                  return (
                    <Card key={index} className="result-card">
                      <CardContent>
                        <div className="result-header">
                          <h3>{exam?.title || `Examen #${result.examId}`}</h3>
                          <div className={`score ${result.score >= 60 ? 'pass' : 'fail'}`}>
                            {result.score}%
                          </div>
                        </div>
                        <div className="result-details">
                          <p>{Math.round((result.score * result.totalQuestions) / 100)}/{result.totalQuestions} bonnes réponses</p>
                         <p className="date">
         {result.submittedAt
        ? new Date(result.submittedAt).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    : "Date non disponible"}
</p>

                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;

