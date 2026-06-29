export interface Flashcard {
  term: string;
  definition: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface VideoResource {
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  searchQuery: string;
  channelRecommendation: string;
  whyWatch: string;
  duration: string;
  keyConcepts: string[];
  prerequisites: string;
  expectedLearningOutcome?: string;
}

export interface CramData {
  summary: string[];
  formulas?: string[];
  mnemonics?: string[];
  commonMistakes?: string[];
  expectedQuestions?: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  videoResources?: VideoResource[];
}
