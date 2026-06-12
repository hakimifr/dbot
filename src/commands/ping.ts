import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const execute = async (i: ChatInputCommandInteraction): Promise<void> => {
  i.reply("hi bro");
};

export const data = new SlashCommandBuilder().setName("ping").setDescription("Pong!");
