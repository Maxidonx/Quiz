from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Quiz, Question, User
import logging

quiz_routes = Blueprint("quiz", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

### 📌 Route: Create Quiz (Admins Only) ###
@quiz_routes.route('/quiz', methods=['POST'])
@jwt_required()
def create_quiz():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.json
    if not data or 'title' not in data or 'category' not in data:
        return jsonify({"error": "Invalid payload"}), 400

    if not isinstance(data['category'], str):
        return jsonify({"error": "Category must be a string"}), 400

    try:
        quiz = Quiz(title=data['title'], category=data['category'])
        db.session.add(quiz)
        db.session.commit()

        return jsonify({"message": "Quiz created", "quiz_id": quiz.id}), 201
    except Exception as e:
        logger.error(f"Error creating quiz: {e}")
        return jsonify({"error": "Failed to create quiz"}), 500


### 📌 Route: Add Question to Quiz (Admins Only) ###
@quiz_routes.route('/quiz/<quiz_identifier>/question', methods=['POST'])
@jwt_required()
def add_question(quiz_identifier):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.json
    required_fields = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Invalid payload"}), 400

    try:
        quiz = Quiz.query.filter(
            (Quiz.id == quiz_identifier) | (Quiz.category == quiz_identifier)
        ).first()

        if not quiz:
            return jsonify({"error": f"Quiz not found for '{quiz_identifier}'"}), 404

        question = Question(
            quiz_id=quiz.id,
            question_text=data['question_text'],
            option_a=data['option_a'],
            option_b=data['option_b'],
            option_c=data['option_c'],
            option_d=data['option_d'],
            correct_option=data['correct_option']
        )
        db.session.add(question)
        db.session.commit()

        return jsonify({"message": "Question added", "question_id": question.id}), 201
    except Exception as e:
        logger.error(f"Error adding question for quiz {quiz_identifier}: {e}")
        return jsonify({"error": "Failed to add question"}), 500


### 📌 Route: Get Quiz Questions (Admins & Users) ###
@quiz_routes.route('/quiz/<quiz_identifier>/questions', methods=['GET'])
@jwt_required()
def get_quiz_questions(quiz_identifier):
    quiz = Quiz.query.filter(
        (Quiz.id == quiz_identifier) | (Quiz.category == quiz_identifier)
    ).first()

    if not quiz:
        return jsonify({"error": f"Quiz not found for '{quiz_identifier}'"}), 404

    try:
        questions = Question.query.filter_by(quiz_id=quiz.id).all()
        if not questions:
            return jsonify({"message": "No questions found for this quiz"}), 404

        questions_data = [
            {
                "id": q.id,
                "question_text": q.question_text,
                "options": {
                    "A": q.option_a,
                    "B": q.option_b,
                    "C": q.option_c,
                    "D": q.option_d
                },
                "correct_option": q.correct_option
            }
            for q in questions
        ]

        return jsonify(questions_data), 200
    except Exception as e:
        logger.error(f"Error fetching questions for quiz {quiz_identifier}: {e}")
        return jsonify({"error": "Failed to fetch questions"}), 500


### 📌 Route: Edit Question (Admins Only) ###
@quiz_routes.route('/quiz/<quiz_identifier>/question/<int:question_id>', methods=['PUT'])
@jwt_required()
def edit_question(quiz_identifier, question_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.json
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    quiz = Quiz.query.filter(
        (Quiz.id == quiz_identifier) | (Quiz.category == quiz_identifier)
    ).first()

    if not quiz:
        return jsonify({"error": f"Quiz not found for '{quiz_identifier}'"}), 404

    try:
        question = Question.query.filter_by(id=question_id, quiz_id=quiz.id).first()
        if not question:
            return jsonify({"error": "Question not found"}), 404

        for key, value in data.items():
            if hasattr(question, key):
                setattr(question, key, value)

        db.session.commit()
        return jsonify({"message": "Question updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating question {question_id}: {e}")
        return jsonify({"error": "Failed to update question"}), 500


### 📌 Route: Delete Question (Admins Only) ###
@quiz_routes.route('/quiz/<quiz_identifier>/question/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(quiz_identifier, question_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    quiz = Quiz.query.filter(
        (Quiz.id == quiz_identifier) | (Quiz.category == quiz_identifier)
    ).first()

    if not quiz:
        return jsonify({"error": f"Quiz not found for '{quiz_identifier}'"}), 404

    try:
        question = Question.query.filter_by(id=question_id, quiz_id=quiz.id).first()
        if not question:
            return jsonify({"error": "Question not found"}), 404

        db.session.delete(question)
        db.session.commit()

        return jsonify({"message": "Question deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Error deleting question {question_id}: {e}")
        return jsonify({"error": "Failed to delete question"}), 500
