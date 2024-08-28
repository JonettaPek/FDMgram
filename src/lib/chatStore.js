import { create } from "zustand";
import useUserStore from "./userStore";

const useChatStore = create((set) => (
    {
        chatId: null,
        receiver: null,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
        changeChat: (chatId, receiver) => {
            const currentUser = useUserStore.getState().currentUser
            if (receiver.blocked.includes(currentUser.id)) {
                return set({
                    chatId,
                    receiver: null,
                    isCurrentUserBlocked: true,
                    isReceiverBlocked: false,
                })
            } else if (currentUser.blocked.includes(receiver.id)) {
                return set({
                    chatId,
                    receiver,
                    isCurrentUserBlocked: false,
                    isReceiverBlocked: true,
                })
            } else {
                return set({
                    chatId,
                    receiver,
                    isCurrentUserBlocked: false,
                    isReceiverBlocked: false,
                }) 
            }

        },
        changeBlock: () => {
            set((state) => ({...state, isReceiverBlocked: !state.isReceiverBlocked}))
        }
    }
))

export default useChatStore