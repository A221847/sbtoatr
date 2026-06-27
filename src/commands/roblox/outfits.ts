import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../utils/types';
import { StarbotClient } from '../../client/StarbotClient';
import { fetchDatastoreEntry, updateDatastoreEntry } from '../../utils/robloxApi';

// You might need to adjust these if your universe or datastore name is different
const TARGET_UNIVERSE_ID = '8320188188'; 
const DATASTORE_NAME = 'Base'; // Matches profileStoreIndex = "Base"

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('outfits')
        .setDescription('Manage outfits for Roblox users directly in the DataStore (Offline support).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Add an outfit to a user')
                .addStringOption(option => option.setName('userid').setDescription('Roblox User ID').setRequired(true))
                .addStringOption(option => option.setName('char').setDescription('Character Key (e.g. aelita)').setRequired(true))
                .addStringOption(option => option.setName('zone').setDescription('Zone (e.g. earth)').setRequired(true))
                .addStringOption(option => option.setName('outfit').setDescription('Outfit Key (e.g. season2)').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Remove an outfit from a user')
                .addStringOption(option => option.setName('userid').setDescription('Roblox User ID').setRequired(true))
                .addStringOption(option => option.setName('char').setDescription('Character Key (e.g. aelita)').setRequired(true))
                .addStringOption(option => option.setName('zone').setDescription('Zone (e.g. earth)').setRequired(true))
                .addStringOption(option => option.setName('outfit').setDescription('Outfit Key (e.g. season2)').setRequired(true))
        ),
    async execute(interaction: ChatInputCommandInteraction, client: StarbotClient) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.options.getString('userid', true);
        const charKey = interaction.options.getString('char', true);
        const zone = interaction.options.getString('zone', true);
        const outfitKey = interaction.options.getString('outfit', true);

        // Try both common DataStore key patterns ProfileService and standard scripts use
        let entryKey = `Player_${userId}`;
        let data = await fetchDatastoreEntry(TARGET_UNIVERSE_ID, DATASTORE_NAME, entryKey);
        
        if (!data) {
            entryKey = `${userId}`;
            data = await fetchDatastoreEntry(TARGET_UNIVERSE_ID, DATASTORE_NAME, entryKey);
        }

        if (!data) {
            return interaction.editReply(`❌ Could not find DataStore data for user ${userId}. Ensure they have joined the game at least once and the DataStore name is '${DATASTORE_NAME}'.`);
        }

        // Handle ProfileService format (which wraps user data in a 'Data' object) vs regular table
        let userData = data.Data ? data.Data : data;

        // Ensure the nested structure exists to avoid errors
        if (!userData.characters) userData.characters = {};
        if (!userData.characters[charKey]) userData.characters[charKey] = { outfits: {} };
        if (!userData.characters[charKey].outfits) userData.characters[charKey].outfits = {};
        if (!userData.characters[charKey].outfits[zone]) userData.characters[charKey].outfits[zone] = { owned: [] };
        if (!userData.characters[charKey].outfits[zone].owned) userData.characters[charKey].outfits[zone].owned = [];

        const ownedArray = userData.characters[charKey].outfits[zone].owned;
        const exists = ownedArray.includes(outfitKey);

        if (subcommand === 'add') {
            if (exists) {
                return interaction.editReply(`⚠️ The user already owns **${outfitKey}** for **${charKey}** in **${zone}**.`);
            }
            ownedArray.push(outfitKey);
        } else if (subcommand === 'remove') {
            if (!exists) {
                return interaction.editReply(`⚠️ The user does not own **${outfitKey}** for **${charKey}** in **${zone}**.`);
            }
            const index = ownedArray.indexOf(outfitKey);
            ownedArray.splice(index, 1);
        }

        // Save the modified data back to the DataStore
        const success = await updateDatastoreEntry(TARGET_UNIVERSE_ID, DATASTORE_NAME, entryKey, data);

        if (success) {
            interaction.editReply(`✅ Successfully **${subcommand === 'add' ? 'added' : 'removed'}** the outfit **${outfitKey}** for user **${userId}**.`);
        } else {
            interaction.editReply(`❌ Failed to save the data to Roblox. Check your ROBLOX_API_KEY permissions for DataStores.`);
        }
    }
};

export default command;
