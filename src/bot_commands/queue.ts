import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ClientAdapter } from "../util/client_adapter";
import { getGuildLogger } from "../setup/logging";
import embed from "../embeds/embed";
import { queuePageButtons } from "../embeds/show_queue";


export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Information about songs in queue')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as ClientAdapter;
        const guildId = interaction.guild?.id!;
        const guildManager = client.guildManagerCollection.get(guildId)!;

        const logger = getGuildLogger(guildId);

        const clientIconUrl = client.user?.avatarURL()!;

        if (!guildManager.audioPlayer.isPlaying()) {
            logger.warn('Showing song queue information failed because no song is playing ');
            await interaction.reply({ embeds: [embed.errorOccurred('No songs in the queue', clientIconUrl)] });
            return;
        }

        const maxPages = Math.ceil(guildManager.audioPlayer.getSongQueue().length / 10);
        const rowButtons = queuePageButtons();

        var currentPage = 1;
        logger.info(`Listing song queue to use, songs in queue: ${guildManager.audioPlayer.getSongQueue().length}`)
        const response = await interaction.reply({ embeds: [embed.showQueue(guildManager, currentPage, clientIconUrl)], components: (maxPages === 0 || maxPages === 1) ? [] : [rowButtons] });

        const buttonCollector = response.createMessageComponentCollector({
            dispose: true,
            time: 2 * 60 * 1000, // 5 minutes
        })

        buttonCollector.on('collect', async (interaction) => {
            const maxPages = Math.ceil(guildManager.audioPlayer.getSongQueue().length / 10);

            switch (interaction.customId) {
                case 'back':
                    if (currentPage > 1) {
                        currentPage--;
                    }
                    break;
                case 'next':
                    if (currentPage < maxPages) {
                        currentPage++;
                    }
                    break;
                default:
                    logger.warn(`Unknown button was pressed: '${interaction.customId}'`);
                    return;
            }

            await interaction.update({ embeds: [embed.showQueue(guildManager, currentPage, clientIconUrl)] });
        });
    }
}