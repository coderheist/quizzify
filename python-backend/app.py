from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer, pipeline
import random
import re
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag
import logging
import json
from collections import Counter
import string

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('averaged_perceptron_tagger')

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for models
question_generator = None
tokenizer = None
stop_words = set(stopwords.words('english'))

def load_models():
    """Load the T5 model and other ML components"""
    global question_generator, tokenizer
    try:
        logger.info("Loading T5 question generation model...")
        model_name = "iarfmoose/t5-base-question-generator"
        tokenizer = T5Tokenizer.from_pretrained(model_name)
        question_generator = T5ForConditionalGeneration.from_pretrained(model_name)
        logger.info("Models loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        raise e

def extract_key_entities(text):
    """Extract key entities and important phrases from text using NLP"""
    # Tokenize and get POS tags
    tokens = word_tokenize(text)
    pos_tags = pos_tag(tokens)
    
    # Extract nouns, proper nouns, and adjectives
    important_words = []
    for word, pos in pos_tags:
        if (pos.startswith('NN') or pos.startswith('JJ') or pos.startswith('VB')) and \
           word.lower() not in stop_words and \
           len(word) > 2 and \
           word.isalpha():
            important_words.append(word)
    
    # Get most frequent important words
    word_freq = Counter(important_words)
    key_entities = [word for word, freq in word_freq.most_common(15)]
    
    # Extract noun phrases
    noun_phrases = []
    i = 0
    while i < len(pos_tags):
        phrase = []
        # Look for adjective + noun or noun + noun patterns
        while i < len(pos_tags) and (pos_tags[i][1].startswith('JJ') or pos_tags[i][1].startswith('NN')):
            if pos_tags[i][0].lower() not in stop_words and pos_tags[i][0].isalpha():
                phrase.append(pos_tags[i][0])
            i += 1
        if len(phrase) >= 2:
            noun_phrases.append(' '.join(phrase))
        i += 1
    
    return key_entities, noun_phrases

def generate_question_with_t5(context, answer):
    """Generate a question using T5 model"""
    try:
        # Prepare input for T5
        input_text = f"context: {context} answer: {answer}"
        input_ids = tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)
        
        # Generate question
        with torch.no_grad():
            outputs = question_generator.generate(
                input_ids,
                max_length=64,
                num_beams=4,
                early_stopping=True,
                no_repeat_ngram_size=2,
                temperature=0.7,
                do_sample=True
            )
        
        question = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Clean up the question
        question = question.strip()
        if not question.endswith('?'):
            question += '?'
            
        return question
    except Exception as e:
        logger.error(f"Error generating question with T5: {str(e)}")
        return None

def generate_smart_distractors(correct_answer, context, key_entities, noun_phrases):
    """Generate intelligent distractors based on context analysis"""
    distractors = []
    
    # Type 1: Use other key entities from the text
    context_entities = [entity for entity in key_entities if entity.lower() != correct_answer.lower()]
    if context_entities:
        distractors.extend(random.sample(context_entities, min(2, len(context_entities))))
    
    # Type 2: Use noun phrases
    relevant_phrases = [phrase for phrase in noun_phrases if correct_answer.lower() not in phrase.lower()]
    if relevant_phrases:
        distractors.extend(random.sample(relevant_phrases, min(1, len(relevant_phrases))))
    
    # Type 3: Generate semantic distractors based on answer type
    if len(distractors) < 3:
        semantic_distractors = generate_semantic_distractors(correct_answer, context)
        distractors.extend(semantic_distractors)
    
    # Ensure we have exactly 3 distractors
    while len(distractors) < 3:
        generic_distractors = [
            "None of the above",
            "All of the mentioned options",
            "Cannot be determined from the text",
            "Not specified in the passage"
        ]
        available_generic = [d for d in generic_distractors if d not in distractors]
        if available_generic:
            distractors.append(random.choice(available_generic))
        else:
            distractors.append(f"Alternative option {len(distractors) + 1}")
    
    return distractors[:3]

