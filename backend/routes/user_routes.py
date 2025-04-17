from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, UserQuiz, Question, Quiz, User
import datetime
from flask_socketio import emit
from werkzeug.utils import secure_filename
from flask import current_app, url_for
import os


user_routes = Blueprint("user", __name__)


UPLOAD_FOLDER = 'static/upload'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

### 📌 Route: Retrieve All Quiz Categories ###
@user_routes.route('/quiz/categories', methods=['GET'])
def get_categories():
    categories = Quiz.query.with_entities(Quiz.category).distinct().all()
    return jsonify([category[0] for category in categories]), 200

### 📌 Route: Retrieve Questions by Category ###
@user_routes.route('/quiz/category/<string:category>/questions', methods=['GET'])
def get_questions_by_category(category):
    try:
        print(f"Fetching questions for category: {category}")

        quiz = Quiz.query.filter_by(category=category).first()
        if not quiz:
            print("No quizzes found for this category")
            return jsonify({"error": "No quizzes found for this category"}), 404

        questions = Question.query.filter_by(quiz_id=quiz.id).all()
        if not questions:
            print("No questions found")
            return jsonify({"message": "No questions found"}), 404

        questions_data = [
            {
                "id": q.id,
                "quiz_id": q.quiz_id,
                "question_text": q.question_text,
                "options": {
                    "A": q.option_a,
                    "B": q.option_b,
                    "C": q.option_c,
                    "D": q.option_d
                }
            }
            for q in questions
        ]
        return jsonify(questions_data), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500


### 📌 Route: Submit Quiz and Show Score + Correct Answers ###
@user_routes.route('/quiz/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(quiz_id):
    from app import socketio  # Lazy import to avoid circular import

    user_id = get_jwt_identity()
    data = request.json
    score = 0
    total_questions = len(data.get('answers', []))
    correct_answers = {}

    if 'answers' not in data:
        return jsonify({"error": "Answers are required."}), 400

    try:
        start_time = datetime.datetime.strptime(data['start_time'], "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return jsonify({"error": "Invalid start time format"}), 400

    end_time = datetime.datetime.now()
    time_taken = (end_time - start_time).total_seconds()

    for answer in data['answers']:
        question = Question.query.get(answer['question_id'])
        if question:
            if question.correct_option == answer['selected_option']:
                score += 1
            else:
                correct_answers[question.id] = question.correct_option

    existing_quiz = UserQuiz.query.filter_by(user_id=user_id, quiz_id=quiz_id).first()

    if existing_quiz:
        if score > existing_quiz.score:
            existing_quiz.score = score
            existing_quiz.time_taken = time_taken
            db.session.commit()
            message = "New high score! Quiz results updated."
        else:
            message = "Quiz already taken. Your highest score remains."
    else:
        new_user_quiz = UserQuiz(user_id=user_id, quiz_id=quiz_id, score=score, time_taken=time_taken)
        db.session.add(new_user_quiz)
        db.session.commit()
        message = "Quiz submitted successfully."

    # ✅ Emit event to update leaderboard
    socketio.emit('update_leaderboard', {"user_id": user_id, "score": score, "time_taken": time_taken}, to='/', namespace='/')
    # ✅ Emit event to update user score
    socketio.emit('update_user_score', {"user_id": user_id, "score": score}, to=user_id, namespace='/')
    # ✅ Emit event to update quiz results
    socketio.emit('update_quiz_results', {"user_id": user_id, "quiz_id": quiz_id, "score": score}, to=quiz_id, namespace='/')
    # ✅ Emit event to update quiz completion
    socketio.emit('quiz_completed', {"user_id": user_id, "quiz_id": quiz_id, "score": score}, to=quiz_id, namespace='/')
    # ✅ Emit event to update quiz time taken
    socketio.emit('update_quiz_time', {"user_id": user_id, "quiz_id": quiz_id, "time_taken": time_taken}, to=quiz_id, namespace='/')
    # ✅ Emit event to update quiz score
    socketio.emit('update_quiz_score', {"user_id": user_id, "quiz_id": quiz_id, "score": score}, to=quiz_id, namespace='/')
    # ✅ Emit event to update quiz leaderboard
    socketio.emit('update_quiz_leaderboard', {"user_id": user_id, "quiz_id": quiz_id, "score": score}, to=quiz_id, namespace='/')

    return jsonify({
        "message": message,
        "score": score,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "time_taken": time_taken
    }), 200


### 📌 Route: Update User Profile ###
@user_routes.route('/user/profile/update', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.form
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'nationality' in data:
        user.nationality = data['nationality']

    # Handle file upload
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)

            upload_dir = os.path.join(current_app.root_path, current_app.config['UPLOAD_FOLDER'])
            os.makedirs(upload_dir, exist_ok=True)

            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)

            # URL path for frontend use
            user.profile_image = url_for('static', filename=f"upload/{filename}", _external=True)

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200

@user_routes.route('/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "nationality": user.nationality,
        "profile_image": user.profile_image,
        "is_admin": user.is_admin
    }), 200


### 📌 Route: Get Leaderboard ###
@user_routes.route('/leaderboard', methods=['GET'])
def leaderboard():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    leaders = UserQuiz.query.order_by(UserQuiz.score.desc(), UserQuiz.time_taken.asc())\
                            .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "page": leaders.page,
        "total_pages": leaders.pages,
        "total_entries": leaders.total,
        "leaders": [
            {
                "user_id": l.user_id,
                "quiz_id": l.quiz_id,
                "username": User.query.get(l.user_id).username,
                "quiz_title": Quiz.query.get(l.quiz_id).title,
                "score": l.score,
                "time_taken": l.time_taken
            }
            for l in leaders.items
        ]
    }), 200
