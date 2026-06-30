import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playing and leave the voice channel'),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const queue = client.getQueue(interaction.guildId!);

        if (!queue) {
            return interaction.reply({ content: '❌ | No music is currently playing!', flags: MessageFlags.Ephemeral });
        }

        client.deleteQueue(interaction.guildId!);
        return interaction.reply({ content: '🛑 | Stopped the player and cleared the queue!' });
    }
};

export default command;
