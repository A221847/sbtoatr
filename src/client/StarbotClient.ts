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

        // Debug events
        this.player.events.on('playerStart', (queue, track) => {
            console.log(`[Player] Now playing: ${track.title}`);
        });

        this.player.events.on('audioTrackAdd', (queue, track) => {
            console.log(`[Player] Track added to queue: ${track.title}`);
        });

        this.player.events.on('error', (queue, error) => {
            console.error(`[Player Error] General error: ${error.message}`);
            console.error(error);
        });

        this.player.events.on('playerError', (queue, error, track) => {
            console.error(`[Player Error] Audio error on "${track?.title}": ${error.message}`);
            console.error(error);
        });
        
        this.player.events.on('disconnect', (queue) => {
            console.log(`[Player] Disconnected from voice channel.`);
        });

        this.player.events.on('emptyQueue', (queue) => {
            console.log(`[Player] Queue finished / empty.`);
        });

        this.player.events.on('emptyChannel', (queue) => {
            console.log(`[Player] Voice channel is empty, leaving.`);
        });

        this.player.on('debug', (message) => {
            if (message.toLowerCase().includes('error') || message.toLowerCase().includes('fail')) {
                console.log(`[Player Debug] ${message}`);
            }
        });
    }
}

