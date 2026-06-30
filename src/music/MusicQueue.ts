import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
    entersState,
    NoSubscriberBehavior,
} from '@discordjs/voice';
import play from 'play-dl';

export interface QueueTrack {
    title: string;
    url: string;
    duration: string;
    author: string;
}

export class MusicQueue {
    public tracks: QueueTrack[] = [];
    public currentTrack: QueueTrack | null = null;
    public readonly player: AudioPlayer;
    public connection: VoiceConnection | null = null;

    constructor() {
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });

        this.player.on(AudioPlayerStatus.Idle, () => {
            console.log('[Music] Player went idle, processing next track...');
            this.currentTrack = null;
            this.processQueue();
        });

        this.player.on('error', (error) => {
            console.error('[Music] AudioPlayer error:', error.message);
            console.error(error);
            this.currentTrack = null;
            this.processQueue();
        });

        this.player.on('stateChange', (oldState, newState) => {
            console.log(`[Music] AudioPlayer: ${oldState.status} -> ${newState.status}`);
        });
    }

    async connect(channelId: string, guildId: string, adapterCreator: any): Promise<void> {
        this.connection = joinVoiceChannel({
            channelId,
            guildId,
            adapterCreator,
            selfDeaf: false,
        });

        this.connection.subscribe(this.player);

        this.connection.on('stateChange', (oldState, newState) => {
            console.log(`[Music] VoiceConnection: ${oldState.status} -> ${newState.status}`);
        });

        await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
        console.log('[Music] Voice connection ready!');
    }

    addTrack(track: QueueTrack): void {
        this.tracks.push(track);
    }

    async processQueue(): Promise<void> {
        if (this.tracks.length === 0) {
            console.log('[Music] Queue is empty.');
            return;
        }

        const track = this.tracks.shift()!;
        this.currentTrack = track;

        try {
            console.log(`[Music] Streaming: ${track.title} (${track.url})`);
            const stream = await play.stream(track.url);
            console.log(`[Music] Stream obtained, type: ${stream.type}`);

            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
            });
            console.log('[Music] AudioResource created, playing...');

            this.player.play(resource);
        } catch (error: any) {
            console.error(`[Music] Stream error for "${track.title}":`, error.message);
            this.currentTrack = null;
            this.processQueue();
        }
    }

    skip(): void {
        this.player.stop();
    }

    pause(): boolean {
        return this.player.pause();
    }

    resume(): boolean {
        return this.player.unpause();
    }

    stop(): void {
        this.tracks = [];
        this.currentTrack = null;
        this.player.stop(true);
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
    }

    isPlaying(): boolean {
        return this.player.state.status === AudioPlayerStatus.Playing ||
               this.player.state.status === AudioPlayerStatus.Buffering;
    }

    isPaused(): boolean {
        return this.player.state.status === AudioPlayerStatus.Paused;
    }
}
