import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

const execute = async (i: ChatInputCommandInteraction): Promise<void> => {
  i.reply("hi bro");
};

const data = new SlashCommandBuilder().setName("ping").setDescription("Pong!");

export { execute, data };
