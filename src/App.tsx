import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  FileText, 
  BrainCircuit, 
  Layers, 
  ChevronRight, 
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import Markdown from 'react-markdown';
import { explainTopic, summarizeNotes, generateQuiz, generateFlashcards } from './services/geminiService';
import { cn } from './lib/utils';

type Mode = 'explain' | 'summarize' | 'quiz' | 'flashcards';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Flashcard {
  front: string;
  back: string;
}

export default function App() {
  const [mode, setMode] = useState<Mode>('explain');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [quizState, setQuizState] = useState<{
    currentIndex: number;
    score: number;
    showResult: boolean;
    selectedAnswer: number | null;
  }>({
    currentIndex: 0,
    score: 0,
    showResult: false,
    selectedAnswer: null
  });

  const handleAction = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      let data;
      switch (mode) {
        case 'explain':
          data = await explainTopic(input);
          break;
        case 'summarize':
          data = await summarizeNotes(input);
          break;
        case 'quiz':
          data = await generateQuiz(input);
          setQuizState({ currentIndex: 0, score: 0, showResult: false, selectedAnswer: null });
          break;
        case 'flashcards':
          data = await generateFlashcards(input);
          break;
      }
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (quizState.selectedAnswer !== null) return;
    
    const isCorrect = index === result[quizState.currentIndex].correctAnswer;
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: index,
      score: isCorrect ? prev.score + 1 : prev.score
    }));

    setTimeout(() => {
      if (quizState.currentIndex < result.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          selectedAnswer: null
        }));
      } else {
        setQuizState(prev => ({ ...prev, showResult: true }));
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-brand-100 border-b md:border-b-0 md:border-r border-brand-200 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white shadow-sm">
            <Sparkles size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Buddy AI</h1>
        </div>

        <nav className="flex flex-col gap-1">
          <NavButton 
            active={mode === 'explain'} 
            onClick={() => { setMode('explain'); setResult(null); }}
            icon={<BookOpen size={18} />}
            label="Explain Topic"
          />
          <NavButton 
            active={mode === 'summarize'} 
            onClick={() => { setMode('summarize'); setResult(null); }}
            icon={<FileText size={18} />}
            label="Summarize Notes"
          />
          <NavButton 
            active={mode === 'quiz'} 
            onClick={() => { setMode('quiz'); setResult(null); }}
            icon={<BrainCircuit size={18} />}
            label="Practice Quiz"
          />
          <NavButton 
            active={mode === 'flashcards'} 
            onClick={() => { setMode('flashcards'); setResult(null); }}
            icon={<Layers size={18} />}
            label="Flashcards"
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-brand-200">
          <div className="p-4 bg-brand-200 rounded-lg">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">Study Tip</p>
            <p className="text-sm text-black italic">"The best way to learn is to teach someone else."</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full">
        <header className="mb-12">
          <motion.h2 
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            {mode === 'explain' && "What concept can I simplify for you?"}
            {mode === 'summarize' && "Paste your notes for a summary"}
            {mode === 'quiz' && "Ready to test your knowledge?"}
            {mode === 'flashcards' && "Create flashcards from your material"}
          </motion.h2>
          <p className="text-brand-600 max-w-2xl">
            Lumina uses advanced AI to help you master any subject. Just provide the topic or content, and I'll handle the rest.
          </p>
        </header>

        <section className="space-y-8">
          <div className="glass-card p-6 md:p-8">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'explain' ? "e.g., Quantum Entanglement, Photosynthesis, The French Revolution..." :
                "Paste your study notes or text here..."
              }
              className="w-full h-40 bg-transparent border-none focus:ring-0 text-lg resize-none placeholder:text-brand-300"
            />
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleAction}
                disabled={loading || !input.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {mode === 'explain' ? "Explain" : mode === 'summarize' ? "Summarize" : "Generate"}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">Result</h3>
                  <button 
                    onClick={() => { setResult(null); setInput(''); }}
                    className="text-brand-500 hover:text-black flex items-center gap-1 text-sm font-medium"
                  >
                    <RotateCcw size={14} /> Clear
                  </button>
                </div>

                {mode === 'explain' || mode === 'summarize' ? (
                  <div className="glass-card p-8 prose prose-brand max-w-none">
                    <Markdown>{result}</Markdown>
                  </div>
                ) : mode === 'quiz' ? (
                  <QuizView 
                    questions={result} 
                    state={quizState} 
                    onAnswer={handleQuizAnswer} 
                    onReset={() => handleAction()}
                  />
                ) : (
                  <FlashcardView cards={result} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
        active 
          ? "bg-black text-white shadow-sm" 
          : "text-brand-600 hover:bg-brand-200 hover:text-black"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-brand-400")}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
  );
}

function QuizView({ questions, state, onAnswer, onReset }: { 
  questions: QuizQuestion[], 
  state: any, 
  onAnswer: (i: number) => void,
  onReset: () => void
}) {
  if (state.showResult) {
    return (
      <div className="glass-card p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto text-brand-800">
          <CheckCircle2 size={40} />
        </div>
        <div>
          <h4 className="text-3xl font-bold tracking-tight mb-2">Quiz Complete!</h4>
          <p className="text-brand-600">You scored {state.score} out of {questions.length}</p>
        </div>
        <div className="pt-4">
          <button onClick={onReset} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  const current = questions[state.currentIndex];

  return (
    <div className="glass-card p-8 space-y-8">
      <div className="flex justify-between items-center text-sm font-medium text-brand-400">
        <span>Question {state.currentIndex + 1} of {questions.length}</span>
        <span>Score: {state.score}</span>
      </div>
      
      <h4 className="text-2xl font-bold tracking-tight leading-tight">{current.question}</h4>
      
      <div className="grid gap-2">
        {current.options.map((option: string, i: number) => {
          const isSelected = state.selectedAnswer === i;
          const isCorrect = i === current.correctAnswer;
          const showFeedback = state.selectedAnswer !== null;

          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={showFeedback}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between",
                !showFeedback && "border-brand-100 hover:border-brand-300 hover:bg-brand-50",
                showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900",
                showFeedback && isSelected && !isCorrect && "border-rose-500 bg-rose-50 text-rose-900",
                showFeedback && !isSelected && !isCorrect && "border-brand-100 opacity-50"
              )}
            >
              <span className="font-medium">{option}</span>
              {showFeedback && isCorrect && <CheckCircle2 size={20} className="text-emerald-500" />}
              {showFeedback && isSelected && !isCorrect && <XCircle size={20} className="text-rose-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlashcardView({ cards }: { cards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const next = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-8">
        <button onClick={prev} className="p-3 rounded-full bg-white border border-brand-200 hover:bg-brand-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        
        <div 
          className="relative w-full max-w-md h-80 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            className="w-full h-full relative preserve-3d"
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden glass-card p-12 flex items-center justify-center text-center">
              <p className="text-2xl font-bold tracking-tight">{cards[currentIndex].front}</p>
              <p className="absolute bottom-6 text-xs font-bold text-brand-300 uppercase tracking-widest">Click to flip</p>
            </div>
            
            {/* Back */}
            <div 
              className="absolute inset-0 backface-hidden glass-card p-12 flex items-center justify-center text-center bg-black text-white border-none"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <p className="text-xl leading-relaxed">{cards[currentIndex].back}</p>
            </div>
          </motion.div>
        </div>

        <button onClick={next} className="p-3 rounded-full bg-white border border-brand-200 hover:bg-brand-100 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-center text-sm font-medium text-brand-400">
        Card {currentIndex + 1} of {cards.length}
      </div>
    </div>
  );
}
