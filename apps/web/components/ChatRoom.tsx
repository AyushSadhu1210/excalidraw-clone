import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const ChatRoom = ({slug}: {slug: string}) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [roomId, setRoomId] = useState("");

    useEffect(() => {
        const fetchRoomBySlug = async () => {
            const response = await axios.get(`/api/v1/get-room-by-slug/${slug}`)
           if(response.status === 200){
            setRoomId(response.data.roomId)
           }else{
            toast.error("Failed to fetch room by slug");
           }
        }
        fetchRoomBySlug();
    }, [slug]);

    useEffect(() => {
        const fetchMessages = async() => {
            const response = await axios.get(`/api/v1/get-room-chats/${roomId}`)
            if(response.status === 200){
                setMessages(response.data.messages)
            }else{
                toast.error("Failed to fetch messages");
            }
        }
        fetchMessages();
    }, [roomId]);

   
    return <div>
        <div className="flex flex-col gap-4">
            {messages.map((message) => (
                <div key={message.id}>
                    <p>{message.message}</p>
                </div>
            ))}
        </div>
    </div>
}