import type { Message } from "discord.js";

const reactMessageCallback = async (m: Message): Promise<void> => {
  const reactions: Record<string, string> = {
    woof: "🐶",
    oink: "🐷",
    quack: "🦆",
    hoot: "🦉",
    hiss: "🐍",
    rawr: "🦖",
  };
  const r = reactions[m.content.trim().toLowerCase()];
  if (r) m.react(r);
};

export { reactMessageCallback };
