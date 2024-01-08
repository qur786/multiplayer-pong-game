# Multiroom Pong Game

This is a Node.js application that hosts a multiplayer Pong game using Express.js and Socket.io. Players can compete in different game rooms, interacting in real-time through the server.

## Technologies Used

- **Express.js:** Used to set up the server and handle routing.
- **Socket.io:** Facilitates real-time communication between the server and clients.
- **EJS Templates:** Renders HTML for the game interface via Express.js.

## Features

1. **Multiplayer Functionality:** Players can compete against each other in game rooms.
2. **Real-time Communication:** Socket.io enables instant updates of paddle and ball movements between players.
3. **Game Referee:** One player assumes the role of the referee, managing the game's score and ball position.
4. **Scoring System:** The game ends when one player reaches a maximum score of 5, determining the winner.

## Usage

1. **Installation:** Clone the repository and install dependencies using `yarn install`.
2. **Run:** Start the server using `yarn start`.
3. **Access:** Visit the application in your browser at `http://localhost:3000`.
4. **Gameplay:** Enter a game room and play against another player.

## Project Structure

- **`/src/public`:** Contains frontend files (EJS, CSS, and JS) for the game interface.
- **`/src`:** Server-side code, including Socket.io logic and game room management.

## How It Works

1. Players join the game, entering a room to play against another participant.
2. Socket.io enables real-time communication for paddle and ball movements.
3. The referee manages the game's score and ball position, updating all players via the server.
4. The game ends when a player reaches the maximum score of 5, declaring the winner.

## Contributions

Contributions to enhance the game's features or fix issues are welcome! Fork the repository, create a branch, make changes, and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
