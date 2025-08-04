import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Types
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
  startTime: string;
  endTime: string;
  status?: 'upcoming' | 'active' | 'completed';
}

interface User {
  id: string;
  name: string;
  role: string;
  faculty: string;
}

interface ExamPageProps {
  user: User;
  onLogout: () => void;
}

const ExamPage: React.FC<ExamPageProps> = ({ user, onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/exams/${id}`);
        const data: Exam = await res.json();

        const now = new Date();
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);

        if (now >= start && now <= end) {
          data.status = "active";
        } else if (now < start) {
          data.status = "upcoming";
        } else {
          data.status = "completed";
        }

        setExam(data);
      } catch (error) {
        console.error("Erreur de chargement de l'examen :", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExam();
    }
  }, [id]);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    let correct = 0;

    exam.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const totalQuestions = exam.questions.length;
    const score = Math.round((correct / totalQuestions) * 100);

    const payload = {
      examId: exam.id,
      studentId: user.id,
      studentName: user.name,
      score: score,
      totalQuestions: totalQuestions,
      correctAnswers: correct,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:3001/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Examen soumis avec succès ! Vous avez obtenu ${score}%`);
        navigate("/student");
      } else {
        alert("Erreur lors de la soumission des résultats.");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur réseau !");
    }
  };

  if (loading) {
    return <div>Chargement de l'examen...</div>;
  }

  if (!exam) {
    return <div>Examen introuvable ou indisponible.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <button
          onClick={onLogout}
          className="text-red-600 underline text-sm"
        >
          Déconnexion ({user.name})
        </button>
      </div>

      <p>Matière : {exam.subject}</p>
      <p>Durée : {exam.duration} minutes</p>
      <hr className="my-4" />

      <div>
        {exam.questions.map((q, i) => (
          <div key={q.id} className="mb-6">
            <p className="font-semibold">
              {i + 1}. {q.question}
            </p>
            {q.options.map((opt, idx) => (
              <div key={idx} className="ml-4">
                <label>
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === idx}
                    onChange={() => handleAnswerChange(q.id, idx)}
                  />{" "}
                  {opt}
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Soumettre l'examen
      </button>
    </div>
  );
};

export default ExamPage;
