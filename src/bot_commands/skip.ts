import embed from "../embeds/embed";
import { ClientAdapter } from "../util/client_adapter";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the currently playing song')
        .addIntegerOption(option => option
            .setName('to')
            .setDescription('Skips to specific song queue index')
            .setRequired(false)
        )
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildId = interaction.guild?.id!;
        const guildManager = client.guildManagerCollection.get(guildId);

        const skipToOption = interaction.options.getInteger('to', false) ?? 0;

        const skipIndex = skipToOption - 1;
        // Negative index skips to the next song
        if (skipIndex <= 0) {
            var skipped = guildManager?.audioPlayer.skipSong();
        } else {
            var skipped = guildManager?.audioPlayer.skipToSong(skipIndex);
        }

        if (skipped) {
            await interaction.reply(':track_next: Skipped Song');
        } else {
            const iconURL = client.user?.avatarURL()!;
            await interaction.reply({ embeds: [embed.errorOccurred('Skipping song failed, because no song is currently playing', iconURL)] });
        }
    }
}