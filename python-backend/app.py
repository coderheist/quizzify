from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer
import random
import re
import nltk
from nltk.tokenize import sent_tokenize
import logging

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model and tokenizer
model = None
tokenizer = None

def load_model():
    """Load the T5 model for question generation"""
    global model, tokenizer
    try:
        logger.info("Loading T5 model...")
        model_name = "iarfmoose/t5-base-question-generator"
        tokenizer = T5Tokenizer.from_pretrained(model_name)
        model = T5ForConditionalGeneration.from_pretrained(model_name)
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise e

def generate_question(context, answer):
    """Generate a question from context and answer"""
    try:
        input_text = f"context: {context} answer: {answer}"
        input_ids = tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)
        
        with torch.no_grad():
            outputs = model.generate(
                input_ids,
                max_length=64,
                num_beams=4,
                early_stopping=True,
                no_repeat_ngram_size=2
            )
        
        question = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return question
    except Exception as e:
        logger.error(f"Error generating question: {str(e)}")
        return None

def extract_key_phrases(text, num_phrases=10):
    """Extract key phrases from text to use as answers"""
    # Simple extraction based on noun phrases and important words
    sentences = sent_tokenize(text)
    key_phrases = []
    
    # Extract potential answers (nouns, proper nouns, etc.)
    words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)  # Proper nouns
    words.extend(re.findall(r'\b[a-z]{4,}\b', text.lower()))  # Common words
    
    # Remove duplicates and filter
    unique_words = list(set(words))
    
    # Select random phrases as potential answers
    selected_phrases = random.sample(unique_words, min(num_phrases, len(unique_words)))
    
    return selected_phrases

def generate_distractors(correct_answer, context, num_distractors=3):
    """Generate plausible wrong answers (distractors)"""
    # Simple distractor generation - in production, use more sophisticated methods
    words = re.findall(r'\b[a-zA-Z]{3,}\b', context)
    words = [w for w in words if w.lower() != correct_answer.lower()]
    
    if len(words) >= num_distractors:
        return random.sample(words, num_distractors)
    else:
        # Generate generic distractors if not enough words
        generic_distractors = [
            "None of the above",
            "All of the above",
            "Cannot be determined",
            "Not mentioned in the text"
        ]
        return random.sample(generic_distractors, num_distractors)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model_loaded": model is not None})

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz_from_paragraph():
    """Generate quiz questions from a paragraph"""
    try:
        data = request.get_json()
        paragraph = data.get('paragraph', '')
        question_count = data.get('questionCount', 5)
        
        if not paragraph:
            return jsonify({"error": "Paragraph is required"}), 400
        
        if len(paragraph) < 100:
            return jsonify({"error": "Paragraph should be at least 100 characters long"}), 400
        
        logger.info(f"Generating {question_count} questions from paragraph")
        
        # Extract key phrases to use as answers
        key_phrases = extract_key_phrases(paragraph, question_count * 2)
        
        questions = []
        used_phrases = set()
        
        for i in range(min(question_count, len(key_phrases))):
            # Select a unique phrase as the correct answer
            available_phrases = [p for p in key_phrases if p not in used_phrases]
            if not available_phrases:
                break
                
            correct_answer = random.choice(available_phrases)
            used_phrases.add(correct_answer)
            
            # Generate question
            question_text = generate_question(paragraph, correct_answer)
            
            if question_text:
                # Generate distractors
                distractors = generate_distractors(correct_answer, paragraph)
                
                # Create options list
                options = [correct_answer] + distractors
                random.shuffle(options)
                
                # Find the correct answer index after shuffling
                correct_index = options.index(correct_answer)
                
                questions.append({
                    "id": f"q{i + 1}",
                    "question": question_text,
                    "options": options,
                    "correctAnswer": correct_index,
                    "explanation": f"The correct answer is '{correct_answer}' as mentioned in the provided text."
                })
        
        # If we couldn't generate enough questions, create some generic ones
        while len(questions) < question_count:
            i = len(questions)
            questions.append({
                "id": f"q{i + 1}",
                "question": f"What is the main topic discussed in the paragraph? (Question {i + 1})",
                "options": [
                    "The main topic as described in the text",
                    "An unrelated topic",
                    "A different subject matter",
                    "None of the above"
                ],
                "correctAnswer": 0,
                "explanation": "This question tests comprehension of the main topic."
            })
        
        quiz_data = {
            "id": f"generated-{random.randint(1000, 9999)}",
            "title": "Text Comprehension Quiz",
            "description": "Quiz generated from the provided paragraph using AI",
            "questions": questions[:question_count],
            "timeLimit": question_count * 60,  # 1 minute per question
            "topic": "Text Analysis"
        }
        
        logger.info(f"Successfully generated {len(quiz_data['questions'])} questions")
        return jsonify(quiz_data)
        
    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        return jsonify({"error": "Failed to generate quiz"}), 500

@app.route('/generate-quiz-keyword', methods=['POST'])
def generate_quiz_from_keyword():
    """Generate quiz questions from a keyword (fallback endpoint)"""
    try:
        data = request.get_json()
        keyword = data.get('keyword', '')
        question_count = data.get('questionCount', 5)
        difficulty = data.get('difficulty', 'medium')
        
        if not keyword:
            return jsonify({"error": "Keyword is required"}), 400
        
        logger.info(f"Generating {question_count} questions for keyword: {keyword}")
        
        # This is a simplified implementation
        # In production, you might want to use a knowledge base or API
        questions = []
        
        for i in range(question_count):
            questions.append({
                "id": f"q{i + 1}",
                "question": f"What is an important concept related to {keyword}? (Question {i + 1})",
                "options": [
                    f"Correct concept about {keyword}",
                    "Incorrect option 1",
                    "Incorrect option 2", 
                    "Incorrect option 3"
                ],
                "correctAnswer": 0,
                "explanation": f"This is the correct answer related to {keyword}."
            })
        
        quiz_data = {
            "id": f"generated-{random.randint(1000, 9999)}",
            "title": f"{keyword} Quiz",
            "description": f"A {difficulty} level quiz about {keyword}",
            "questions": questions,
            "timeLimit": question_count * 60,
            "difficulty": difficulty,
            "topic": keyword
        }
        
        return jsonify(quiz_data)
        
    except Exception as e:
        logger.error(f"Error generating quiz from keyword: {str(e)}")
        return jsonify({"error": "Failed to generate quiz"}), 500

if __name__ == '__main__':
    # Load the model on startup
    load_model()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5001, debug=True)