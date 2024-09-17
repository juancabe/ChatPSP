# ChatPSP

## Overview

ChatPSP is a simple web-based chat application where users can register, log in, and chat with others in real-time. It is built using React for the frontend and C++ (with SQLite) for the backend, with communication between the frontend and backend over HTTPS. The app enables user authentication and real-time messaging with periodic message fetching.

## Features

- User Registration: Users can create an account with a username and password.
- User Login: Users can log in to the chat system, and their session is maintained during the interaction.
- Real-Time Chat: After logging in, users can send and receive messages in real time. Messages are updated every second.
- Message Persistence: Messages are stored in the backend using a list and can be fetched by users.
- User Authentication: The backend securely handles user registration, login, and message sending.

## Technologies Used

- Frontend:
  - React (with TypeScript)
  - CSS for styling
- Backend:
  - C++ (with SQLite3 for database storage)
  - HTTP/HTTPS server (using httplib library with OpenSSL for HTTPS support)

## Installation

### Backend

- ```js
  $ git clone https://github.com/juancabe/ChatPSP
  $ cd ./ChatPSP/server/
  $ make
  ```
- Make sure you have installed sqlite3 and openssl on your system.
- And run server `main`; don't forget to provide your own SSH certificate.

### Frontend

- ```js
  $ npm install
  $ npm run dev
  ```
- The frontend should now be available at http://localhost:5173

## Usage

### User Authentication

- Registration:
  - A new user can create an account by providing a username and password.
  - If the username already exists, an error message is displayed.
- Login:
  - Users can log in with valid credentials. If the username does not exist or the password is incorrect, an error message is shown.

### Chat

After login, users can send and receive messages in real time.
Messages are updated every second using setInterval in the frontend.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.
