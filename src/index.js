const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'Usuário não existe' });
  }

  request.user = user;

  return next();
}

function checkExistsTodos(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const checkTodo = user.todos.find((todo) => todo.id === id);

  if (!checkTodo) {
    return response.status(404).json({ error: 'Todo não existe' });
  }

  request.todo = checkTodo;

  return next();
}

/**
 * id: 'uuid', --> precisa ser um uuid
 * name: 'Danilo Vieira', 
 * username: 'danilo', 
 * todos: []
 */
app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Usuário já existe' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);
});

app.use(checksExistsUserAccount)
app.get('/todos', (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

/**
 * id: 'uuid' --> precisa ser um uuid
 * title: 'Nome da tarefa',
 * done: false, 
 * deadline: '2021-02-27T00:00:00.000Z', 
 * created_at: '2021-02-22T00:00:00.000Z'
 */
app.post('/todos', (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checkExistsTodos, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;
  
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checkExistsTodos, (request, response) => {
  const { todo } = request;
  
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo não existe' });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;