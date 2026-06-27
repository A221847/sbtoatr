import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
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
        this.player.extractors.loadMulti(DefaultExtractors);
    }
}
