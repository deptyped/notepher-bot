import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { config } from "#root/config.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), (ctx) => {
  return ctx.reply(ctx.t("welcome"), {
    reply_markup: new InlineKeyboard().webApp(
      ctx.t("open-app"),
      config.WEB_APP_URL,
    ),
    link_preview_options: {
      is_disabled: true,
    },
  });
});

export { composer as welcomeFeature };
