import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { fetchDatastoreEntry, updateDatastoreEntry } from '../../utils/robloxApi';

const TARGET_UNIVERSE_ID = '8320188188'; 
const DATASTORE_NAME = 'Base'; 

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('tools')
        .setDescription('Manage tools for Roblox users directly in the DataStore (Offline support).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Add a tool to a user')
                .addStringOption(option => option.setName('userid').setDescription('Roblox User ID').setRequired(true))
                .addStringOption(option => option.setName('itemid').setDescription('Tool Item ID').setRequired(true))
                .addNumberOption(option => option.setName('qty').setDescription('Quantity to add (default 1)').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Remove a tool from a user')
                .addStringOption(option => option.setName('userid').setDescription('Roblox User ID').setRequired(true))
                .addStringOption(option => option.setName('itemid').setDescription('Tool Item ID').setRequired(true))
                .addNumberOption(option => option.setName('qty').setDescription('Quantity to remove (default 1)').setRequired(false))
        ),
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.options.getString('userid', true);
        const itemId = interaction.options.getString('itemid', true);
        const qty = interaction.options.getNumber('qty') || 1;

        let entryKey = `Player_${userId}`;
        let data = await fetchDatastoreEntry(TARGET_UNIVERSE_ID, DATASTORE_NAME, entryKey);
        
        if (!data) {
            entryKey = `${userId}`;
            data = await fetchDatastoreEntry(TARGET_UNIVERSE_ID, DATASTORE_NAME, entryKey);
        }

        if (!data) {
            return interaction.editReply(`❌ Could not find DataStore data for user ${userId}. Ensure they have joined the game at least once.`);
        }

        // Handle ProfileService format (which wraps user data in a 'Data' object) vs regular table
        let userData = data.Data ? data.Data : data;

        // Ensure the tools array exists
        if (!userData.tools) userData.tools = [];

        const toolsArray = userData.tools as Array<{id: string, qty: number, rarity?: string}>;
        
        const existingToolIndex = toolsArray.findIndex(t => t.id === itemId);

        if (subcommand === 'add') {
            if (existingToolIndex >= 0) {
                toolsArray[existingToolIndex].qty += qty;
            } else {
                toolsArray.push({ id: itemId, qty: qty, rarity: 'common' });
            }
        } else if (subcommand === 'remove') {
            if (existingToolIndex === -1) {
                return interaction.editReply(`⚠️ The user does not have **${itemId}** in their inventory.`);
            }
            toolsArray[existingToolIndex].qty -= qty;
            if (toolsArray[existingToolIndex].qty <= 0) {
                toolsArray.splice(existingToolIndex, 1);
            }
        }

        // Save the modified data back to the DataStore
        const success = await updateDatastoreEntry(TARGET_UNIVERSE_ID, DATASTORE_NAME, entryKey, data);

        if (success) {
            interaction.editReply(`✅ Successfully **${subcommand === 'add' ? 'added' : 'removed'}** ${qty}x **${itemId}** for user **${userId}**.`);
        } else {
            interaction.editReply(`❌ Failed to save the data to Roblox. Check your ROBLOX_API_KEY permissions for DataStores.`);
        }
    }
};

export default command;
