import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';
import { useQueue } from 'discord-player';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const queue = useQueue(interaction.guildId!);
        
        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ | No music is currently playing!', ephemeral: true });
        }

        queue.node.setPaused(true);
        return interaction.reply({ content: '⏸️ | Paused the player!' });
    }
};

export default command;
