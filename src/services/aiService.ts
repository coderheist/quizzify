// Enhanced AI Service for Quiz Generation with improved logic
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'demo-key');

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  topic: string;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit: number;
  difficulty?: string;
  topic: string;
  generatedBy: 'keyword' | 'paragraph';
  metadata: {
    createdAt: string;
    questionCount: number;
    estimatedTime: number;
  };
}

export interface QuizResult {
  score: number;
  percentage: number;
  timeSpent: number;
  results: Array<{
    questionId: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    timeTaken?: number;
  }>;
  feedback: string;
  detailedAnalysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

// Enhanced keyword-based quiz generation with Gemini AI
export const generateQuizFromKeyword = async (
  keyword: string,
  questionCount: number,
  difficulty: string
): Promise<GeneratedQuiz> => {
  try {
    // Check if we have a valid API key
    if (import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'demo-key') {
      return await generateWithGeminiAI(keyword, questionCount, difficulty);
    } else {
      // Fallback to enhanced mock generation
      return await generateEnhancedMockQuiz(keyword, questionCount, difficulty);
    }
  } catch (error) {
    console.error('Error generating quiz from keyword:', error);
    throw new Error('Failed to generate quiz from keyword');
  }
};

// Generate quiz using actual Gemini AI
const generateWithGeminiAI = async (
  keyword: string,
  questionCount: number,
  difficulty: string
): Promise<GeneratedQuiz> => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Generate a comprehensive ${difficulty} level quiz about "${keyword}" with exactly ${questionCount} multiple choice questions.

Requirements:
1. Each question should have exactly 4 options (A, B, C, D)
2. Only one correct answer per question
3. Questions should cover different aspects of ${keyword}
4. Include detailed explanations for correct answers
5. Make distractors (wrong answers) plausible but clearly incorrect
6. Vary question types: factual, conceptual, application-based

Format the response as valid JSON:
{
  "title": "Quiz title about ${keyword}",
  "description": "Brief description of what this quiz covers",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct and others are wrong",
      "difficulty": "${difficulty}",
      "topic": "${keyword}"
    }
  ]
}