def generate_semantic_distractors(correct_answer, context):
    """Generate semantically related but incorrect distractors"""
    # Simple semantic distractor generation
    # In a production system, you might use word embeddings or knowledge graphs
    
    words = re.findall(r'\b[a-zA-Z]{3,}\b', context)
    words = [w for w in words if w.lower() != correct_answer.lower() and w.lower() not in stop_words]
    
    if len(words) >= 2:
        return random.sample(words, min(2, len(words)))
    else:
        return ["Alternative concept", "Different approach"]

def analyze_text_complexity(text):
    """Analyze text to determine appropriate question difficulty"""
    sentences = sent_tokenize(text)
    words = word_tokenize(text)
    
    # Calculate metrics
    avg_sentence_length = len(words) / len(sentences) if sentences else 0
    unique_words = len(set(word.lower() for word in words if word.isalpha()))
    total_words = len([word for word in words if word.isalpha()])
    lexical_diversity = unique_words / total_words if total_words > 0 else 0
    
    # Determine difficulty
    if avg_sentence_length > 20 and lexical_diversity > 0.7:
        return "hard"
    elif avg_sentence_length > 15 and lexical_diversity > 0.5:
        return "medium"
    else:
        return "easy"

def create_comprehensive_questions(text, key_entities, noun_phrases, question_count):
    """Create different types of questions for comprehensive assessment"""
    questions = []
    sentences = sent_tokenize(text)
    difficulty = analyze_text_complexity(text)
    
    # Question type distribution
    question_types = ['factual', 'inference', 'main_idea', 'detail', 'vocabulary']
    
    for i in range(question_count):
        question_type = question_types[i % len(question_types)]
        
        if question_type == 'factual' and key_entities:
            # Factual questions about key entities
            answer = random.choice(key_entities)
            question = generate_question_with_t5(text, answer)
            
        elif question_type == 'inference':
            # Inference questions
            if len(sentences) >= 2:
                context_sentence = random.choice(sentences)
                # Create inference-based answer
                answer = "can be inferred from the context"
                question = f"What can be inferred from the statement: '{context_sentence[:100]}...'?"
            else:
                answer = random.choice(key_entities) if key_entities else "main concept"
                question = generate_question_with_t5(text, answer)
                
        elif question_type == 'main_idea':
            # Main idea questions
            answer = "the central theme of the passage"
            question = "What is the main idea discussed in this text?"
            
        elif question_type == 'detail':
            # Detail questions
            if noun_phrases:
                answer = random.choice(noun_phrases)
                question = generate_question_with_t5(text, answer)
            else:
                answer = random.choice(key_entities) if key_entities else "specific detail"
                question = generate_question_with_t5(text, answer)
                
        else:  # vocabulary
            # Vocabulary in context
            if key_entities:
                answer = random.choice(key_entities)
                question = f"In the context of this passage, what does '{answer}' refer to?"
            else:
                answer = "contextual meaning"
                question = "What is the contextual meaning of the key term mentioned?"
        
        # Generate question if T5 failed
        if not question or question == answer:
            question = f"According to the text, what is mentioned about {answer}?"
        
        # Generate distractors
        distractors = generate_smart_distractors(answer, text, key_entities, noun_phrases)
        
        # Create options and shuffle
        options = [answer] + distractors
        random.shuffle(options)
        correct_index = options.index(answer)
        
        # Generate explanation
        explanation = f"The correct answer is '{answer}' as it is directly supported by the information provided in the text."
        
        questions.append({
            "id": f"q{i + 1}",
            "question": question,
            "options": options,
            "correctAnswer": correct_index,
            "explanation": explanation,
            "difficulty": difficulty,
            "type": question_type
        })
    
    return questions

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "model_loaded": question_generator is not None,
        "service": "AI Quiz Generator with T5"
    })

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz_from_paragraph():
    """Generate quiz questions from a paragraph using T5 and NLP"""
    try:
        data = request.get_json()
        paragraph = data.get('paragraph', '').strip()
        question_count = data.get('questionCount', 5)
        
        # Validation
        if not paragraph:
            return jsonify({"error": "Paragraph is required"}), 400
        
        if len(paragraph) < 100:
            return jsonify({"error": "Paragraph should be at least 100 characters long"}), 400
        
        if question_count < 1 or question_count > 20:
            return jsonify({"error": "Question count should be between 1 and 20"}), 400
        
        logger.info(f"Generating {question_count} questions from paragraph of length {len(paragraph)}")
        
        # Extract key information from text
        key_entities, noun_phrases = extract_key_entities(paragraph)
        logger.info(f"Extracted {len(key_entities)} key entities and {len(noun_phrases)} noun phrases")
        
        # Generate comprehensive questions
        questions = create_comprehensive_questions(paragraph, key_entities, noun_phrases, question_count)
        
        # Determine main topic
        main_topic = noun_phrases[0] if noun_phrases else (key_entities[0] if key_entities else "Text Analysis")
        
        # Calculate estimated time (1.5 minutes per question)
        estimated_time = question_count * 90
        
        quiz_data = {
            "id": f"t5-generated-{random.randint(1000, 9999)}",
            "title": f"Comprehension Quiz: {main_topic}",
            "description": f"AI-generated quiz from text analysis using T5 model and advanced NLP techniques",
            "questions": questions,
            "timeLimit": estimated_time,
            "topic": main_topic,
            "generatedBy": "paragraph",
            "metadata": {
                "createdAt": "2024-01-01T00:00:00Z",
                "questionCount": len(questions),
                "estimatedTime": estimated_time,
                "textLength": len(paragraph),
                "keyEntities": len(key_entities),
                "nounPhrases": len(noun_phrases)
            }
        }
        
        logger.info(f"Successfully generated {len(questions)} questions using T5 model")
        return jsonify(quiz_data)
        
    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500

