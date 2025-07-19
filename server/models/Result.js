import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userAnswer: {
    type: Number,
    required: true,
    min: [0, 'Answer index must be 0 or greater']
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: [0, 'Correct answer index must be 0 or greater']
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
}, {
  _id: false
});

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required'],
    index: true
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions count is required'],
    min: [1, 'Total questions must be at least 1']
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  timeSpent: {
    type: Number,
    required: [true, 'Time spent is required'],
    min: [0, 'Time spent cannot be negative']
  },
  answers: {
    type: [answerSchema],
    required: [true, 'Answers are required']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
resultSchema.index({ userId: 1, quizId: 1 });
resultSchema.index({ userId: 1, createdAt: -1 });

// Virtual for grade based on percentage
resultSchema.virtual('grade').get(function() {
  if (this.percentage >= 90) return 'A+';
  if (this.percentage >= 85) return 'A';
  if (this.percentage >= 80) return 'A-';
  if (this.percentage >= 75) return 'B+';
  if (this.percentage >= 70) return 'B';
  if (this.percentage >= 65) return 'B-';
  if (this.percentage >= 60) return 'C+';
  if (this.percentage >= 55) return 'C';
  if (this.percentage >= 50) return 'C-';
  return 'F';
});

// Pre-save middleware to calculate percentage
resultSchema.pre('save', function(next) {
  if (this.isModified('score') || this.isModified('totalQuestions')) {
    this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  }
  next();
});

const Result = mongoose.model('Result', resultSchema);

export default Result;