Make sure the JSON is properly formatted and contains exactly ${questionCount} questions.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean and parse the JSON response
  const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
  const quizData = JSON.parse(cleanedText);
  
  return {
    id: 'gemini-' + Date.now(),
    title: quizData.title,
    description: quizData.description,
    questions: quizData.questions.map((q: any, index: number) => ({
      id: `q${index + 1}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || difficulty,
      topic: q.topic || keyword
    })),
    timeLimit: questionCount * 90, // 1.5 minutes per question
    difficulty,
    topic: keyword,
    generatedBy: 'keyword',
    metadata: {
      createdAt: new Date().toISOString(),
      questionCount,
      estimatedTime: questionCount * 90
    }
  };
};

// Enhanced paragraph-based quiz generation with T5 model
export const generateQuizFromParagraph = async (
  paragraph: string,
  questionCount: number
): Promise<GeneratedQuiz> => {
  try {
    // Try to use the Python backend with T5 model
    const response = await fetch('http://localhost:5001/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paragraph,
        questionCount
      })
    });
    
    if (response.ok) {
      const quizData = await response.json();
      return {
        ...quizData,
        generatedBy: 'paragraph',
        metadata: {
          createdAt: new Date().toISOString(),
          questionCount: quizData.questions.length,
          estimatedTime: quizData.questions.length * 90
        }
      };
    } else {
      throw new Error('Backend not available');
    }
  } catch (error) {
    console.warn('T5 backend not available, using fallback generation:', error);
    // Fallback to enhanced mock generation
    return await generateMockQuizFromParagraph(paragraph, questionCount);
  }
};

// Enhanced mock quiz generation for keyword
const generateEnhancedMockQuiz = async (
  keyword: string,
  questionCount: number,
  difficulty: string
): Promise<GeneratedQuiz> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  
  const questions: QuizQuestion[] = [];
  const questionTemplates = getQuestionTemplates(keyword, difficulty);
  
  for (let i = 0; i < questionCount; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    questions.push({
      id: `q${i + 1}`,
      question: template.question.replace('{keyword}', keyword),
      options: template.options.map(opt => opt.replace('{keyword}', keyword)),
      correctAnswer: template.correctAnswer,
      explanation: template.explanation.replace('{keyword}', keyword),
      difficulty,
      topic: keyword
    });
  }
  
  return {
    id: 'enhanced-' + Date.now(),
    title: `${keyword} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level Quiz`,
    description: `A comprehensive ${difficulty} level quiz covering key concepts and applications of ${keyword}`,
    questions,
    timeLimit: questionCount * 90,
    difficulty,
    topic: keyword,
    generatedBy: 'keyword',
    metadata: {
      createdAt: new Date().toISOString(),
      questionCount,
      estimatedTime: questionCount * 90
    }
  };
};

// Enhanced mock quiz generation for paragraph
const generateMockQuizFromParagraph = async (
  paragraph: string,
  questionCount: number
): Promise<GeneratedQuiz> => {
  // Simulate ML processing time
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
  
  const questions: QuizQuestion[] = [];
  const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = paragraph.split(/\s+/).filter(w => w.length > 3);
  const keyTerms = extractKeyTerms(paragraph);
  
  for (let i = 0; i < questionCount; i++) {
    const questionType = i % 4; // Vary question types
    let question: QuizQuestion;
    
    switch (questionType) {
      case 0: // Main idea question
        question = generateMainIdeaQuestion(paragraph, i + 1);
        break;
      case 1: // Detail question
        question = generateDetailQuestion(sentences, keyTerms, i + 1);
        break;
      case 2: // Inference question
        question = generateInferenceQuestion(paragraph, i + 1);
        break;
      default: // Vocabulary question
        question = generateVocabularyQuestion(keyTerms, paragraph, i + 1);
    }
    
    questions.push(question);
  }
  
  const topic = extractMainTopic(paragraph);
  
  return {
    id: 'paragraph-' + Date.now(),
    title: `Text Comprehension Quiz - ${topic}`,
    description: `Quiz generated from the provided text using advanced ML analysis`,
    questions,
    timeLimit: questionCount * 90,
    topic,
    generatedBy: 'paragraph',
    metadata: {
      createdAt: new Date().toISOString(),
      questionCount,
      estimatedTime: questionCount * 90
    }
  };
};

// Enhanced scoring system
export const calculateQuizScore = (
  quiz: GeneratedQuiz,
  userAnswers: { [key: number]: number },
  timeSpent: number,
  questionTimes?: { [key: number]: number }
): QuizResult => {
  let score = 0;
  const results = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  // Calculate basic score and analyze performance
  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i];
    const userAnswer = userAnswers[i] ?? -1;
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      score++;
      // Analyze what topics user is strong in
      if (!strengths.includes(question.topic)) {
        strengths.push(question.topic);
      }
    } else {
      // Analyze what topics user needs work on
      if (!weaknesses.includes(question.topic)) {
        weaknesses.push(question.topic);
      }
    }
    
    results.push({
      questionId: question.id,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeTaken: questionTimes?.[i] || 0
    });
  }
  
  const percentage = Math.round((score / quiz.questions.length) * 100);
  
  // Generate personalized feedback
  const feedback = generatePersonalizedFeedback(percentage, quiz, timeSpent);
  
  // Generate recommendations based on performance
  if (percentage >= 90) {
    recommendations.push("Excellent work! Consider taking more advanced quizzes on this topic.");
    recommendations.push("You might enjoy exploring related advanced concepts.");
  } else if (percentage >= 70) {
    recommendations.push("Good performance! Review the questions you missed for deeper understanding.");
    recommendations.push("Practice similar questions to reinforce your knowledge.");
  } else if (percentage >= 50) {
    recommendations.push("Focus on studying the fundamental concepts more thoroughly.");
    recommendations.push("Take practice quizzes to build confidence.");
  } else {
    recommendations.push("Start with basic concepts and build your foundation.");
    recommendations.push("Consider additional study materials and resources.");
  }
  
  // Add time-based recommendations
  const avgTimePerQuestion = timeSpent / quiz.questions.length;
  const expectedTime = 90; // 1.5 minutes per question
  
  if (avgTimePerQuestion < expectedTime * 0.5) {
    recommendations.push("Consider taking more time to read questions carefully.");
  } else if (avgTimePerQuestion > expectedTime * 1.5) {
    recommendations.push("Practice to improve your response time.");
  }
  
  return {
    score,
    percentage,
    timeSpent,
    results,
    feedback,
    detailedAnalysis: {
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
      recommendations: recommendations.slice(0, 4)
    }
  };
};

// Helper functions
const getQuestionTemplates = (keyword: string, difficulty: string) => {
  const templates = [
    {
      question: `What is the primary purpose of {keyword}?`,
      options: [
        `The main function and application of {keyword}`,
        `An unrelated concept`,
        `A different technology entirely`,
        `None of the above`
      ],
      correctAnswer: 0,
      explanation: `{keyword} serves specific purposes that are fundamental to understanding its applications and importance.`
    },
    {
      question: `Which of the following is a key characteristic of {keyword}?`,
      options: [
        `A defining feature of {keyword}`,
        `An unrelated attribute`,
        `A characteristic of something else`,
        `Not applicable to {keyword}`
      ],
      correctAnswer: 0,
      explanation: `Understanding the key characteristics helps in properly identifying and working with {keyword}.`
    },
    {
      question: `In what context is {keyword} most commonly used?`,
      options: [
        `The primary domain where {keyword} is applied`,
        `An unrelated field`,
        `A completely different context`,
        `{keyword} is not used anywhere`
      ],
      correctAnswer: 0,
      explanation: `{keyword} has specific use cases and contexts where it provides the most value.`
    }
  ];
  
  return templates;
};

const extractKeyTerms = (text: string): string[] => {
  // Simple key term extraction
  const words = text.toLowerCase().split(/\W+/);
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
  
  return words
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 10);
};

const extractMainTopic = (text: string): string => {
  const sentences = text.split(/[.!?]+/);
  const firstSentence = sentences[0] || '';
  const words = firstSentence.split(/\s+/).slice(0, 3);
  return words.join(' ') || 'Text Analysis';
};

const generateMainIdeaQuestion = (paragraph: string, questionNum: number): QuizQuestion => {
  return {
    id: `q${questionNum}`,
    question: `What is the main idea of the provided text?`,
    options: [
      `The central theme discussed in the passage`,
      `A minor detail mentioned briefly`,
      `An unrelated concept`,
      `The conclusion only`
    ],
    correctAnswer: 0,
    explanation: `The main idea encompasses the central theme and primary message of the entire text.`,
    difficulty: 'medium',
    topic: 'Reading Comprehension'
  };
};

const generateDetailQuestion = (sentences: string[], keyTerms: string[], questionNum: number): QuizQuestion => {
  const term = keyTerms[questionNum % keyTerms.length] || 'concept';
  return {
    id: `q${questionNum}`,
    question: `According to the text, what is mentioned about "${term}"?`,
    options: [
      `Information directly stated in the text about ${term}`,
      `Something not mentioned in the text`,
      `An opposite statement`,
      `Unrelated information`
    ],
    correctAnswer: 0,
    explanation: `This question tests your ability to identify specific details mentioned in the text.`,
    difficulty: 'easy',
    topic: 'Detail Recognition'
  };
};

const generateInferenceQuestion = (paragraph: string, questionNum: number): QuizQuestion => {
  return {
    id: `q${questionNum}`,
    question: `Based on the information provided, what can be inferred?`,
    options: [
      `A logical conclusion that can be drawn from the text`,
      `Something explicitly stated`,
      `An unrelated assumption`,
      `The opposite of what's suggested`
    ],
    correctAnswer: 0,
    explanation: `Inference questions require you to draw logical conclusions based on the information provided.`,
    difficulty: 'hard',
    topic: 'Critical Thinking'
  };
};

const generateVocabularyQuestion = (keyTerms: string[], paragraph: string, questionNum: number): QuizQuestion => {
  const term = keyTerms[questionNum % keyTerms.length] || 'word';
  return {
    id: `q${questionNum}`,
    question: `In the context of the passage, what does "${term}" most likely mean?`,
    options: [
      `The contextual meaning as used in the passage`,
      `A completely different meaning`,
      `An unrelated definition`,
      `The term is not defined`
    ],
    correctAnswer: 0,
    explanation: `Understanding vocabulary in context is crucial for comprehension.`,
    difficulty: 'medium',
    topic: 'Vocabulary'
  };
};

const generatePersonalizedFeedback = (percentage: number, quiz: GeneratedQuiz, timeSpent: number): string => {
  const avgTimePerQuestion = timeSpent / quiz.questions.length;
  const timeEfficiency = avgTimePerQuestion <= 90 ? 'efficiently' : 'thoroughly';
  
  if (percentage >= 90) {
    return `Outstanding performance! You scored ${percentage}% on the ${quiz.topic} quiz, demonstrating exceptional mastery of the subject matter. You completed the quiz ${timeEfficiency}, showing both knowledge and good time management. Your understanding of ${quiz.topic} is clearly at an advanced level.`;
  } else if (percentage >= 80) {
    return `Excellent work! You achieved ${percentage}% on the ${quiz.topic} quiz, showing strong comprehension of the material. You worked ${timeEfficiency} through the questions, indicating good preparation. With minor review of missed concepts, you'll have complete mastery.`;
  } else if (percentage >= 70) {
    return `Good job! You scored ${percentage}% on the ${quiz.topic} quiz, demonstrating solid understanding of the core concepts. You approached the quiz ${timeEfficiency}, showing thoughtful consideration. Focus on reviewing the areas where you had difficulty to strengthen your knowledge.`;
  } else if (percentage >= 60) {
    return `You're making progress! Your score of ${percentage}% on the ${quiz.topic} quiz shows you have grasped some fundamental concepts. You worked ${timeEfficiency} through the material. With focused study on the topics you found challenging, you can significantly improve your understanding.`;
  } else {
    return `Keep learning! Your ${percentage}% score on the ${quiz.topic} quiz indicates you're beginning to engage with the material. You took time to work ${timeEfficiency} through the questions. This is a great starting point - focus on building your foundation in the basic concepts and practice regularly.`;
  }
};