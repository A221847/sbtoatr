import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { StarbotClient } from '../client/StarbotClient';

export interface Command {
    data: SlashCommandBuilder | any; // Supports all builder variations (OptionsOnly, SubcommandsOnly)
    cooldown?: number; // Cooldown in seconds
    execute: (interaction: ChatInputCommandInteraction, client: StarbotClient) => Promise<any>;
}

export interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => void | Promise<void>;
}
