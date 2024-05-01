import { GuildManager } from "./guild_manager";

import { ChatInputCommandInteraction, Client, Collection, SlashCommandBuilder } from "discord.js";

export interface CommandExecutor {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): void;
}

export class ClientAdapter extends Client {
    public commandCollection: Collection<string, CommandExecutor> = new Collection();
    public guildManagerCollection: Collection<string, GuildManager> = new Collection();
}