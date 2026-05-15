import { readdirSync } from 'fs';
import { join } from 'path';
import { StarbotClient } from '../client/StarbotClient';
import { Command } from '../utils/types';

export const loadCommands = (client: StarbotClient) => {
    const commandsPath = join(__dirname, '../commands');
    
    // Read category folders inside src/commands
    const commandFolders = readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const categoryPath = join(commandsPath, folder);
        // Only look at .ts or .js files
        const commandFiles = readdirSync(categoryPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = join(categoryPath, file);
            const command: Command = require(filePath).default;

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`[Command Handler] Loaded command: ${command.data.name}`);
            } else {
                console.warn(`[Command Handler] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
};
