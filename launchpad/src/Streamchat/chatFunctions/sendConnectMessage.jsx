import { httpsCallable, getFunctions } from "firebase/functions";

export async function sendConnectMessageWithoutResume(message, currentUserId, connectingUserId, setChannelId, chat, schoolId){
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

    console.log("schoolId", schoolId);
    console.log("receiving user", connectingUserId);
    console.log("current user", currentUserId);
    console.log("message", message);
    
    // TODO: add a check to see if the user has already received an email notification from this user
    const sendEmailNotifications = httpsCallable(getFunctions(), "sendEmailNotifications");
    try{
        const result = await sendEmailNotifications({receiverId: connectingUserId, senderName: currentUserId, messagePreview: message, schoolId: schoolId});
    }catch(error){
        console.log(error);
    }
}

export async function sendConnectMessageWithResume(message, resumeURL, metaData, currentUserId, connectingUserId, setChannelId, chat, schoolId){
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

    const sendInitEmailNotification = httpsCallable(getFunctions(), "sendInitEmailNotification");
    try{
        const result = await sendInitEmailNotification({receiverId: connectingUserId, senderName: currentUserId, messagePreview: message, schoolId: schoolId});
    }catch(error){
        console.log(error);
    }
}