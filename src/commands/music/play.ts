import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember, MessageFlags } from 'discord.js';
import { StarbotClient } from '../../client/StarbotClient';
import { Command } from '../../utils/types';

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
            await interaction.reply({ content: 'You must be in a voice channel to play music!', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        try {
            const { track } = await client.player.play(channel, query, {
                searchEngine: 'soundcloudSearch',
                nodeOptions: {
                    metadata: interaction,
                    selfDeaf: false,
                    leaveOnEmpty: false,
                    leaveOnEnd: false,
                    leaveOnStop: false,
                }
            });

            await interaction.followUp(`🎶 | Added **${track.title}** to the queue!`);
        } catch (error) {
            console.error('Error playing track:', error);
            await interaction.followUp('❌ | Something went wrong while trying to play the track.');
        }
    }
};

export default command;
