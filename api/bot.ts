import { Bot, session, InlineKeyboard, GrammyError, HttpError, Keyboard } from "./deps.deno.ts";
import {
    nanoid,
    conversations,
    createConversation,
} from "./deps.deno.ts";
import {meta} from "./modules/meta.ts";

import { MyContext, MyConversation, SessionData } from "./types/types.ts";
import { getAddConfirmMarkup, getCategoriesLinkMarkup, getCategoriesMarkup, templatePost } from "./helpers.ts";
import { ListChannel, groupArray } from "./config/categories.ts";
import { autoRetry } from "https://esm.sh/@grammyjs/auto-retry";

const token = Deno.env.get("TOKEN");
if (token === undefined) throw new Error("Env var TOKEN required for bot!");

export const bot = new Bot<MyContext>(token);
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
        await response.editMessageText('Danke, als nächstes benötigen wir den Link zur Gruppe oder Kanal. Beachte bitte, dass der Link im Format https://t.me/... sein muss.');
        conversation.session.groupType = response.callbackQuery.data; 
        
        const url = await conversation.form.url();
        interface TelegramMeta {
            title?: string;
            description?: string;
        }

        const objectTelegramMeta: TelegramMeta = await meta(url.toString());
        conversation.session.groupDescription = objectTelegramMeta["description"] ?? "";
        conversation.session.groupName = objectTelegramMeta["title"] ?? "";
        conversation.session.groupLink = url.toString();
        await ctx.reply('Willst du noch eine Beschreibung hinzufügen? Wenn ja, schreibe sie bitte in den Chat(Tippe in das Textfeld). Wenn nicht, wähle einfach "Nein" aus.', {
            reply_markup: new Keyboard()
            .text("Nein")
            .oneTime()
            .resized()
        });

        const description = await conversation.waitFor(":text");
        const descriptionMessage = description.message;
        if (!descriptionMessage) {
            conversation.log("Description message is undefined");
        }
        if (descriptionMessage && descriptionMessage.text !== "Nein") {
            const descontxt = descriptionMessage.text;
            conversation.session.groupDescription = descontxt;
        }
        const menu = await getCategoriesMarkup();
        conversation.session.groupID = nanoid();
        await description.reply('Danke, als nächstes benötigen wir noch die Kategorie. Bitte wähle eine aus.',   {
            reply_markup: menu,
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });
        const category = await conversation.waitFor("callback_query:data");
        conversation.session.categoryId = Number(
            category.callbackQuery?.data?.replace("channelCat.", "")
        );
        await category.editMessageText('Danke, hier sind deine Daten noch einmal. Solltest du auf ja klicken, wird der Vorschlag an die Admins weitergeleitet.');
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
        try {await ctx.deleteMessage();} catch { conversation.log("Message not found")}
        if (finalAnswer.callbackQuery.data == "add") {
            await ctx.reply("Danke, dein Vorschlag wurde an die Admins weitergeleitet!", {
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
    //storage: freeStorage<SessionData>(bot.token),
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
    try {await ctx.deleteMessage();} catch { console.log("Message not found")}
    //await ctx.reply("Dann starten wir mal!");
    // enter the function "greeting" you declared
    await ctx.conversation.enter("greeting");
});
const inlineKeyboard = new InlineKeyboard().text("Neuer Vorschlag", "vorschlag").text("Gruppenübersicht", "liste");

bot.command("start", async (ctx) => {
    ctx.session.groupType = "none";
    ctx.session.groupName = "string";
    ctx.session.groupDescription = "";
    ctx.session.groupLink = "none";
    ctx.session.groupID = "";
    ctx.session.categoryId = 100;
    await ctx.reply("Willkommen beim Vorschlagsbot für @gruppen!\n\nSchicke /vorschlag um einen neuen Vorschlag zu machen.\nSchicke /liste um die aktuelle Liste der Gruppen zu sehen.", { reply_markup: inlineKeyboard })
});
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
    if (!ctx.message) return;
    const input = ctx.message.text;
    const [_, number, ...text] = input.split(" ");
    await ctx.reply(`You said ${number} and ${text.join(" ")}`);
    await ctx.api.sendMessage(number, text.join(" "));
});
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

