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

        // ---- Player lifecycle events ----

        this.player.events.on('playerStart', (queue, track) => {
            console.log(`[Player] Now playing: ${track.title}`);
            console.log(`[Player] Track source: ${track.source}`);
            console.log(`[Player] Track URL: ${track.url}`);
            console.log(`[Player] Track duration: ${track.duration}`);
        });

        this.player.events.on('audioTrackAdd', (queue, track) => {
            console.log(`[Player] Track added to queue: ${track.title}`);
        });

        this.player.events.on('playerFinish', (queue, track) => {
            console.log(`[Player] Finished playing: ${track.title}`);
        });

        this.player.events.on('playerSkip', (queue, track) => {
            console.log(`[Player] SKIPPED track: ${track.title} (reason: stream could not be extracted or played)`);
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

        // Full debug output (unfiltered) to catch streaming issues
        this.player.on('debug', (message) => {
            console.log(`[Player Debug] ${message}`);
        });
    }
}
