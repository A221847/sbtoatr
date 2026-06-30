import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const queue = client.getQueue(interaction.guildId!);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ | No music is currently playing!', flags: MessageFlags.Ephemeral });
        }

        queue.pause();
        return interaction.reply({ content: '⏸️ | Paused the player!' });
    }
};

export default command;
