import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { fetchRobloxUser, fetchRobloxThumbnail, checkStarlityMembership } from '../../utils/robloxApi';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('whois')
        .setDescription('Lookup a Roblox user and check their Starlity Studios membership.')
        .addStringOption(option => 
            option.setName('roblox_id')
                .setDescription('The Roblox User ID to lookup')
                .setRequired(true)
        ),
    cooldown: 5,
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        const userId = interaction.options.getString('roblox_id')!;

        // Check if userId is a valid number
        if (!/^\d+$/.test(userId)) {
            await interaction.editReply('Please provide a valid Roblox User ID (numbers only).');
            return;
        }

        try {
            const [userInfo, thumbnailUrl, starlityMembership] = await Promise.all([
                fetchRobloxUser(userId),
                fetchRobloxThumbnail(userId),
                checkStarlityMembership(userId)
            ]);

            if (!userInfo) {
                await interaction.editReply(`Could not find a Roblox user with ID \`${userId}\`.`);
                return;
            }

            const createdDate = new Date(userInfo.created);
            const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

            const embed = new EmbedBuilder()
                .setTitle(`${userInfo.displayName} (@${userInfo.name})`)
                .setURL(`https://www.roblox.com/users/${userInfo.id}/profile`)
                .setColor(starlityMembership ? '#00FF00' : '#FF0000') // Green if in group, red if not
                .addFields(
                    { name: 'User ID', value: `${userInfo.id}`, inline: true },
                    { name: 'Account Age', value: `${accountAgeDays} days`, inline: true },
                    { name: 'Creation Date', value: `<t:${Math.floor(createdDate.getTime() / 1000)}:D>`, inline: true },
                    { 
                        name: 'Starlity Studios Member?', 
                        value: starlityMembership 
                            ? `✅ Yes (Rank: ${starlityMembership.role.name})` 
                            : '❌ No',
                        inline: false
                    }
                )
                .setFooter({ text: 'Starbot • Starlity Studios' })
                .setTimestamp();

            if (thumbnailUrl) {
                embed.setThumbnail(thumbnailUrl);
            }

            if (userInfo.isBanned) {
                embed.addFields({ name: 'Account Status', value: '🚨 Banned', inline: false });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[whois command]', error);
            await interaction.editReply('An error occurred while fetching data from the Roblox API.');
        }
    }
};

export default command;
