"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const conversations_1 = require("@grammyjs/conversations");
//@ts-ignore
const meta_grabber_1 = __importDefault(require("meta-grabber"));
const helpers_js_1 = require("./helpers.js");
const categories_js_1 = require("./config/categories.js");
const token = process.env.BOT_TOKEN;
if (!token)
    throw new Error("BOT_TOKEN is unset");
const bot = new grammy_1.Bot(token);
/** Defines the conversation */
async function greeting(conversation, ctx) {
    var _a, _b, _c, _d, _e, _f, _g;
    await ctx.reply("Als erstes bräuchten wir die Information was du denn hinzufügen möchtest. Kanal oder Gruppe?", {
        reply_markup: new grammy_1.InlineKeyboard()
            .text("Kanal", "group.channel")
            .text("Gruppe", "group.group"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
    });
    const response = await conversation.waitFor("callback_query:data");
    await ctx.reply('Danke, als nächstes benötigen wir den Link zur Gruppe oder Kanal. Beachte bitte, dass der Link im Format https://t.me/... sein muss.');
    conversation.session.groupType = response.callbackQuery.data;
    const url = await conversation.form.url();
    const objectTelegramMeta = (0, meta_grabber_1.default)(url);
    conversation.session.groupName = (_a = objectTelegramMeta["title"]) !== null && _a !== void 0 ? _a : "";
    conversation.session.groupDescription = (_b = objectTelegramMeta["description"]) !== null && _b !== void 0 ? _b : "";
    conversation.session.groupLink = url.toString();
    await ctx.reply('Willst du noch eine Beschreibung hinzufügen? Wenn ja, schreibe sie bitte in den Chat(Tippe in das Textfeld). Wenn nicht, wähle einfach "Nein" aus.', {
        reply_markup: new grammy_1.Keyboard()
            .text("Nein")
            .oneTime()
            .resized()
    });
    const description = await conversation.form.text();
    if (description != "Nein") {
        conversation.session.groupDescription = description;
    }
    const menu = await (0, helpers_js_1.getCategoriesMarkup)();
    conversation.session.groupID = (0, helpers_js_1.nanoid)();
    await ctx.reply('Danke, als nächstes benötigen wir noch die Kategorie. Bitte wähle eine aus.', {
        reply_markup: menu,
        parse_mode: "HTML",
        disable_web_page_preview: true,
    });
    const category = await conversation.waitFor("callback_query:data");
    conversation.session.categoryId = Number((_d = (_c = category.callbackQuery) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.replace("channelCat.", ""));
    await ctx.reply('Danke, hier sind deine Daten noch einmal. Solltest du auf ja klicken, wird der Vorschlag an die Admins weitergeleitet.');
    const menuFinal = await (0, helpers_js_1.getAddConfirmMarkup)(ctx);
    let textGroup;
    let textGroup2;
    if (conversation.session.groupType == "Group") {
        textGroup = "Deine Gruppe:";
        textGroup2 = "die Gruppe";
    }
    else {
        textGroup = "Dein Kanal:";
        textGroup2 = "den Kanal";
    }
    await ctx.reply(`<i>${textGroup}</> <b>${conversation.session.groupName}</>
    
    <i>Beschreibung:</>  
    ${conversation.session.groupDescription}
    
    <i>Kategorie:</> ${categories_js_1.groupArray[0][conversation.session.categoryId]}
    
Deine ID: <code>${conversation.session.groupID}</code>

    <b>Wilst du ${textGroup2} hinzufügen?</>`, {
        reply_markup: menuFinal,
        parse_mode: "HTML",
        disable_web_page_preview: true,
    });
    const finalAnswer = await conversation.waitFor("callback_query:data");
    ctx = finalAnswer;
    if (finalAnswer.callbackQuery.data == "add") {
        const final = await ctx.reply("Danke, dein Vorschlag wurde an die Admins weitergeleitet!", {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });
        await ctx.api.sendMessage(categories_js_1.ListChannel, await (0, helpers_js_1.templatePost)(ctx), {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });
        await ctx.api.sendMessage(categories_js_1.ListChannel, "Neuer Eintrag von: @" +
            (((_e = ctx.from) === null || _e === void 0 ? void 0 : _e.username) ? "Username: @" + ctx.from.username + "\n" : "") +
            "Erster Name: " +
            (((_f = ctx.from) === null || _f === void 0 ? void 0 : _f.first_name) ? ctx.from.first_name : "") +
            "\nTelegramID: tg://user?id=" +
            ((_g = ctx.from) === null || _g === void 0 ? void 0 : _g.id));
    }
    else {
        await ctx.reply("Wir haben deinen Vorschlag verworfen.");
        conversation.session.groupType = "none";
        conversation.session.groupName = "string";
        conversation.session.groupDescription = "";
        conversation.session.groupLink = "none";
        conversation.session.groupID = "";
        conversation.session.categoryId = 100;
    }
}
bot.use((0, grammy_1.session)({
    // Add session types to adapter.
    //storage: freeStorage<SessionData>(bot.token),
    initial() {
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
}));
bot.use((0, conversations_1.conversations)());
bot.use((0, conversations_1.createConversation)(greeting));
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
const inlineKeyboard = new grammy_1.InlineKeyboard().text("Neuer Vorschlag", "vorschlag").text("Gruppenübersicht", "liste");
bot.command("start", (ctx) => ctx.reply("Willkommen beim Vorschlagsbot für @gruppen!\n\nSchicke /vorschlag um einen neuen Vorschlag zu machen.\nSchicke /liste um die aktuelle Liste der Gruppen zu sehen.", { reply_markup: inlineKeyboard }));
bot.command("liste", async (ctx) => {
    const menu = await (0, helpers_js_1.getCategoriesLinkMarkup)();
    await ctx.reply(`Gruppenübersicht

@gruppen Kategorien und Kanalliste. 

Stand 08/2023`, {
        parse_mode: "HTML",
        reply_markup: menu,
    });
});
bot.callbackQuery("liste", async (ctx) => {
    const menu = await (0, helpers_js_1.getCategoriesLinkMarkup)();
    await ctx.answerCallbackQuery("Liste wird geladen...");
    await ctx.editMessageText(`Gruppenübersicht
    
    @gruppen Kategorien und Kanalliste. 
    
    Stand 08/2023`, {
        parse_mode: "HTML",
        reply_markup: menu,
    });
});
bot.use((ctx) => ctx.reply("What a nice update."));
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof grammy_1.GrammyError) {
        console.error("Error in request:", e.description);
    }
    else if (e instanceof grammy_1.HttpError) {
        console.error("Could not contact Telegram:", e);
    }
    else {
        console.error("Unknown error:", e);
    }
});
exports.default = (0, grammy_1.webhookCallback)(bot, "http");
