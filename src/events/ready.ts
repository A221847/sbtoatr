import { Events, REST, Routes } from 'discord.js';
import { Event } from '../utils/types';
import { StarbotClient } from '../client/StarbotClient';

const event: Event = {
    name: Events.ClientReady,
    once: true,
    async execute(client: StarbotClient) {
        console.log(`[Ready] Logged in as ${client.user?.tag}`);

        const ALLOWED_GUILDS = ['1408463520437371052', '799313727551176754'];

        // Leave unauthorized guilds
        for (const guild of client.guilds.cache.values()) {
            if (!ALLOWED_GUILDS.includes(guild.id)) {
                console.log(`[Ready] Leaving unauthorized guild: ${guild.name} (${guild.id})`);
                try {
                    await guild.leave();
                } catch (e) {
                    console.error(`[Ready Error] Failed to leave unauthorized guild ${guild.id}:`, e);
                }
            }
        }

        // Register slash commands
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        
        try {
            const commandData = client.commands.map(cmd => cmd.data.toJSON());
            console.log(`[Ready] Started refreshing ${commandData.length} application (/) commands.`);

            // Clear global commands to prevent duplicates
            await rest.put(
                Routes.applicationCommands(client.user!.id),
                { body: [] },
            );
            console.log(`[Ready] Successfully cleared global commands.`);

            // Register commands to all allowed guilds the bot is currently in
            const guilds = client.guilds.cache
                .filter(guild => ALLOWED_GUILDS.includes(guild.id))
                .map(guild => guild.id);
                
            for (const guildId of guilds) {
                await rest.put(
                    Routes.applicationGuildCommands(client.user!.id, guildId),
                    { body: commandData },
                );
                console.log(`[Ready] Successfully reloaded application (/) commands for guild ${guildId}.`);
            }
        } catch (error) {
            console.error('[Ready Error]', error);
        }
    },
};

export default event;