@app.route('/generate-quiz-keyword', methods=['POST'])
def generate_quiz_from_keyword():
    """Generate quiz questions from a keyword using knowledge-based approach"""
    try:
        data = request.get_json()
        keyword = data.get('keyword', '').strip()
        question_count = data.get('questionCount', 5)
        difficulty = data.get('difficulty', 'medium')
        
        if not keyword:
            return jsonify({"error": "Keyword is required"}), 400
        
        logger.info(f"Generating {question_count} {difficulty} questions for keyword: {keyword}")
        
        # Generate knowledge-based questions
        questions = generate_keyword_questions(keyword, question_count, difficulty)
        
        quiz_data = {
            "id": f"keyword-{random.randint(1000, 9999)}",
            "title": f"{keyword.title()} Quiz - {difficulty.title()} Level",
            "description": f"Comprehensive {difficulty} level quiz covering key concepts of {keyword}",
            "questions": questions,
            "timeLimit": question_count * 90,
            "difficulty": difficulty,
            "topic": keyword,
            "generatedBy": "keyword",
            "metadata": {
                "createdAt": "2024-01-01T00:00:00Z",
                "questionCount": len(questions),
                "estimatedTime": question_count * 90
            }
        }
        
        return jsonify(quiz_data)
        
    except Exception as e:
        logger.error(f"Error generating quiz from keyword: {str(e)}")
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500

def generate_keyword_questions(keyword, question_count, difficulty):
    """Generate questions based on keyword with varying difficulty"""
    questions = []
    
    # Question templates based on difficulty
    if difficulty == "easy":
        templates = [
            f"What is {keyword}?",
            f"Which of the following best describes {keyword}?",
            f"What is the main purpose of {keyword}?",
            f"In which field is {keyword} commonly used?",
            f"What are the basic components of {keyword}?"
        ]
    elif difficulty == "medium":
        templates = [
            f"How does {keyword} work in practice?",
            f"What are the key advantages of using {keyword}?",
            f"Which principle is fundamental to {keyword}?",
            f"What challenges are associated with {keyword}?",
            f"How has {keyword} evolved over time?"
        ]
    else:  # hard
        templates = [
            f"What are the advanced applications of {keyword}?",
            f"How does {keyword} integrate with other systems?",
            f"What are the theoretical foundations of {keyword}?",
            f"What future developments are expected in {keyword}?",
            f"How do experts optimize {keyword} for complex scenarios?"
        ]
    
    for i in range(question_count):
        template = templates[i % len(templates)]
        
        # Generate context-appropriate options
        if difficulty == "easy":
            correct_option = f"Fundamental concept related to {keyword}"
            distractors = [
                "Unrelated technology",
                "Different methodology",
                "Alternative approach"
            ]
        elif difficulty == "medium":
            correct_option = f"Practical application of {keyword} principles"
            distractors = [
                "Theoretical concept only",
                "Outdated methodology",
                "Unproven technique"
            ]
        else:  # hard
            correct_option = f"Advanced implementation of {keyword} in complex systems"
            distractors = [
                "Basic application without optimization",
                "Simplified version for beginners",
                "Legacy system approach"
            ]
        
        options = [correct_option] + distractors
        random.shuffle(options)
        correct_index = options.index(correct_option)
        
        questions.append({
            "id": f"q{i + 1}",
            "question": template,
            "options": options,
            "correctAnswer": correct_index,
            "explanation": f"This answer correctly represents the {difficulty} level understanding of {keyword} and its applications.",
            "difficulty": difficulty,
            "topic": keyword
        })
    
    return questions

