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

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds minimum between requests
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 5000; // 5 seconds

export const decodeHtml = (html: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

// Helper function to wait
const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Fetch with retry and rate limiting
const fetchWithRateLimit = async (retryCount = 0): Promise<Response> => {
  const currentTime = Date.now();
  const timeSinceLastRequest = currentTime - lastRequestTime;

  // Check if we need to wait due to rate limiting
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limit: waiting ${waitTime / 1000} seconds before next request...`);
    await wait(waitTime);
  }

  lastRequestTime = Date.now();

  try {
    const response = await fetch(API_URL);

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(
          `Rate limited (429). Retry ${retryCount + 1}/${MAX_RETRIES} after ${delay / 1000} seconds...`
        );
        await wait(delay);
        return fetchWithRateLimit(retryCount + 1);
      } else {
        throw new Error(
          '429 - Too Many Requests. The server is rate limiting. Please wait a moment and try again.'
        );
      }
    }

    // Handle other HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        if (retryCount < MAX_RETRIES) {
          const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount);
          console.log(
            `Network error. Retry ${retryCount + 1}/${MAX_RETRIES} after ${delay / 1000} seconds...`
          );
          await wait(delay);
          return fetchWithRateLimit(retryCount + 1);
        }
      }
    }
    throw error;
  }
};

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const response = await fetchWithRateLimit();
    const data: APIResponse = await response.json();

    if (data.response_code === 0 && data.results && data.results.length > 0) {
      const questions: Question[] = data.results.map((item: APIQuestion, index: number) => {
        // Decode all text fields from API
        const decodedCorrectAnswer = decodeHtml(item.correct_answer);
        const decodedIncorrectAnswers = item.incorrect_answers.map(decodeHtml);

        // Combine and shuffle answers for boolean type (True/False)
        const allAnswers = [decodedCorrectAnswer, ...decodedIncorrectAnswers];

        // For boolean questions, we want consistent order but not necessarily sorted alphabetically
        // This ensures True/False appear in a natural order
        const sortedAnswers = allAnswers.sort((a, b) => {
          if (a === 'True' && b === 'False') return -1;
          if (a === 'False' && b === 'True') return 1;
          return a.localeCompare(b);
        });

        return {
          id: index + 1,
          type: item.type,
          difficulty: item.difficulty,
          category: decodeHtml(item.category),
          question: decodeHtml(item.question),
          correctAnswer: decodedCorrectAnswer,
          incorrectAnswers: decodedIncorrectAnswers,
          allAnswers: sortedAnswers,
        };
      });

      return questions;
    } else if (data.response_code === 1) {
      throw new Error('No results found. Please try again with different parameters.');
    } else if (data.response_code === 2) {
      throw new Error('Invalid parameter. Please try again.');
    } else if (data.response_code === 3) {
      throw new Error('Token not found. Please try again.');
    } else if (data.response_code === 4) {
      throw new Error('No questions available. Please try again later.');
    } else {
      throw new Error(`API error! response_code: ${data.response_code}`);
    }
  } catch (error) {
    console.error('Error in fetchQuestions:', error);
    throw error;
  }
};

// Optional: Add a function to fetch questions with a delay (useful for development)
export const fetchQuestionsWithDelay = async (delayMs: number = 1000): Promise<Question[]> => {
  await wait(delayMs);
  return fetchQuestions();
};

// Optional: Add a function to get mock questions for testing without API calls
export const getMockQuestions = (): Question[] => {
  return [
    {
      id: 1,
      type: 'boolean',
      difficulty: 'hard',
      category: 'Science & Nature',
      question: 'The human heart has four chambers.',
      correctAnswer: 'True',
      incorrectAnswers: ['False'],
      allAnswers: ['True', 'False'],
    },
    {
      id: 2,
      type: 'boolean',
      difficulty: 'hard',
      category: 'Geography',
      question: 'The Amazon River is the longest river in the world.',
      correctAnswer: 'False',
      incorrectAnswers: ['True'],
      allAnswers: ['True', 'False'],
    },
    {
      id: 3,
      type: 'boolean',
      difficulty: 'hard',
      category: 'History',
      question: 'The Great Wall of China is visible from space with the naked eye.',
      correctAnswer: 'False',
      incorrectAnswers: ['True'],
      allAnswers: ['True', 'False'],
    },
  ];
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
  fetchQuestionsWithDelay,
  getMockQuestions,
  getQuestionById,
  getQuestionCount,
  isAnswerCorrect,
  calculateScore,
  formatCategory,
  decodeHtml,
};
