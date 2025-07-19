# AI Quiz Generator - Python Backend

This backend service provides AI-powered quiz generation using the T5 model from Hugging Face.

## Features

- **T5-based Question Generation**: Uses the `iarfmoose/t5-base-question-generator` model
- **Paragraph Analysis**: Generates questions from provided text content
- **Keyword-based Generation**: Creates quizzes from topics/keywords
- **RESTful API**: Easy integration with the React frontend

## Setup

1. **Install Python Dependencies**:
   ```bash
   cd python-backend
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5001`

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and model loading state

### Generate Quiz from Paragraph
- **POST** `/generate-quiz`
- Body: `{ "paragraph": "text content", "questionCount": 5 }`
- Generates questions based on text analysis

### Generate Quiz from Keyword
- **POST** `/generate-quiz-keyword`
- Body: `{ "keyword": "topic", "questionCount": 5, "difficulty": "medium" }`
- Creates questions related to the keyword

## Model Information

The service uses the T5 (Text-to-Text Transfer Transformer) model specifically fine-tuned for question generation. The model analyzes input text and generates relevant questions with multiple-choice options.

## Integration

To integrate with the React frontend:

1. Update the `VITE_API_URL` in your `.env` file to point to this backend
2. The frontend will automatically use this service for paragraph-based quiz generation
3. Keyword-based generation can also be routed through this backend if needed

## Performance Notes

- First request may be slower due to model loading
- Consider using GPU acceleration for better performance
- Model caching is implemented to avoid reloading