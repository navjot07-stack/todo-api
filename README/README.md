# Collaborative To-Do List REST API

A RESTful API for managing tasks in a collaborative To-Do List application.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv

## Project Features

- Create new tasks
- Retrieve all tasks
- Filter tasks by completion status
- Retrieve an individual task
- Update existing tasks
- Delete tasks
- Request validation
- HTTP status code handling
- Global error handling
- Persistent MongoDB storage

## Environment Setup

Create a `.env` file in the root directory of the project.

Add the following environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string