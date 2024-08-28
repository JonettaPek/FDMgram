import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import useChatStore from "../../lib/chatStore"
import { auth, db } from "../../lib/firebase"
import useUserStore from "../../lib/userStore"
import "./detail.css"

const Detail = () => {

  const { currentUser } = useUserStore()
  const { chatId, receiver, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore()

  const handleBlock = async (e) => {
    if (!receiver) return;

    try {
      await updateDoc(doc(db, "users", currentUser.id), {
        blocked: isReceiverBlocked ? arrayRemove(receiver.id) : arrayUnion(receiver.id)
      })
      changeBlock()
    } catch(error) {
      console.log(error)
    }
  }

  return (
    <div className='detail'>

      <div className="user">
        <img src={receiver?.avatar || "./avatar.png"} alt="" />
        <h2>{isCurrentUserBlocked ? "Unknown User" : receiver?.username}</h2>
        <p>Description</p>

      </div>
      
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowUp.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://iili.io/fwR2zg.jpg" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>

            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://iili.io/fwR2zg.jpg" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>

            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://iili.io/fwR2zg.jpg" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>

            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://iili.io/fwR2zg.jpg" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>            
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <button onClick={handleBlock}>{isCurrentUserBlocked ? "You are blocked" : isReceiverBlocked ? "Unblock User" : "Block User"}</button>
        <button className="logout" onClick={() => auth.signOut()}>Logout</button>
      </div>

    </div>
  )
}

export default Detail