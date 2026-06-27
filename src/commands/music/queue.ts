import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';
import { useQueue } from 'discord-player';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const queue = useQueue(interaction.guildId!);
        
        if (!queue || queue.tracks.size === 0) {
            return interaction.reply({ content: '❌ | The queue is empty!', ephemeral: true });
        }

        const tracks = queue.tracks.toArray().slice(0, 10).map((track, i) => {
            return `${i + 1}. **${track.title}** - ${track.author}`;
        });

        const currentTrack = queue.currentTrack;
        const current = currentTrack ? `🎶 | **Currently Playing:**\n${currentTrack.title} - ${currentTrack.author}\n\n` : '';

        return interaction.reply({ content: `${current}📜 | **Up Next:**\n${tracks.join('\n')}` });
    }
};

export default command;
