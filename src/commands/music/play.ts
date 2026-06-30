import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember, MessageFlags } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';
import { QueueTrack } from '../../music/MusicQueue';
import play from 'play-dl';

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song in your voice channel')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song URL or search query')
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const query = interaction.options.getString('query', true);
        const member = interaction.member as GuildMember;
        const channel = member.voice.channel;

        if (!channel) {
            await interaction.reply({ content: '❌ | You must be in a voice channel to play music!', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        try {
            // Search SoundCloud for the track
            console.log(`[Music] Searching SoundCloud for: ${query}`);
            const results = await play.search(query, { source: { soundcloud: 'tracks' } });

            if (!results || results.length === 0) {
                await interaction.followUp('❌ | No results found!');
                return;
            }

            const sc = results[0] as any;
            const track: QueueTrack = {
                title: sc.name || sc.title || 'Unknown',
                url: sc.url,
                duration: formatDuration(sc.durationInSec || 0),
                author: sc.user?.name || sc.artist?.name || 'Unknown',
            };

            console.log(`[Music] Found track: ${track.title} by ${track.author} (${track.url})`);

            // Get or create queue for this guild
            let queue = client.getQueue(interaction.guildId!);
            const needsConnection = !queue || !queue.connection;

            if (needsConnection) {
                queue = client.createQueue(interaction.guildId!);
                await queue.connect(channel.id, interaction.guildId!, interaction.guild!.voiceAdapterCreator);
            }

            queue!.addTrack(track);
            await interaction.followUp(`🎶 | Added **${track.title}** by **${track.author}** [${track.duration}] to the queue!`);

            // If nothing is currently playing, start playing
            if (!queue!.isPlaying() && !queue!.isPaused()) {
                await queue!.processQueue();
            }
        } catch (error: any) {
            console.error('[Music] Error in play command:', error);
            await interaction.followUp('❌ | Something went wrong while trying to play the track.');
        }
    }
};

export default command;
