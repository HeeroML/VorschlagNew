"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templatePost18 = exports.templatePost = exports.getCategoriesLinkMarkup = exports.getCategoriesMarkup18 = exports.getCategoriesMarkup = exports.getMainMenu = exports.LikeButton = exports.ConfirmGroupAdd = exports.getDeleteMarkup = exports.getAddConfirmMarkup = exports.nanoid = void 0;
const grammy_1 = require("grammy");
const categories_js_1 = require("./config/categories.js");
const nanoid_1 = require("nanoid");
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
exports.nanoid = (0, nanoid_1.customAlphabet)(alphabet, 10);
const getAddConfirmMarkup = async (ctx) => {
    return new grammy_1.InlineKeyboard()
        .text("Ja", "add")
        .text("Nein", "notadd");
};
exports.getAddConfirmMarkup = getAddConfirmMarkup;
const getDeleteMarkup = async (ctx) => {
    return new grammy_1.InlineKeyboard()
        .text("Ja", "channelDelete." + ctx.session.groupID)
        .text("Nein", "channelDeleteNo");
};
exports.getDeleteMarkup = getDeleteMarkup;
const ConfirmGroupAdd = async (ctx) => {
    return new grammy_1.InlineKeyboard()
        .text("Ja", "channelAddAdmin." + ctx.session.groupID)
        .text("Nein", "channelAddAdminNo." + ctx.session.groupID);
};
exports.ConfirmGroupAdd = ConfirmGroupAdd;
const LikeButton = async (ctx) => {
    return new grammy_1.InlineKeyboard().text("♥️", "like." + ctx.session.groupID);
};
exports.LikeButton = LikeButton;
const getMainMenu = async () => {
    return new grammy_1.InlineKeyboard()
        .text("Gruppe hinzufügen", "group.add")
        .row()
        .text("Gruppe aktualisieren", "group.update")
        .row()
        .text("🔞Ü18 Gruppe hinzufügen", "group.add18");
    //.text("Gruppe löschen", "group.delete");
};
exports.getMainMenu = getMainMenu;
const getCategoriesMarkup = async () => {
    return new grammy_1.InlineKeyboard()
        .text(categories_js_1.groupArray[0][0], "channelCat.0")
        .row()
        .text(categories_js_1.groupArray[0][1], "channelCat.1")
        .row()
        .text(categories_js_1.groupArray[0][2], "channelCat.2")
        .row()
        .text(categories_js_1.groupArray[0][3], "channelCat.3")
        .row()
        .text(categories_js_1.groupArray[0][4], "channelCat.4")
        .row()
        .text(categories_js_1.groupArray[0][5], "channelCat.5")
        .row()
        .text(categories_js_1.groupArray[0][6], "channelCat.6")
        .row()
        .text(categories_js_1.groupArray[0][7], "channelCat.7")
        .row()
        .text(categories_js_1.groupArray[0][8], "channelCat.8")
        .row()
        .text(categories_js_1.groupArray[0][9], "channelCat.9")
        .row()
        .text(categories_js_1.groupArray[0][10], "channelCat.10")
        .row()
        .text(categories_js_1.groupArray[0][11], "channelCat.11");
};
exports.getCategoriesMarkup = getCategoriesMarkup;
const getCategoriesMarkup18 = async () => {
    return new grammy_1.InlineKeyboard()
        .text(categories_js_1.groupArray18[0][0], "channelCat.0")
        .row();
};
exports.getCategoriesMarkup18 = getCategoriesMarkup18;
const getCategoriesLinkMarkup = async () => {
    return new grammy_1.InlineKeyboard()
        .url(categories_js_1.groupArray[0][0], categories_js_1.groupArray[1][0])
        .row()
        .url(categories_js_1.groupArray[0][1], categories_js_1.groupArray[1][1])
        .row()
        .url(categories_js_1.groupArray[0][2], categories_js_1.groupArray[1][2])
        .row()
        .url(categories_js_1.groupArray[0][3], categories_js_1.groupArray[1][3])
        .row()
        .url(categories_js_1.groupArray[0][4], categories_js_1.groupArray[1][4])
        .row()
        .url(categories_js_1.groupArray[0][5], categories_js_1.groupArray[1][5])
        .row()
        .url(categories_js_1.groupArray[0][6], categories_js_1.groupArray[1][6])
        .row()
        .url(categories_js_1.groupArray[0][7], categories_js_1.groupArray[1][7])
        .row()
        .url(categories_js_1.groupArray[0][8], categories_js_1.groupArray[1][8])
        .row()
        .url(categories_js_1.groupArray[0][9], categories_js_1.groupArray[1][9])
        .row()
        .url(categories_js_1.groupArray[0][10], categories_js_1.groupArray[1][10])
        .url(categories_js_1.groupArray[0][11], categories_js_1.groupArray[1][11]);
};
exports.getCategoriesLinkMarkup = getCategoriesLinkMarkup;
async function templatePost(ctx) {
    let textType;
    if (ctx.session.groupType == "Channel") {
        textType = "Kanal: ";
    }
    else {
        textType = "Gruppe: ";
    }
    return `<b>${ctx.session.groupName}</>
Beschreibung: ${ctx.session.groupDescription}

${textType} ${ctx.session.groupLink}

ID: <code>${ctx.session.groupID}</code> 
<i>(Klicken zum Kopieren)</>


🌷➖➖➖➖➖➖
Unsere Übersicht: @gruppen
Kategorie: <a href="${categories_js_1.groupArray[1][ctx.session.categoryId]}">${categories_js_1.groupArray[0][ctx.session.categoryId]}</a>
➖➖➖➖➖➖🌷`;
}
exports.templatePost = templatePost;
async function templatePost18(ctx) {
    let textType;
    if (ctx.session.groupType == "Channel") {
        textType = "Kanal: ";
    }
    else {
        textType = "Gruppe: ";
    }
    return `<b>🔞 Ü18 ${ctx.session.groupName}</>
Beschreibung: ${ctx.session.groupDescription}

${textType} ${ctx.session.groupLink}

ID: <code>${ctx.session.groupID}</code> 
<i>(Klicken zum Kopieren)</>


🌷➖➖➖➖➖➖
Unsere Übersicht: @gruppen
Kategorie: <a href="${categories_js_1.groupArray18[1][ctx.session.categoryId]}">${categories_js_1.groupArray18[0][ctx.session.categoryId]}</a>
➖➖➖➖➖➖🌷`;
}
exports.templatePost18 = templatePost18;
