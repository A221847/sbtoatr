import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { publishAnnouncement } from '../../utils/robloxApi';

// The ID of the Roblox Universe where the message will be broadcast.
// The ID of the Roblox Universe where the message will be broadcast.
// The MessagingService API STRICTLY requires the Universe ID, not the Place ID.
// Your Place ID (101551001467878) maps to the Universe ID below:
const TARGET_UNIVERSE_ID = '8320188188'; 

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send an announcement to all active Roblox game servers.')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The message to announce in-game')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restricted to Admins to prevent abuse
    cooldown: 10,
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        const message = interaction.options.getString('message')!;

        try {
            const success = await publishAnnouncement(TARGET_UNIVERSE_ID, message);

            if (success) {
                await interaction.editReply(`✅ Successfully broadcasted the announcement to the Roblox servers!\n**Message:** "${message}"`);
            } else {
                await interaction.editReply('❌ Failed to send the announcement. Check the console for API errors or verify your ROBLOX_API_KEY and Universe ID.');
            }
        } catch (error) {
            console.error('[announce command error]', error);
            await interaction.editReply('❌ An unexpected error occurred while sending the announcement.');
        }
    }
};

export default command;
