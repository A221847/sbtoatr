import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Command } from '../utils/types';

export class StarbotClient extends Client {
    public commands: Collection<string, Command>;
    public cooldowns: Collection<string, Collection<string, number>>;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ],
        });

        this.commands = new Collection();
        this.cooldowns = new Collection();
    }
}
