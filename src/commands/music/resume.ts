import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const queue = client.getQueue(interaction.guildId!);

        if (!queue || !queue.isPaused()) {
            return interaction.reply({ content: '❌ | The player is not paused!', flags: MessageFlags.Ephemeral });
        }

        queue.resume();
        return interaction.reply({ content: '▶️ | Resumed the player!' });
    }
};

export default command;
