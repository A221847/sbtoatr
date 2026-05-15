import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { publishPrivateAnnouncement, fetchRobloxUser } from '../../utils/robloxApi';

const TARGET_UNIVERSE_ID = '8320188188';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('privateplayerannouncement')
        .setDescription('Send an announcement ONLY to a specific player.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The Roblox User ID to notify')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The message to send them')
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
            // isServerWide = false (announce ONLY to the player)
            const success = await publishPrivateAnnouncement(TARGET_UNIVERSE_ID, userId, message, false);

            if (success) {
                await interaction.editReply(`✅ Successfully sent a private message to **${robloxUser.name}** (\`${userId}\`).\nIf they are in-game, only they will see:\n"${message}"`);
            } else {
                await interaction.editReply('❌ Failed to send the message. Check the console for API errors.');
            }
        } catch (error) {
            console.error('[privateplayerannouncement command error]', error);
            await interaction.editReply('❌ An unexpected error occurred while sending the message.');
        }
    }
};

export default command;
