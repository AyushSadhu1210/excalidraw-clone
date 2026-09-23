"use client";

import axios from "axios";
import { ChatRoomClient } from "./ChatRoomClient";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const getMessages = async (id: string) => {
    const response = await axios.get(`${NEXT_PUBLIC_API_URL}/api/v1/get-room-chats?roomId=${id}`)
   return response.data.messages;
}

export const ChatRoom = async({id}: {id: string}) => {
    const messages = await getMessages(id);
    return <ChatRoomClient messages={messages} id={id}/>
}