import type { Context as GrammyContext, SessionFlavor } from "grammy";
import {
  type Conversation,
  type ConversationFlavor
} from "@grammyjs/conversations";


export interface SessionData {
  page?: number;
  groupID: string;
  groupName: string;
  message_id: number;
  userID: number;
  match: RegExpExecArray | undefined;
  token: string | undefined;
  wizard: "start" | "group.add" | "group.add18" | "group.delete" | "group.update";
  step: number;
  groupLink: string;
  groupType: string
  categoryId: number;
  groupDescription: string;
}

export type MyContext = GrammyContext &
  SessionFlavor<SessionData> & ConversationFlavor;

export type MyConversation = Conversation<MyContext>;

