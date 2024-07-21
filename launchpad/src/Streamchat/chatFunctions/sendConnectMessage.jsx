import StreamChat from "stream-chat";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;


export async function sendConnectMessage(message, currentUserId, connectingUserId){
    const chat = new StreamChat(apiKey);

    if (!chat || !connectingUserId) return;

    const newChannel = chat.channel("messaging", {
        members: [currentUserId, connectingUserId]
    })

    await newChannel.create();

    await newChannel.sendMessage({
        text: message,
        user: {
            id: currentUserId,
            // todo: onboarding
            name: 'Anonymous',
            image: ""
        }
    })
}