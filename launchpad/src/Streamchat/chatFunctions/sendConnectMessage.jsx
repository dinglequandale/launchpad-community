import { StreamChat } from 'stream-chat';
import { getStreamToken } from './setUpUser';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

export async function sendConnectMessageWithoutResume(message, currentUserId, connectingUserId, setChannelId){
    const chat = new StreamChat(apiKey);

    if (!chat || !connectingUserId) return;

    const userToken = await getStreamToken();

    await chat.connectUser(
        { id: currentUserId },
        userToken
    );
    

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
    setChannelId(newChannel.id);
}

export async function sendConnectMessageWithResume(message, resumeURL, metaData, currentUserId, connectingUserId, setChannelId){
    const chat = new StreamChat(apiKey);



    if (!chat || !connectingUserId) return;

    const newChannel = chat.channel("messaging", {
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
            // todo: onboarding
            name: 'Anonymous',
            image: ""
        }
    })
    setChannelId(newChannel.id);
}