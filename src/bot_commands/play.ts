import embed from '../embeds/embed';
import getLogger from "../setup/logging";
import { ClientAdapter } from "../util/client_adapter";
import { YoutubeHandler } from './handlers/youtube_handler';

import playdl from 'play-dl';
import { joinVoiceChannel } from "@discordjs/voice";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const logger = getLogger();

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from Youtube')
        .addStringOption(option => option
            .setName('search')
            .setDescription('Youtube URL or search input')
            .setRequired(true)
        )
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const searchOptionInput = interaction.options.getString('search', true);

        const client = interaction.client as ClientAdapter;
        const iconURL = client.user?.avatarURL()!;


        const guildId = interaction.guild?.id!;
        // Always present, in index.ts we add a guildManager if not already in the collection
        const guildManager = client.guildManagerCollection.get(guildId)!;

        const voiceChannel = interaction.guild?.members.cache.get(interaction.member?.user.id!)?.voice.channel!;
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: interaction.guild?.voiceAdapterCreator!,
        });


        var songInfo = null;
        const inputType = await playdl.validate(searchOptionInput);

        switch (inputType) {
            case 'search':
                songInfo = await YoutubeHandler.getInfoFromSearch(searchOptionInput);
                // Searching for input string might result in no video found
                if (!songInfo) {
                    logger.warn(`Search for '${searchOptionInput}' failed, found no matching video on Youtube`);
                    await interaction.editReply({ embeds: [embed.errorOccurred(`Searching for \`${searchOptionInput}\` resulted in nothing, try something else`, iconURL)] });
                    return;
                }
                break;
            case 'yt_video':
                songInfo = await YoutubeHandler.getVideoInfoFromUrl(searchOptionInput);
                break;
            default:
                logger.warn(`Search option '${searchOptionInput}' not recognized as valid input`);
                await interaction.editReply({ embeds: [embed.errorOccurred('The search option was not a recognized input type', iconURL)] });
                return;
        }

        guildManager.audioPlayer.addSong(songInfo);

        // Add to queue if there the player is playing a song, otherwise play the song which was just added
        if (guildManager.audioPlayer.isPlaying()) {
            await interaction.editReply({ embeds: [embed.addQueue(songInfo!, iconURL)] });
        } else {
            await guildManager.audioPlayer.startPlaying();
            await interaction.editReply({ embeds: [embed.currentSong(guildManager, iconURL)] });
        }
    },

};