import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { fetchGameServers } from '../../utils/robloxApi';

const TARGET_PLACE_ID = '101551001467878';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gamestatus')
        .setDescription('Check the active public servers for the game.'),
    cooldown: 5,
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        try {
            const servers = await fetchGameServers(TARGET_PLACE_ID);

            if (servers.length === 0) {
                await interaction.editReply('There are currently no active public servers for the game (or the game might be private/restricted).');
                return;
            }

            // Calculate totals
            const totalPlayers = servers.reduce((acc, server) => acc + server.playing, 0);

            const embed = new EmbedBuilder()
                .setTitle('🎮 Game Server Status')
                .setColor('#0099ff')
                .setDescription(`Found **${servers.length}** active public server(s) with a total of **${totalPlayers}** players.`)
                .setURL(`https://www.roblox.com/games/${TARGET_PLACE_ID}`)
                .setTimestamp()
                .setFooter({ text: 'Starbot • Game Status' });

            // Discord fields limit is 25, so we slice just in case there are too many servers
            const displayServers = servers.slice(0, 25);
            
            for (let i = 0; i < displayServers.length; i++) {
                const server = displayServers[i];
                embed.addFields({
                    name: `Server ${i + 1}`,
                    value: `👥 Players: ${server.playing}/${server.maxPlayers}\n📶 Ping: ${server.ping}ms\n📺 FPS: ${Math.round(server.fps)}`,
                    inline: true
                });
            }

            if (servers.length > 25) {
                embed.addFields({
                    name: `...and ${servers.length - 25} more servers`,
                    value: '*(Displaying top 25 only)*',
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('[gamestatus command]', error);
            await interaction.editReply('An error occurred while fetching the game status.');
        }
    }
};

export default command;
