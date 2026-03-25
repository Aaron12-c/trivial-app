// src/data/Question.ts
export interface Question {
  id: number;
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allAnswers: string[];
}

interface APIResponse {
  response_code: number;
  results: APIQuestion[];
}

interface APIQuestion {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}
const API_URL = 'https://opentdb.com/api.php?amount=10&difficulty=hard&type=boolean';
export const decodeHtml = (html: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};
export const fetchQuestions = async (): Promise<Question[]> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: APIResponse = await response.json();

    if (data.response_code === 0 && data.results) {
      const questions: Question[] = data.results.map((item: APIQuestion, index: number) => ({
        id: index + 1,
        type: item.type,
        difficulty: item.difficulty,
        category: item.category,
        question: decodeHtml(item.question),
        correctAnswer: item.correct_answer,
        incorrectAnswers: item.incorrect_answers,
        allAnswers: [item.correct_answer, ...item.incorrect_answers].sort(), // Sort for consistent display
      }));

      return questions;
    } else {
      throw new Error(`API error! response_code: ${data.response_code}`);
    }
  } catch (error) {
    throw error;
  }
};
export const getQuestionById = (questions: Question[], id: number): Question | undefined => {
  return questions.find((question) => question.id === id);
};
export const getQuestionCount = (questions: Question[]): number => {
  return questions.length;
};
export const isAnswerCorrect = (question: Question, userAnswer: string): boolean => {
  return question.correctAnswer === userAnswer;
};
export const calculateScore = (questions: Question[], userAnswers: (string | null)[]): number => {
  let score = 0;
  questions.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      score++;
    }
  });
  return score;
};
export const formatCategory = (category: string): string => {
  return category
    .replace(/^(Entertainment:|Science:|History:|Mythology:|Celebrities:|General Knowledge:)/, '')
    .trim();
};
export default {
  fetchQuestions,
  getQuestionById,
  getQuestionCount,
  isAnswerCorrect,
  calculateScore,
  formatCategory,
  decodeHtml,
};
