import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { publishDebugRequest, fetchRobloxUser } from '../../utils/robloxApi';

// The ID of the Roblox Universe
const TARGET_UNIVERSE_ID = '8320188188';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Reset the Roblox game server a specific user is currently in.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The Roblox User ID to target')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restricted to Admins
    cooldown: 10,
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        const userId = interaction.options.getString('userid')!;

        // Check if user exists to prevent invalid ID spam
        const robloxUser = await fetchRobloxUser(userId);
        if (!robloxUser) {
            await interaction.editReply(`❌ Could not find a Roblox user with ID \`${userId}\`.`);
            return;
        }

        try {
            const success = await publishDebugRequest(TARGET_UNIVERSE_ID, userId);

            if (success) {
                await interaction.editReply(`✅ Successfully sent a debug request for **${robloxUser.name}** (\`${userId}\`).\nIf they are in-game, their specific server will reset.`);
            } else {
                await interaction.editReply('❌ Failed to send the debug request. Check the console for API errors or verify your ROBLOX_API_KEY and Universe ID.');
            }
        } catch (error) {
            console.error('[debug command error]', error);
            await interaction.editReply('❌ An unexpected error occurred while sending the debug request.');
        }
    }
};

export default command;
