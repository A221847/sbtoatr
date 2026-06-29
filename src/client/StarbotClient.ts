import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Player } from 'discord-player';
import { Command } from '../utils/types';

export class StarbotClient extends Client {
    public commands: Collection<string, Command>;
    public cooldowns: Collection<string, Collection<string, number>>;
    public player: Player;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
            ],
        });

        this.commands = new Collection();
        this.cooldowns = new Collection();
        
        this.player = new Player(this);

        // Debugging player errors
        this.player.events.on('error', (queue, error) => {
            console.error(`[Player Error] General error in queue: ${error.message}`);
        });

        this.player.events.on('playerError', (queue, error) => {
            console.error(`[Player Error] Audio player error: ${error.message}`);
        });
        
        this.player.events.on('disconnect', (queue) => {
            console.log(`[Player] Disconnected from voice channel.`);
        });
    }
}
