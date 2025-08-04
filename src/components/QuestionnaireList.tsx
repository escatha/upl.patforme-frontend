import { useEffect, useState } from "react";

type Questionnaire = {
  id: number;
  title: string;
  subject: string;
  duration: number;
};

type Props = {
  faculty: string;
};

function QuestionnaireList({ faculty }: Props) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

  useEffect(() => {
    fetch(`/api/questionnaires/by-faculty/${faculty}`)
      .then((res) => res.json())
      .then((data) => setQuestionnaires(data));
  }, [faculty]);

  return (
    <div>
      <h2>Questionnaires - Faculté : {faculty}</h2>
      <ul>
        {questionnaires.map((q) => (
          <li key={q.id}>
            <strong>{q.title}</strong> - {q.subject} ({q.duration} min)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionnaireList;