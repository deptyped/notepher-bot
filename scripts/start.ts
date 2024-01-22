#!/usr/bin/env tsx

import { run, RunnerHandle } from "@grammyjs/runner";
import { onShutdown } from "node-graceful-shutdown";
import { createBot } from "#root/bot/index.js";
import { config } from "#root/config.js";
import { logger } from "#root/logger.js";

try {
  const bot = createBot(config.BOT_TOKEN);
  let runner: undefined | RunnerHandle;

  // Graceful shutdown
  onShutdown(async () => {
    logger.info("shutdown");

    await runner?.stop();
    await bot.stop();
  });

  if (config.BOT_MODE === "runner") {
    // to prevent receiving updates before the bot is ready
    await bot.init();
    logger.info({
      msg: "bot running...",
      username: bot.botInfo.username,
    });
    runner = run(bot, {
      runner: {
        fetch: {
          allowed_updates: config.BOT_ALLOWED_UPDATES,
        },
      },
    });
  } else if (config.BOT_MODE === "polling") {
    await bot.start({
      allowed_updates: config.BOT_ALLOWED_UPDATES,
      onStart: ({ username }) =>
        logger.info({
          msg: "bot running...",
          username,
        }),
    });
  }
} catch (error) {
  logger.error(error);
  process.exit(1);
}
