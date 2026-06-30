import { config } from 'dotenv';
import { StarbotClient } from './client/StarbotClient';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';
import play from 'play-dl';
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

async function main() {
    const client = new StarbotClient();

    // Load handlers
    loadCommands(client);
    loadEvents(client);

    // Initialize play-dl with a free SoundCloud client ID
    const clientID = await play.getFreeClientID();
    await play.setToken({
        soundcloud: {
            client_id: clientID
        }
    });
    console.log('[Music] SoundCloud client ID initialized.');

    // Log in to Discord
    await client.login(process.env.DISCORD_TOKEN);
    console.log('[Bot] Starbot is online!');
}

main().catch(err => {
    console.error('[Fatal] Failed to start Starbot:', err);
    process.exit(1);
});
