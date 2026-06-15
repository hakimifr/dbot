import type { GuildBasedChannel, Message } from "discord.js";

let ANTISPAM_ENABLED = true;
const ANTISPAM_GUILD_ID = process.env.ANTISPAM_GUILD_ID;
const ANTISPAM_CHANNEL_ID = process.env.ANTISPAM_CHANNEL_ID;
const ANTISPAM_LOG_CHANNEL_ID = process.env.ANTISPAM_LOG_CHANNEL_ID;

if (!(ANTISPAM_GUILD_ID || ANTISPAM_CHANNEL_ID || ANTISPAM_LOG_CHANNEL_ID)) {
  ANTISPAM_ENABLED = false;
  console.warn("antispam disabled. required variables not set");
}

const antispamMessageCallback = async (m: Message): Promise<void> => {
  if (!ANTISPAM_ENABLED) return;
  if (m.guild?.id != ANTISPAM_GUILD_ID) return;
  if (m.channel.id != ANTISPAM_CHANNEL_ID) return;

  const logChannel = m.guild?.channels.fetch(
    ANTISPAM_LOG_CHANNEL_ID as string,
  ) as Promise<GuildBasedChannel>;

  const member = await m.guild?.members.fetch(m.author.id);
  const me = await m.guild?.members.fetchMe();
  if (!member?.bannable) {
    console.warn(`cannot ban ${m.author.globalName}/${m.author.displayName}, perhaps higher role?`);
    logChannel.then((c) => {
      if (!c?.isTextBased()) return;
      c.send(`cannot ban ${m.author.toString()} [id: \`${m.author.id}\`]`);
    });
    return;
  }
  if (member!.roles.highest.position >= me!.roles.highest.position) {
    console.log(
      `ignoring user with higher role: ${m.author.globalName}/${m.author.displayName}, id: ${m.author.id}`,
    );
    return;
  }

  console.log(`banning ${m.author}`);
  await m.guild?.bans.create(m.author, { reason: "message sent in void chat" });
  await m.delete();
  logChannel.then((c) => {
    if (!c?.isTextBased()) return;
    c.send(`banned ${m.author.toString()} [id: \`${m.author.id}\`]`);
  });
};

export { antispamMessageCallback };
