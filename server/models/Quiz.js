import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    minlength: [10, 'Question must be at least 10 characters long'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: [{
    type: String,
    required: [true, 'Option text is required'],
    trim: true,
    maxlength: [200, 'Option cannot exceed 200 characters']
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: [0, 'Correct answer index must be 0 or greater'],
    validate: {
      validator: function(value) {
        return value < this.options.length;
      },
      message: 'Correct answer index must be less than the number of options'
    }
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  }
}, {
  _id: true
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  topic: {
    type: String,
    required: [true, 'Quiz topic is required'],
    trim: true,
    enum: {
      values: ['Programming', 'Frontend', 'Backend', 'Database', 'DevOps', 'Data Science', 'Machine Learning', 'Mobile Development', 'Web Development', 'Software Engineering'],
      message: 'Please select a valid topic'
    },
    index: true
  },
  difficulty: {
    type: String,
    required: [true, 'Quiz difficulty is required'],
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced'],
      message: 'Please select a valid difficulty level'
    },
    index: true
  },
  timeLimit: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [60, 'Time limit must be at least 60 seconds'],
    max: [7200, 'Time limit cannot exceed 2 hours'], // 2 hours max
    default: 600 // 10 minutes default
  },
  questions: {
    type: [questionSchema],
    required: [true, 'Quiz must have at least one question'],
    validate: {
      validator: function(questions) {
        return questions.length >= 1 && questions.length <= 50;
      },
      message: 'Quiz must have between 1 and 50 questions'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
quizSchema.index({ topic: 1, difficulty: 1 });
quizSchema.index({ isActive: 1, createdAt: -1 });
quizSchema.index({ title: 'text', description: 'text' });

// Virtual for question count
quizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Instance method to increment attempts
quizSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return await this.save({ validateBeforeSave: false });
};

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;