@app.route('/analyze-performance', methods=['POST'])
def analyze_performance():
    """Analyze quiz performance and provide detailed feedback"""
    try:
        data = request.get_json()
        quiz_data = data.get('quiz', {})
        user_answers = data.get('userAnswers', {})
        time_spent = data.get('timeSpent', 0)
        
        # Calculate detailed performance metrics
        total_questions = len(quiz_data.get('questions', []))
        correct_answers = 0
        topic_performance = {}
        difficulty_performance = {}
        
        for i, question in enumerate(quiz_data.get('questions', [])):
            user_answer = user_answers.get(str(i), -1)
            is_correct = user_answer == question.get('correctAnswer', -1)
            
            if is_correct:
                correct_answers += 1
            
            # Track performance by topic
            topic = question.get('topic', 'General')
            if topic not in topic_performance:
                topic_performance[topic] = {'correct': 0, 'total': 0}
            topic_performance[topic]['total'] += 1
            if is_correct:
                topic_performance[topic]['correct'] += 1
            
            # Track performance by difficulty
            difficulty = question.get('difficulty', 'medium')
            if difficulty not in difficulty_performance:
                difficulty_performance[difficulty] = {'correct': 0, 'total': 0}
            difficulty_performance[difficulty]['total'] += 1
            if is_correct:
                difficulty_performance[difficulty]['correct'] += 1
        
        percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        # Generate detailed analysis
        analysis = {
            "overall_score": percentage,
            "correct_answers": correct_answers,
            "total_questions": total_questions,
            "time_efficiency": "good" if time_spent <= total_questions * 90 else "needs_improvement",
            "topic_breakdown": {
                topic: (stats['correct'] / stats['total'] * 100) 
                for topic, stats in topic_performance.items()
            },
            "difficulty_breakdown": {
                diff: (stats['correct'] / stats['total'] * 100) 
                for diff, stats in difficulty_performance.items()
            },
            "recommendations": generate_recommendations(percentage, topic_performance, difficulty_performance)
        }
        
        return jsonify(analysis)
        
    except Exception as e:
        logger.error(f"Error analyzing performance: {str(e)}")
        return jsonify({"error": "Failed to analyze performance"}), 500

def generate_recommendations(percentage, topic_performance, difficulty_performance):
    """Generate personalized recommendations based on performance"""
    recommendations = []
    
    # Overall performance recommendations
    if percentage >= 90:
        recommendations.append("Excellent performance! Consider taking more advanced quizzes.")
    elif percentage >= 70:
        recommendations.append("Good work! Focus on reviewing missed concepts.")
    else:
        recommendations.append("Keep practicing! Review fundamental concepts.")
    
    # Topic-specific recommendations
    weak_topics = [
        topic for topic, stats in topic_performance.items() 
        if (stats['correct'] / stats['total'] * 100) < 60
    ]
    if weak_topics:
        recommendations.append(f"Focus on studying: {', '.join(weak_topics)}")
    
    # Difficulty-specific recommendations
    if 'hard' in difficulty_performance:
        hard_score = difficulty_performance['hard']['correct'] / difficulty_performance['hard']['total'] * 100
        if hard_score < 50:
            recommendations.append("Practice more challenging problems to improve advanced understanding.")
    
    return recommendations

if __name__ == '__main__':
    # Load models on startup
    load_models()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5001, debug=True)