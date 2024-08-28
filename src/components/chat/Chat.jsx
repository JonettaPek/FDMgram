import { useEffect, useRef, useState } from "react"
import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import useChatStore from "../../lib/chatStore"
import useUserStore from "../../lib/userStore"
import upload from "../../lib/upload"

const Chat = () => {

  const { currentUser } = useUserStore()
  const { chatId, receiver, isCurrentUserBlocked, isReceiverBlocked } = useChatStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [chat, setChat] = useState(null)
  const [image, setImage] = useState({
    file: null,
    url: ""
  })

  const handleImage = e => {
    if (e.target.files[0]) {
        setImage({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0])
        })
    }
  }
  const handleEmoji = e => {
    setText(prev => prev + e.emoji)
    setOpen(false)
  }

  const handleSend = async () => {
    if (text === "") return;

    let imageUrl = null
    
    try {
      if (image.file) {
        imageUrl = await upload(image.file)
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          chatId,
          senderId: currentUser.id,
          text,
          ...(imageUrl && { image: imageUrl}),
          createdAt: new Date()
        })
      })

      const userIds = [currentUser.id, receiver.id]

      userIds.forEach(async (userId) => {
        
        const userChatsRef = doc(db, "userchats", userId)
        const userChatsSnap = await getDoc(userChatsRef)
  
        if (userChatsSnap.exists()) {
          const userChatsData = userChatsSnap.data()
  
          const chatIndex = userChatsData.chats.findIndex((chat) => chat.chatId === chatId)
  
          userChatsData.chats[chatIndex].lastMessage = text
          userChatsData.chats[chatIndex].updatedAt = Date.now()
          userChatsData.chats[chatIndex].isSeen = userId === currentUser.id ? true : false
  
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats
          })
        }
        
      })

    } catch (error) {
      console.log(error)
    }

    setText("")
    setImage({
      file: null,
      url: ""
    })
  }

  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth"})
  }, [])

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (response) => {
      setChat(response.data())
    })

    return () => {
      unSub()
    }
  }, [chatId])

  return (
    <div className='chat'>

      <div className="top">
        <div className="user">
          <img src={receiver?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{isCurrentUserBlocked? "Unknown User" : receiver?.username}</span>
            <p>Last seen just now</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {
          chat?.messages.map((message) => {
            return (
              <div className={message.senderId === currentUser.id ? "message own" : "message"} key={message.createdAt}>
                <div className="texts">
                  {message.image && <img src={message.image} alt="" />}
                  <p>{message.text}</p>
                  {/* <span>1 min ago</span> */}
                </div>
              </div>
            )
          })
        }
        {image.url && <div className="message own">
          <div className="texts">
            <img src={image.url} alt="" />
          </div>
        </div>}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file" style={{display: "none"}} onChange={handleImage} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message..."} value={text} onChange={e => setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked} />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked} >Send</button>
      </div>

    </div>
  )
}

export default Chat