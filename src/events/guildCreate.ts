import { Events, Guild } from 'discord.js';
import { Event } from '../utils/types';
import { StarbotClient } from '../client/StarbotClient';

const ALLOWED_GUILDS = ['1408463520437371052', '799313727551176754'];

const event: Event = {
    name: Events.GuildCreate,
    async execute(guild: Guild, client: StarbotClient) {
        if (!ALLOWED_GUILDS.includes(guild.id)) {
            console.log(`[GuildCreate] Joined unauthorized guild: ${guild.name} (${guild.id}). Leaving immediately.`);
            try {
                await guild.leave();
            } catch (error) {
                console.error(`[GuildCreate Error] Failed to leave unauthorized guild ${guild.id}:`, error);
            }
        } else {
            console.log(`[GuildCreate] Joined authorized guild: ${guild.name} (${guild.id}).`);
        }
    },
};

export default event;
