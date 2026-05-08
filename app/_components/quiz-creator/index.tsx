'use client';

import { useState } from "react";
import { Sparkles, MousePointer2, X } from "lucide-react";
import AICreateQuiz from "./ai-flow/AICreateQuiz";
import QuizDetail, { type QuizDetails } from "./manual-flow/QuizDetail";
import QuizQuestion from "./manual-flow/QuizQuestion";

interface QuizCreatorProps {
  onClose: () => void;
  onFinish: (quiz: any) => void;
  initialQuiz?: any;
}

type AIQuestion = {
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  options: { text: string; isCorrect: boolean }[];
};

export default function QuizCreator({ onClose, onFinish, initialQuiz }: QuizCreatorProps) {
  const [mode, setMode] = useState<'SELECT' | 'AI' | 'MANUAL'>(initialQuiz ? 'MANUAL' : 'SELECT');
  const [manualStep, setManualStep] = useState(1);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(
    initialQuiz
      ? {
          title: initialQuiz.title,
          description: initialQuiz.description ?? '',
          category: initialQuiz.category,
          difficulty: initialQuiz.difficulty,
          timeLimit: initialQuiz.timeLimit,
          passingScore: initialQuiz.passingScore,
          visibility: (initialQuiz.visibility ?? "Private") as "Public" | "Private",
        }
      : null
  );

  // AI flow state
  const [aiStep, setAiStep] = useState<'form' | 'review'>('form');
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);

  if (mode === 'SELECT') {
    return (
      <div className="max-w-4xl mx-auto py-20 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Create New Quiz</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition">
            <X />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode('AI')}
            className="group p-8 border-2 border-border rounded-3xl bg-card hover:border-primary transition-all text-left space-y-4"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Sparkles />
            </div>
            <h3 className="text-xl font-bold">AI Generator</h3>
            <p className="text-sm text-muted-foreground">Generate a quiz from documents or text using Gemini AI.</p>
          </button>

          <button
            onClick={() => setMode('MANUAL')}
            className="group p-8 border-2 border-border rounded-3xl bg-card hover:border-primary transition-all text-left space-y-4"
          >
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
              <MousePointer2 />
            </div>
            <h3 className="text-xl font-bold">Manual Creation</h3>
            <p className="text-sm text-muted-foreground">Manually write your own questions and answers.</p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'AI') {
    if (aiStep === 'form') {
      return (
        <AICreateQuiz
          onBack={() => setMode('SELECT')}
          onGenerated={(details, questions) => {
            setQuizDetails(details);
            setAiQuestions(questions);
            setAiStep('review');
          }}
        />
      );
    }

    // aiStep === 'review' — show QuizQuestion editor pre-filled with AI questions
    if (aiStep === 'review' && quizDetails) {
      return (
        <QuizQuestion
          quizDetails={quizDetails}
          initialQuestions={aiQuestions}
          onBack={() => setAiStep('form')}
          onPublish={onFinish}
        />
      );
    }
  }

  return (
    <>
      {manualStep === 1 && (
        <QuizDetail
          initialData={quizDetails ?? undefined}
          isEditing={!!initialQuiz}
          onNext={(data) => {
            setQuizDetails({ ...data, creationMethod: "MANUAL" });
            setManualStep(2);
          }}
          onBack={() => initialQuiz ? onClose() : setMode('SELECT')}
        />
      )}
      {manualStep === 2 && quizDetails && (
        <QuizQuestion
          quizDetails={quizDetails}
          onBack={() => setManualStep(1)}
          onPublish={onFinish}
          initialQuestions={initialQuiz?.questions}
          editingId={initialQuiz?.id}
        />
      )}
    </>
  );
}
