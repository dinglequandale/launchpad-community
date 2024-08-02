export async function sendConnectMessageWithoutResume(message, currentUserId, connectingUserId, setChannelId, chat){
    if (!chat || !connectingUserId) return;

    // also need the user data for the conenctUserId (target)

    const newChannel = chat.channel("messaging", {
        members: [currentUserId, connectingUserId],
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