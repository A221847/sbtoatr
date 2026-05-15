import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { unbanUserInDatastore, fetchRobloxUser } from '../../utils/robloxApi';

// We use the same Universe ID from the ban command
const TARGET_UNIVERSE_ID = '8320188188';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gameunban')
        .setDescription('Unban a Roblox user from the game.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The Roblox User ID to unban')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Restricted to admins/mods
    cooldown: 5,
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        const userId = interaction.options.getString('userid')!;

        // Check if user exists
        const robloxUser = await fetchRobloxUser(userId);
        if (!robloxUser) {
            await interaction.editReply(`❌ Could not find a Roblox user with ID \`${userId}\`.`);
            return;
        }

        try {
            const success = await unbanUserInDatastore(TARGET_UNIVERSE_ID, userId);

            if (success) {
                await interaction.editReply(`✅ Successfully unbanned **${robloxUser.name}** (\`${userId}\`) from the game.`);
            } else {
                await interaction.editReply('❌ Failed to unban the user. They might not be banned, or the API key lacks Data Store Delete permissions.');
            }
        } catch (error) {
            console.error('[gameunban command error]', error);
            await interaction.editReply('❌ An unexpected error occurred while unbanning the user.');
        }
    }
};

export default command;
