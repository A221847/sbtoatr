# Starbot 🌟

Starbot is a custom Discord bot built specifically for the **Starlity Studios** Roblox game development community.

## Features

- **`/whois [Roblox ID]`**: Fetches a Roblox user's profile information, avatar thumbnail, and verifies their membership status within the Starlity Studios Roblox group (ID: 323678018).
- **Scalable Architecture**: Built with `discord.js` v14 and TypeScript, featuring dynamic command and event handlers to easily add new functionality in the future.
- **Built-in Cooldowns**: Prevents API abuse with a command-specific cooldown system.
- **Moderation Scaffolding**: Includes a basic `/warn` command ready to be hooked up to a database.

## Setup Instructions

1. **Prerequisites**: Ensure you have Node.js (v16.16.0 or higher) installed.
2. **Install Dependencies**: Run `npm install` in the project directory.
3. **Configure Environment Variables**:
   - Copy the `.env.example` file and rename it to `.env`.
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications), create your bot, and copy its Token.
   - Paste the Token into the `.env` file (`DISCORD_TOKEN=your_token_here`).
4. **Development Mode**: Run `npm run dev` to start the bot with hot-reloading (using `nodemon`). The bot will automatically register its slash commands globally when it starts.
5. **Production Build**: Run `npm run build` to compile the TypeScript code, then run `npm start` to start the production version.

## Project Structure

- `src/index.ts`: The main entry point.
- `src/client/StarbotClient.ts`: Extended Discord Client.
- `src/handlers/`: Dynamic loaders for commands and events.
- `src/commands/`: All slash commands, organized by category.
- `src/events/`: Discord event listeners (`ready`, `interactionCreate`).
- `src/utils/`: Utility functions like the `robloxApi` wrapper and type definitions.
- `src/database/`: Reserved folder for future database integrations.
