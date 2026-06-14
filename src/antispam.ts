import type { Message } from "discord.js";

let ANTISPAM_ENABLED = true;
const ANTISPAM_GUILD_ID = process.env.ANTISPAM_GUILD_ID;
const ANTISPAM_CHANNEL_ID = process.env.ANTISPAM_CHANNEL_ID;

if (!(ANTISPAM_GUILD_ID || ANTISPAM_CHANNEL_ID)) {
  ANTISPAM_ENABLED = false;
  console.warn("antispam disabled. required variables not set");
}

const antispamMessageCallback = async (m: Message): Promise<void> => {
  if (!ANTISPAM_ENABLED) return;
  if (m.guild?.id != ANTISPAM_GUILD_ID) return;
  if (m.channel.id != ANTISPAM_CHANNEL_ID) return;

  const member = await m.guild?.members.fetch(m.author.id);
  if (!member?.bannable) {
    console.warn(`cannot ban ${m.author.globalName}/${m.author.displayName}, perhaps higher role?`);
    return;
  }
  console.log(`banning ${m.author}`);
  await m.guild?.bans.create(m.author, { reason: "message sent in void chat" });
  await m.delete();
};

export { antispamMessageCallback };
