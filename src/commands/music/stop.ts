import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';
import { useQueue } from 'discord-player';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playing and leave the voice channel'),
    execute: async (interaction: ChatInputCommandInteraction, client: StarbotClient) => {
        const queue = useQueue(interaction.guildId!);
        
        if (!queue) {
            return interaction.reply({ content: '❌ | No music is currently playing!', ephemeral: true });
        }

        queue.delete();
        return interaction.reply({ content: '🛑 | Stopped the player and cleared the queue!' });
    }
};

export default command;
