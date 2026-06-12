import {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  SlashCommandBuilder,
  type Interaction,
  MessageFlags,
  REST,
  Routes,
} from "discord.js";
import path from "node:path";
import fs from "node:fs";

interface ClientWithCommands extends Client {
  commands: Collection<string, any>;
}

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
if (!token) throw new Error("discord bot token is not set");
if (!clientId) throw new Error("discord client id is not set");
const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as ClientWithCommands;
client.commands = new Collection();

const cleanup = async (s: string): Promise<void> => {
  console.log(`signal ${s} received`);
  await client.destroy();
};

const main = async (): Promise<void> => {
  console.log("hi");
  client.once(Events.ClientReady, (c) => {
    console.log(`bot is ready, logged in as ${c.user.tag}`);
  });

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  const commandsDirPath = path.join(__dirname, "commands");
  const commandsDir = fs.readdirSync(commandsDirPath);
  console.log(`to load: ${commandsDir}`);

  for (const f of commandsDir) {
    const fPath = path.join(commandsDirPath, f);
    if (!fs.existsSync(fPath)) continue;
    console.log(`loading ${fPath}`);
    const command = require(fPath);
    if (command.data === undefined || !command.execute === undefined) continue;
    const data = command.data as SlashCommandBuilder;
    client.commands.set(data.name, command);
  }

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = (interaction.client as ClientWithCommands).commands.get(
      interaction.commandName,
    );

    if (!command) {
      console.error(`no matching command for ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (e) {
      console.error(e);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "error while executing command",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.followUp({
          content: "error while executing command",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  });

  const commands: any = [];
  client.commands.forEach((c) => commands.push(c.data.toJSON()));

  const rest = new REST().setToken(token);
  const data = (await rest.put(Routes.applicationCommands(clientId), {
    body: commands,
  })) as any;
  console.log(`reloaded ${data.length} slash commands`);

  client.login(token);
};

main().catch((e) => {
  console.error("exception: ", e);
  process.exit(1);
});
