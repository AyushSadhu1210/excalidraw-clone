import { useEffect, useState } from "react";
import { useSocket } from "../hook/useSocket";

export const ChatRoomClient = ({messages, id}: {messages: any[], id: string}) => {
    const {socket, loading} = useSocket();
    const [chats, setChats] = useState<any[]>(messages);
    const [chatMessage, setChatMessage] = useState("");

   useEffect(()=>{
    if (socket && !loading){
        socket.send(JSON.stringify({    
            type: "join_room",
            roomId: id,
        }))
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if(data.type === "chat"){
            setChats((prev) => [...prev, {message: data.message}])
        }
    }
}
   }, [socket, loading, id])

   
    return <div>
        <div className="flex flex-col gap-4">
            {chats.map((message) => (
                <div key={message.id}>
                    <p>{message.message}</p>
                </div>
            ))}

            <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
            <button onClick={() => {
                socket?.send(JSON.stringify({
                    type: "chat",
                    message: chatMessage,
                    roomId: id,
                }))

                setChatMessage("")
            }}>Send</button>
        </div>
    </div>
}