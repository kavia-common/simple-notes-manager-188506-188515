# Simple Notes App Frontend

This React app provides a simple notes UI with a sidebar and an editor. It integrates with a REST backend for CRUD.

## Features
- Sidebar list of notes with create and delete actions
- Editor with title and content; save updates
- URL hash routing: `#/note/{id}` selects a note directly
- Optimistic updates for create, save, and delete with rollback on error
- Non-blocking banner shown if API base URL is missing
- Theming with light/dark toggle

## Environment
Copy `.env.example` to `.env` and set:

- REACT_APP_API_BASE=http://localhost:4000/api

Alternatively, you can use REACT_APP_BACKEND_URL with the same effect.

## Scripts
- npm start
- npm test
- npm run build

## API Contract
Expected endpoints:
- GET /notes -> [{id, title, content}]
- POST /notes -> {id, title, content}
- PUT /notes/:id -> {id, title, content}
- DELETE /notes/:id -> {success:true}
