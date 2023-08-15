import { Context, ConversationFlavor, Conversation, SessionFlavor } from "../deps.deno.ts";

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

export type MyContext = Context &
  SessionFlavor<SessionData> & ConversationFlavor;

export type MyConversation = Conversation<MyContext>;

