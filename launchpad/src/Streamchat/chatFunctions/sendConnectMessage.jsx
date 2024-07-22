import { StreamChat } from 'stream-chat';
import { getStreamToken } from './setUpUser';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;
const chat = new StreamChat(apiKey);

export async function sendConnectMessageWithoutResume(message, currentUserId, connectingUserId, setChannelId, chat){
    if (!chat || !connectingUserId) return;

    // const userToken = await getStreamToken();

    // await chat.connectUser(
    //     { id: currentUserId },
    //     userToken
    // );

    const newChannel = chat.channel("messaging", {
        // name: ,
        members: [currentUserId, connectingUserId]
    })

    await newChannel.create();

    await newChannel.sendMessage({
        text: message,
        user: {
            id: currentUserId,
        }
    })
    setChannelId(newChannel.id);
}

export async function sendConnectMessageWithResume(message, resumeURL, metaData, currentUserId, connectingUserId, setChannelId, chat){
    if (!chat || !connectingUserId) return;
    
    const newChannel = chat.channel("messaging", {
        name:"Brongle",
        image: "/assets/awty-logo.jpg",
        members: [currentUserId, connectingUserId]
    })

    await newChannel.create();

    await newChannel.sendMessage({
        text: message,
        attachments: [
            {
                type: 'file',
                asset_url: resumeURL,
                title: 'Resume',
                mime_type: metaData.contentType,
                file_size: metaData.size,      
            },
            ],
        user: {
            id: currentUserId,
        }
    })
    setChannelId(newChannel.id);
}