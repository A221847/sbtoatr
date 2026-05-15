import { readdirSync } from 'fs';
import { join } from 'path';
import { StarbotClient } from '../client/StarbotClient';
import { Event } from '../utils/types';

export const loadEvents = (client: StarbotClient) => {
    const eventsPath = join(__dirname, '../events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event: Event = require(filePath).default;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`[Event Handler] Loaded event: ${event.name}`);
    }
};
