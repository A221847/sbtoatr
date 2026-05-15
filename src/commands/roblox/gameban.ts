import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { banUserInDatastore, fetchRobloxUser } from '../../utils/robloxApi';

// The ID of the Roblox Universe
// We can use the same Universe ID from announce command
const TARGET_UNIVERSE_ID = '8320188188';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gameban')
        .setDescription('Ban a Roblox user from the game.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The Roblox User ID to ban')
                .setRequired(true)
        )
        .addNumberOption(option => 
            option.setName('duration')
                .setDescription('Duration of the ban in hours')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Restricted to admins/mods
    cooldown: 5,
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        const userId = interaction.options.getString('userid')!;
        const duration = interaction.options.getNumber('duration')!;
        const reason = interaction.options.getString('reason') || 'No reason';

        // Check if user exists
        const robloxUser = await fetchRobloxUser(userId);
        if (!robloxUser) {
            await interaction.editReply(`❌ Could not find a Roblox user with ID \`${userId}\`.`);
            return;
        }

        try {
            const success = await banUserInDatastore(TARGET_UNIVERSE_ID, userId, reason, duration);

            if (success) {
                await interaction.editReply(`✅ Successfully banned **${robloxUser.name}** (\`${userId}\`) for **${duration} hours**.\n**Reason:** ${reason}`);
            } else {
                await interaction.editReply('❌ Failed to ban the user. Check the console for API errors or verify your ROBLOX_API_KEY and Universe ID.');
            }
        } catch (error) {
            console.error('[gameban command error]', error);
            await interaction.editReply('❌ An unexpected error occurred while banning the user.');
        }
    }
};

export default command;
