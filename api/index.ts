import { Bot, type Context, session, InlineKeyboard, GrammyError, HttpError, Keyboard, webhookCallback } from "grammy";
import {
    conversations,
    createConversation,
} from "@grammyjs/conversations";
//@ts-ignore
import meta from "meta-grabber";
import { MyContext, MyConversation, SessionData } from "./types/bot.js";
import { getAddConfirmMarkup, getCategoriesLinkMarkup, getCategoriesMarkup, templatePost, nanoid } from "./helpers.js";
import { ListChannel, groupArray } from "./config/categories.js";
import { run } from "@grammyjs/runner";
import { autoRetry } from "@grammyjs/auto-retry";
import { freeStorage } from "@grammyjs/storage-free";
import express from "express";



const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot<MyContext>(token);
bot.api.config.use(autoRetry());
/** Defines the conversation */
async function greeting(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Als erstes bräuchten wir die Information was du denn hinzufügen möchtest. Kanal oder Gruppe?", {
        reply_markup: new InlineKeyboard()
        .text("Kanal", "group.channel")
        .text("Gruppe", "group.group"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
    });
    const response = await conversation.waitFor("callback_query:data");
        await ctx.reply('Danke, als nächstes benötigen wir den Link zur Gruppe oder Kanal. Beachte bitte, dass der Link im Format https://t.me/... sein muss.');
        conversation.session.groupType = response.callbackQuery.data; 
        const url = await conversation.form.url();
        const objectTelegramMeta = meta(url);
        conversation.session.groupName = objectTelegramMeta["title"] ?? "";
        conversation.session.groupDescription = objectTelegramMeta["description"] ?? "";
        conversation.session.groupLink = url.toString();
        await ctx.reply('Willst du noch eine Beschreibung hinzufügen? Wenn ja, schreibe sie bitte in den Chat(Tippe in das Textfeld). Wenn nicht, wähle einfach "Nein" aus.', {
            reply_markup: new Keyboard()
            .text("Nein")
            .oneTime()
            .resized()
        });
        const description = await conversation.form.text();
        if (description != "Nein") {
            conversation.session.groupDescription = description;
        }
        const menu = await getCategoriesMarkup();
        conversation.session.groupID = nanoid();
        await ctx.reply('Danke, als nächstes benötigen wir noch die Kategorie. Bitte wähle eine aus.',   {
            reply_markup: menu,
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });
        const category = await conversation.waitFor("callback_query:data");
        conversation.session.categoryId = Number(
            category.callbackQuery?.data?.replace("channelCat.", "")
        );
        await ctx.reply('Danke, hier sind deine Daten noch einmal. Solltest du auf ja klicken, wird der Vorschlag an die Admins weitergeleitet.');
        const menuFinal = await getAddConfirmMarkup(ctx);
        let textGroup: string;
        let textGroup2: string;
        if (conversation.session.groupType == "Group") {
        textGroup = "Deine Gruppe:";
        textGroup2 = "die Gruppe";
        } else {
        textGroup = "Dein Kanal:";
        textGroup2 = "den Kanal";
        }
    
        await ctx.reply(
        `<i>${textGroup}</> <b>${conversation.session.groupName}</>
    
    <i>Beschreibung:</>  
    ${conversation.session.groupDescription}
    
    <i>Kategorie:</> ${groupArray[0][conversation.session.categoryId]}
    
Deine ID: <code>${conversation.session.groupID}</code>

    <b>Wilst du ${textGroup2} hinzufügen?</>`,
        {
            reply_markup: menuFinal,
            parse_mode: "HTML",
            disable_web_page_preview: true,
        }
        );
        const finalAnswer = await conversation.waitFor("callback_query:data");
        ctx = finalAnswer
        if (finalAnswer.callbackQuery.data == "add") {
            const final =  await ctx.reply("Danke, dein Vorschlag wurde an die Admins weitergeleitet!", {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            })
            await ctx.api.sendMessage(
                ListChannel, await templatePost(ctx), {
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                })
            await ctx.api.sendMessage(
                ListChannel,
                "Neuer Eintrag von: @" +
                  (ctx.from?.username ? "Username: @" + ctx.from.username + "\n" : "") +
                  "Erster Name: " +
                  (ctx.from?.first_name ? ctx.from.first_name : "") +
                  "\nTelegramID: <code>" +
                  ctx.from?.id + "</code>", {
                    parse_mode: "HTML",
                    reply_markup: menu,
                  }
              );
        }  else {   
            await ctx.reply("Wir haben deinen Vorschlag verworfen.");
            conversation.session.groupType = "none";
            conversation.session.groupName = "string";
            conversation.session.groupDescription = "";
            conversation.session.groupLink = "none";
            conversation.session.groupID = "";
            conversation.session.categoryId = 100;
        }
}

