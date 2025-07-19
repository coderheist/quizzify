// AI Service for Quiz Generation
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (you'll need to add your API key)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'demo-key');

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit: number;
  difficulty?: string;
  topic?: string;
}

// Generate quiz from keyword using Gemini AI
export const generateQuizFromKeyword = async (
  keyword: string,
  questionCount: number,
  difficulty: string
): Promise<GeneratedQuiz> => {
  try {
    // For demo purposes, we'll use mock data
    // In production, you would use the actual Gemini API
    const mockQuiz = await generateMockQuizFromKeyword(keyword, questionCount, difficulty);
    return mockQuiz;
    
    // Uncomment below for actual Gemini API usage:
    /*
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate a ${difficulty} level quiz about "${keyword}" with ${questionCount} multiple choice questions. 
    Each question should have 4 options with only one correct answer.
    
    Format the response as JSON with this structure:
    {
      "title": "Quiz title",
      "description": "Brief description",
      "questions": [
        {
          "question": "Question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0,
          "explanation": "Brief explanation of the correct answer"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const quizData = JSON.parse(text);
    
    return {
      id: 'generated-' + Date.now(),
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions.map((q: any, index: number) => ({
        id: `q${index + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      })),
      timeLimit: questionCount * 60, // 1 minute per question
      difficulty,
      topic: keyword
    };
    */
  } catch (error) {
    console.error('Error generating quiz from keyword:', error);
    throw new Error('Failed to generate quiz from keyword');
  }
};

// Generate quiz from paragraph using T5 model (mock implementation)
export const generateQuizFromParagraph = async (
  paragraph: string,
  questionCount: number
): Promise<GeneratedQuiz> => {
  try {
    // For demo purposes, we'll use mock data
    // In production, you would call your Python backend with T5 model
    const mockQuiz = await generateMockQuizFromParagraph(paragraph, questionCount);
    return mockQuiz;
    
    // Uncomment below for actual backend API call:
    /*
    const response = await fetch('/api/generate-quiz-from-paragraph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paragraph,
        questionCount
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate quiz from paragraph');
    }
    
    const quizData = await response.json();
    return quizData;
    */
  } catch (error) {
    console.error('Error generating quiz from paragraph:', error);
    throw new Error('Failed to generate quiz from paragraph');
  }
};

// Mock quiz generation functions for demo
const generateMockQuizFromKeyword = async (
  keyword: string,
  questionCount: number,
  difficulty: string
): Promise<GeneratedQuiz> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const questions: QuizQuestion[] = [];
  
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      id: `q${i + 1}`,
      question: `What is an important concept related to ${keyword}? (Question ${i + 1})`,
      options: [
        `Correct answer about ${keyword}`,
        `Incorrect option 1`,
        `Incorrect option 2`,
        `Incorrect option 3`
      ],
      correctAnswer: 0,
      explanation: `This is the correct answer because it directly relates to the core concepts of ${keyword}.`
    });
  }
  
  return {
    id: 'generated-' + Date.now(),
    title: `${keyword} Quiz`,
    description: `A comprehensive ${difficulty} level quiz about ${keyword}`,
    questions,
    timeLimit: questionCount * 60,
    difficulty,
    topic: keyword
  };
};

const generateMockQuizFromParagraph = async (
  paragraph: string,
  questionCount: number
): Promise<GeneratedQuiz> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const questions: QuizQuestion[] = [];
  const words = paragraph.split(' ');
  const topic = words.slice(0, 3).join(' ');
  
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      id: `q${i + 1}`,
      question: `Based on the provided text, what can be inferred about the main topic? (Question ${i + 1})`,
      options: [
        `Correct inference from the text`,
        `Incorrect interpretation`,
        `Unrelated option`,
        `Another incorrect option`
      ],
      correctAnswer: 0,
      explanation: `This answer is correct based on the information provided in the original text.`
    });
  }
  
  return {
    id: 'generated-' + Date.now(),
    title: `Text Comprehension Quiz`,
    description: `Quiz generated from the provided paragraph about ${topic}`,
    questions,
    timeLimit: questionCount * 60,
    topic: 'Text Analysis'
  };
};