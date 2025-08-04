import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

const PlanifierExamen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const questionnaire = location.state?.questionnaire;

  const [examForm, setExamForm] = useState({
    title: "",
    subject: "",
    duration: 60,
    startTime: "",
    endTime: "",
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/exams/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...examForm,
          questionnaireId: questionnaire.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la planification");
      }

      // ✅ Revenir à AdminDashboard après la planification
      navigate("/admin");
    } catch (error) {
      console.error("❌ Planification échouée :", error);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-xl font-bold">Planifier un examen</h2>
      <p className="text-sm text-gray-500">Questionnaire : {questionnaire?.title}</p>

      <div className="space-y-2">
        <div>
          <Label>Titre</Label>
          <Input
            value={examForm.title}
            onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Matière</Label>
          <Input
            value={examForm.subject}
            onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
          />
        </div>
        <div>
          <Label>Durée (minutes)</Label>
          <Input
            type="number"
            value={examForm.duration}
            onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Heure de début</Label>
          <Input
            type="datetime-local"
            value={examForm.startTime}
            onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
          />
        </div>
        <div>
          <Label>Heure de fin</Label>
          <Input
            type="datetime-local"
            value={examForm.endTime}
            onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => navigate("/admin")}>
          Annuler
        </Button>
        <Button onClick={handleSubmit}>Planifier</Button>
      </div>
    </div>
  );
};

export default PlanifierExamen;
