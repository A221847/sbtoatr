import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';
import { useQueue } from 'discord-player';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const queue = useQueue(interaction.guildId!);
        
        if (!queue || !queue.node.isPaused()) {
            return interaction.reply({ content: '❌ | The player is not paused!', ephemeral: true });
        }

        queue.node.setPaused(false);
        return interaction.reply({ content: '▶️ | Resumed the player!' });
    }
};

export default command;
