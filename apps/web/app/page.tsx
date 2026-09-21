"use client"

import axios from "axios";
import { useEffect, useState } from "react";
import { ChatRoom } from "../components/ChatRoom";

export default function homePage(){
const [slug, setSlug] = useState("");
const [id, setId] = useState("");
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchRoomId = async () => {
    const response = await axios.get(`${NEXT_PUBLIC_API_URL}/api/v1/get-room-by-slug?slug=${slug}`)
    if(response.status === 200){
      setId(response.data.id);
    }
  }

return <div>
  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} />
  <button onClick={() => fetchRoomId()}>Get Room ID</button>
  {id && <ChatRoom id={id} />}
</div>
}