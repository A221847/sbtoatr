import { config } from 'dotenv';
import { StarbotClient } from './client/StarbotClient';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';

// Load environment variables from .env file
config();

const client = new StarbotClient();

// Load handlers
loadCommands(client);
loadEvents(client);

// Log in to Discord
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('[Error] Failed to login. Please check your DISCORD_TOKEN in .env', err);
});
