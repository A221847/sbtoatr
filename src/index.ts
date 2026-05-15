import { config } from 'dotenv';
import { StarbotClient } from './client/StarbotClient';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';
import express from 'express';

// Load environment variables from .env file
config();

// Create a dummy Express web server so Render.com detects it as a Web Service
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Starbot is awake and running!');
});

app.listen(port, () => {
    console.log(`[Web] Dummy web server is listening on port ${port}`);
});

const client = new StarbotClient();

// Load handlers
loadCommands(client);
loadEvents(client);

// Log in to Discord
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('[Error] Failed to login. Please check your DISCORD_TOKEN in .env', err);
});
