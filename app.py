import json
import os
from flask import Flask, request, jsonify, session, render_template, redirect, url_for
from flask_cors import CORS
from cryptography.fernet import Fernet

app = Flask(__name__)
app.secret_key = 'secretkey'
CORS(app, supports_credentials=True)

USER_FILE = 'user.json'
LIBRARY_FILE = 'library.json'
FERNET_KEY = b'RHGTSTTrT9Hdvf8tO8GSkzyRrquINou8pd_-57owsnc='
fernet = Fernet(FERNET_KEY)

def encrypt_password(password):
    return fernet.encrypt(password.encode()).decode()

def decrypt_password(token):
    return fernet.decrypt(token.encode()).decode()

def load_users():
    if not os.path.exists(USER_FILE):
        with open(USER_FILE, 'w') as f:
            json.dump({}, f)
    with open(USER_FILE, 'r') as f:
        try:
            return json.load(f)
        except:
            return {}

def save_users(users):
    with open(USER_FILE, 'w') as f:
        json.dump(users, f)

def load_library():
    if not os.path.exists(LIBRARY_FILE):
        with open(LIBRARY_FILE, 'w') as f:
            json.dump({}, f)
    with open(LIBRARY_FILE, 'r') as f:
        try:
            return json.load(f)
        except:
            return {}

def save_library(library):
    with open(LIBRARY_FILE, 'w') as f:
        json.dump(library, f)

def is_logged_in():
    return 'user' in session

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    users = load_users()
    if data['username'] in users:
        return jsonify({'status': 'fail', 'message': 'Username already exists'})
    users[data['username']] = encrypt_password(data['password'])
    save_users(users)
    return jsonify({'status': 'success', 'message': 'User registered'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    users = load_users()
    encrypted = users.get(data['username'])
    if encrypted and decrypt_password(encrypted) == data['password']:
        session['user'] = data['username']
        return jsonify({'status': 'success', 'message': 'Login successful'})
    return jsonify({'status': 'fail', 'message': 'Invalid credentials'})

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'status': 'success', 'message': 'Logged out'})

@app.route('/books', methods=['GET'])
def get_books():
    if not is_logged_in():
        return jsonify({'status': 'unauthorized'}), 401
    username = session['user']
    library = load_library()
    return jsonify(library.get(username, []))

@app.route('/books', methods=['POST'])
def add_book():
    if not is_logged_in():
        return jsonify({'status': 'unauthorized'}), 401
    username = session['user']
    library = load_library()
    books = library.get(username, [])
    data = request.json
    books.append(data)
    library[username] = books
    save_library(library)
    return jsonify({'status': 'success'}), 201

@app.route('/books/<int:index>', methods=['DELETE'])
def delete_book(index):
    if not is_logged_in():
        return jsonify({'status': 'unauthorized'}), 401
    username = session['user']
    library = load_library()
    books = library.get(username, [])
    if 0 <= index < len(books):
        books.pop(index)
        library[username] = books
        save_library(library)
        return jsonify({'status': 'deleted'})
    return jsonify({'status': 'not found'}), 404

@app.route('/books/<int:index>', methods=['PUT'])
def update_book(index):
    if not is_logged_in():
        return jsonify({'status': 'unauthorized'}), 401
    username = session['user']
    library = load_library()
    books = library.get(username, [])
    if 0 <= index < len(books):
        data = request.json
        books[index].update(data)
        library[username] = books
        save_library(library)
        return jsonify({'status': 'updated'})
    return jsonify({'status': 'not found'}), 404

@app.route('/')
def serve_login():
    return render_template('login.html')

@app.route('/index.html')
def serve_index():
    if not is_logged_in():
        return redirect(url_for('serve_login'))
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)