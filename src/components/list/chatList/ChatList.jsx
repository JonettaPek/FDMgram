import { useEffect, useState } from "react"
import "./chatList.css"
import AddUser from "./addUser/AddUser";
import useUserStore from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import useChatStore from "../../../lib/chatStore";

const ChatList = () => {

  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore()
  const { changeChat } = useChatStore()

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (response) => {
      const items = response.data().chats

      const promises = items.map(async (item) => {
        const receiverDocRef = doc(db, "users", item.receiverId)
        const receiverDocSnap = await getDoc(receiverDocRef)
        const receiver = receiverDocSnap.data()
        return {...item, receiver}
      })
      
      const chatData = await Promise.all(promises)

      setChats(chatData.sort((a,b) => b.updatedAt - a.updatedAt))
    })

    return () => {
      unsub()
    }
  }, [currentUser.id])

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { receiver, ...rest} = item
      return rest;
    })

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId)

    userChats[chatIndex].isSeen = true

    try { 
      updateDoc(doc(db, "userchats", currentUser.id), {
        chats: userChats
      })
      changeChat(chat.chatId, chat.receiver)
    } catch(error) {
      console.log(error)
    }
  }

  const filteredChats = chats.filter((chat) => chat.receiver.username.toLowerCase().includes(input.toLowerCase()))

  return (
    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)} />
        </div>
        <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className="add" onClick={() => setAddMode((prev) => !prev)} />
      </div>
      {
        filteredChats?.map((chat) => {
          return (
            <div 
              className="item" 
              key={chat.chatId} 
              onClick={() => handleSelect(chat)}
              style={{
                backgroundColor: chat.isSeen ? "transparent" : "#FFA500" // #5183fe
              }}
            >
              <img src={chat.receiver.blocked.includes(currentUser.id) ? "./avatar.png" : chat.receiver?.avatar || "./avatar.png"} alt="" />
              <div className="texts">
                <span>{chat.receiver.blocked.includes(currentUser.id) ? "Unknown User" : chat.receiver?.username}</span>
                <p>{chat.lastMessage}</p>
              </div>
            </div>
          )
        })
      }
      {addMode && <AddUser />}
    </div>
  )
}

export default ChatList