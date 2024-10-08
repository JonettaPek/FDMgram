import { useState } from "react"
import { toast } from "react-toastify"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../../lib/firebase"
import "./login.css"
import upload from "../../lib/upload"

const Login = () => {

    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    })

    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)
        const { email, password } = Object.fromEntries(formData)

        try {
            await signInWithEmailAndPassword(auth, email, password)
            toast.success("Login successfully!")

        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)
        const { username, email, password } = Object.fromEntries(formData)
        
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password)

            const imageUrl = await upload(avatar.file)

            await setDoc(doc(db, "users", response.user.uid), {
                id: response.user.uid,
                username,
                email,
                avatar: imageUrl,
                blocked: []
            })

            await setDoc(doc(db, "userchats", response.user.uid), {
                chats: []
            })

            toast.success("Account created! You can login now!")

        } catch(error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAvatar = e => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    return (
        <div className='login'>
            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin} action="">
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{ loading ? "Loading" : "Sign In" }</button>
                </form>
            </div>

            <div className="separator"></div>
                
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>

                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload an Image
                    </label>
                    <input type="file" id="file" style={{display: "none"}} onChange={handleAvatar} />

                    <input type="text" placeholder="Username" name="username" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{ loading ? "Loading" : "Sign Up" }</button>

                </form>
            </div>
        </div>
    )
}

export default Login