import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { publishPrivateAnnouncement, fetchRobloxUser } from '../../utils/robloxApi';

const TARGET_UNIVERSE_ID = '8320188188';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('privateserverannouncement')
        .setDescription('Send an announcement to the specific server where a target user is playing.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The Roblox User ID to locate')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The message to announce to their server')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restricted to Admins
    cooldown: 10,
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        const userId = interaction.options.getString('userid')!;
        const message = interaction.options.getString('message')!;

        // Check if user exists
        const robloxUser = await fetchRobloxUser(userId);
        if (!robloxUser) {
            await interaction.editReply(`❌ Could not find a Roblox user with ID \`${userId}\`.`);
            return;
        }

        try {
            // isServerWide = true (announce to everyone in that server)
            const success = await publishPrivateAnnouncement(TARGET_UNIVERSE_ID, userId, message, true);

            if (success) {
                await interaction.editReply(`✅ Successfully sent the server announcement targeting **${robloxUser.name}** (\`${userId}\`).\nIf they are in-game, their entire server will see the message:\n"${message}"`);
            } else {
                await interaction.editReply('❌ Failed to send the announcement. Check the console for API errors.');
            }
        } catch (error) {
            console.error('[privateserverannouncement command error]', error);
            await interaction.editReply('❌ An unexpected error occurred while sending the announcement.');
        }
    }
};

export default command;
