import embed from "../embeds/embed";
import { ClientAdapter } from "../util/client_adapter";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the currently playing song')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildManager = client.guildManagerCollection.get(interaction.guild?.id!);

        const skipped = guildManager?.audioPlayer.skipSong();

        if (skipped) {
            await interaction.reply('Skipped song');
        } else {
            const iconURL = client.user?.avatarURL()!;
            await interaction.reply({ embeds: [embed.errorOccurred('Skipping song failed, because no song is currently playing', iconURL)] });
        }
    }
}