bot.use(session({
    // Add session types to adapter.
    storage: freeStorage<SessionData>(bot.token),
    initial(): SessionData {
        return {
        page: 0,
        groupID: "",
        groupName: "string",
        message_id: 0,
        userID: 0,
        match: undefined,
        token: undefined,
        wizard: "start",
        step: 0,
        groupLink: "none",
        groupType: "none",
        categoryId: 100,
        groupDescription: "",
        };
        }
    },),
);
bot.use(conversations());

bot.use(createConversation(greeting));

bot.command("vorschlag", async (ctx) => {
    //await ctx.reply("Dann starten wir mal!");
    // enter the function "greeting" you declared
    await ctx.conversation.enter("greeting");
});
bot.callbackQuery("vorschlag", async (ctx) => {
    await ctx.answerCallbackQuery("Vorschlagsdialog wird gestartet...");
    await ctx.deleteMessage();
    //await ctx.reply("Dann starten wir mal!");
    // enter the function "greeting" you declared
    await ctx.conversation.enter("greeting");
});
const inlineKeyboard = new InlineKeyboard().text("Neuer Vorschlag", "vorschlag").text("Gruppenübersicht", "liste");

bot.command("start", async (ctx) => await ctx.reply("Willkommen beim Vorschlagsbot für @gruppen!\n\nSchicke /vorschlag um einen neuen Vorschlag zu machen.\nSchicke /liste um die aktuelle Liste der Gruppen zu sehen.", { reply_markup: inlineKeyboard }));
bot.command("liste", async (ctx: MyContext) => {
    const menu = await getCategoriesLinkMarkup();
    await ctx.reply(
    `Gruppenübersicht

@gruppen Kategorien und Kanalliste. 

Stand 08/2023`,
      {
        parse_mode: "HTML",
        reply_markup: menu,
      }
    );
  });

bot.callbackQuery("liste", async (ctx: MyContext) => {
    const menu = await getCategoriesLinkMarkup();
    await ctx.answerCallbackQuery("Liste wird geladen...");
    await ctx.editMessageText(
        `Gruppenübersicht
    
    @gruppen Kategorien und Kanalliste. 
    
    Stand 08/2023`,
          {
            parse_mode: "HTML",
            reply_markup: menu,
          }
        );
});

bot.command("reply", async (ctx) => {
    const input = ctx.match;
    const [number, ...textArray] = input.split(" ").slice(1);
    const text = textArray.join(" ");
    await ctx.api.sendMessage(number, text);
}
);

//bot.use((ctx) => ctx.reply("Bitte gib /start ein."));

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
    } else {
    console.error("Unknown error:", e);
    }
});

const port = 8000;
const app = express();

app.use(express.json());
app.use(`/${bot.token}`, webhookCallback(bot, "express"));
app.use((_req, res) => res.status(200).send());

app.listen(port, () => console.log(`listening on port ${port}`));

// Stopping the bot when the Node.js process
// is about to be terminated
