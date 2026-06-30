import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Command } from '../utils/types';
import { MusicQueue } from '../music/MusicQueue';

export class StarbotClient extends Client {
    public commands: Collection<string, Command>;
    public cooldowns: Collection<string, Collection<string, number>>;
    public queues: Collection<string, MusicQueue>;

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
        this.queues = new Collection();
    }

    getQueue(guildId: string): MusicQueue | undefined {
        return this.queues.get(guildId);
    }

    createQueue(guildId: string): MusicQueue {
        let queue = this.queues.get(guildId);
        if (!queue) {
            queue = new MusicQueue();
            this.queues.set(guildId, queue);
        }
        return queue;
    }

    deleteQueue(guildId: string): void {
        const queue = this.queues.get(guildId);
        if (queue) {
            queue.stop();
            this.queues.delete(guildId);
        }
    }
}
