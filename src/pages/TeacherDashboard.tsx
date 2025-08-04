import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import QuestionnaireList from '../components/QuestionnaireList';
import "./TeacherDashboard.css"
// Interfaces
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
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  teacherId: string;
  duration: number;
  faculty: string;
}

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const { setUser } = useUser();

  if (!user || !user.id) {
    return <div>Utilisateur non connecté ou invalide.</div>;
  }

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState<Questionnaire | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (title: string, description: string) => {
    alert(`${title}: ${description}`);
  };

  const createNewQuestionnaire = () => {
    const newQuestionnaire: Questionnaire = {
      id: Date.now().toString(),
      title: '',
      subject: '',
      questions: [],
      status: 'draft',
      teacherId: user.id,
      duration: 60,
      faculty: user.faculty
    };
    setCurrentQuestionnaire(newQuestionnaire);
    setIsCreatingNew(true);
  };

  const addQuestion = () => {
    if (!currentQuestionnaire) return;
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setCurrentQuestionnaire({
      ...currentQuestionnaire,
      questions: [...currentQuestionnaire.questions, newQuestion]
    });
  };

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    if (!currentQuestionnaire) return;
    setCurrentQuestionnaire({
      ...currentQuestionnaire,
      questions: currentQuestionnaire.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    });
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    if (!currentQuestionnaire) return;
    setCurrentQuestionnaire({
      ...currentQuestionnaire,
      questions: currentQuestionnaire.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) }
          : q
      )
    });
  };

  const removeQuestion = (questionId: string) => {
    if (!currentQuestionnaire) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      setCurrentQuestionnaire({
        ...currentQuestionnaire,
        questions: currentQuestionnaire.questions.filter(q => q.id !== questionId)
      });
    }
  };

  const saveQuestionnaire = () => {
    if (!currentQuestionnaire) return;
    if (!currentQuestionnaire.title.trim() || !currentQuestionnaire.subject.trim()) {
      return showToast('Erreur', 'Veuillez remplir le titre et la matière');
    }
    if (currentQuestionnaire.questions.length === 0) {
      return showToast('Erreur', 'Veuillez ajouter au moins une question');
    }
    if (isCreatingNew) {
      setQuestionnaires(prev => [...prev, currentQuestionnaire]);
    } else {
      setQuestionnaires(prev =>
        prev.map(q => (q.id === currentQuestionnaire.id ? currentQuestionnaire : q))
      );
    }
    showToast('Succès', 'Questionnaire sauvegardé');
    setCurrentQuestionnaire(null);
    setIsCreatingNew(false);
  };

  const submitQuestionnaire = async (questionnaire: Questionnaire) => {
    try {
      const payload = {
        title: questionnaire.title,
        subject: questionnaire.subject,
        duration: questionnaire.duration,
        faculty: questionnaire.faculty,
        teacherId: questionnaire.teacherId,
        teacherName: user.name,
        questions: questionnaire.questions.map(q => ({
          question_text: q.question,
          options: q.options,
          correct_answer: q.correctAnswer
        }))
      };
    console.log("Payload envoyé :", payload);
      const response = await
 fetch('http://localhost:3001/api/questionnaires/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return showToast('Erreur', errorText);
      }

      setQuestionnaires(prev =>
        prev.map(q =>
          q.id === questionnaire.id
            ? { ...questionnaire, status: 'submitted', submittedAt: new Date().toISOString() }
            : q
        )
      );

      showToast('Succès', 'Questionnaire soumis avec succès !');
      setCurrentQuestionnaire(null);
    } catch (error) {
      console.error('Erreur dans submitQuestionnaire :', error);
      showToast('Erreur', 'Échec de la soumission du questionnaire.');
    }
  };

  return (
    <div className="dashboard-container">
        <img src="https://i.postimg.cc/mZwbqh7Z/1752262954454.jpg"alt="logo UPL" width="60" height="60" ></img>
      <header className="header">
        <h1>Bienvenue {user.name} 👋</h1>
        <p>Faculté : {user.faculty}</p>
        <button onClick={onLogout}>Déconnexion</button>
      </header>

      <QuestionnaireList faculty={user.faculty} />

      <div className="create-section">
        <button onClick={createNewQuestionnaire}>Créer un nouveau questionnaire</button>
        <input
          type="text"
          placeholder="Rechercher un questionnaire..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <h2>Mes Questionnaires</h2>
      {questionnaires
        .filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(q => (
          <div key={q.id} className="questionnaire-item">
            <h3>{q.title}</h3>
            <p>Matière : {q.subject}</p>
            <p>Durée : {q.duration} minutes</p>
            <p>{q.questions.length} questions</p>
            <p>Statut : {q.status}</p>
            {q.status === 'draft' && (
              <>
                <button onClick={() => setCurrentQuestionnaire(q)}>Modifier</button>
                <button onClick={() => submitQuestionnaire(q)}>Soumettre</button>
              </>
            )}
          </div>
        ))}

      {currentQuestionnaire && (
        <div className="questionnaire-editor">
          <h2>{isCreatingNew ? 'Nouveau Questionnaire' : 'Modifier le Questionnaire'}</h2>
          <input
            type="text"
            value={currentQuestionnaire.title}
            placeholder="Titre"
            onChange={e => setCurrentQuestionnaire({ ...currentQuestionnaire, title: e.target.value })}
          />
          <input
            type="text"
            value={currentQuestionnaire.subject}
            placeholder="Matière"
            onChange={e => setCurrentQuestionnaire({ ...currentQuestionnaire, subject: e.target.value })}
          />
          <input
            type="number"
            value={currentQuestionnaire.duration}
            placeholder="Durée (minutes)"
            onChange={e => setCurrentQuestionnaire({
              ...currentQuestionnaire,
              duration: Number(e.target.value)
            })}
          />
          <button onClick={addQuestion}>Ajouter une question</button>

          {currentQuestionnaire.questions.map((question, index) => (
            <div key={question.id}>
              <textarea
                value={question.question}
                onChange={e => updateQuestion(question.id, 'question', e.target.value)}
                placeholder={`Question ${index + 1}`}
              />
              {question.options.map((opt, optIndex) => (
                <div key={optIndex}>
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === optIndex}
                    onChange={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                  />
                  <input
                    type="text"
                    value={opt}
                    placeholder={`Option ${optIndex + 1}`}
                    onChange={e => updateQuestionOption(question.id, optIndex, e.target.value)}
                  />
                </div>
              ))}
              <button onClick={() => removeQuestion(question.id)}>Supprimer Question</button>
            </div>
          ))}

          <button onClick={saveQuestionnaire}>Sauvegarder</button>
          <button onClick={() => { setCurrentQuestionnaire(null); setIsCreatingNew(false); }}>Annuler</button>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
