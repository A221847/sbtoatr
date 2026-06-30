import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const queue = client.getQueue(interaction.guildId!);

        if (!queue) {
            return interaction.reply({ content: '❌ | The queue is empty!', flags: MessageFlags.Ephemeral });
        }

        const tracks = queue.tracks.slice(0, 10).map((track, i) => {
            return `${i + 1}. **${track.title}** - ${track.author} [${track.duration}]`;
        });

        const current = queue.currentTrack
            ? `🎶 | **Currently Playing:**\n${queue.currentTrack.title} - ${queue.currentTrack.author} [${queue.currentTrack.duration}]\n\n`
            : '';

        const upNext = tracks.length > 0
            ? `📜 | **Up Next:**\n${tracks.join('\n')}`
            : '📜 | No more tracks in queue.';

        return interaction.reply({ content: `${current}${upNext}` });
    }
};

export default command;
