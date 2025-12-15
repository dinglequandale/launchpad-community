import { httpsCallable, getFunctions } from "firebase/functions";

const pushNotifPreference = localStorage.getItem("userNotificationPreferences") 
    ? JSON.parse(localStorage.getItem("userNotificationPreferences")).push_notifications
    : true;

export async function sendConnectMessageWithoutResume(message, currentUserId, connectingUserId, setChannelId, chat){
    console.log('sendConnectMessageWithoutResume called with:', {
        message: message?.substring(0, 50) + '...',
        currentUserId,
        connectingUserId,
        chat: !!chat,
        chatType: typeof chat,
        chatConstructor: chat?.constructor?.name,
        chatUserID: chat?.userID
    });
    
    if (!chat || !connectingUserId) {
        console.log('sendConnectMessageWithoutResume: Missing chat or connectingUserId');
        console.log('chat:', chat);
        console.log('connectingUserId:', connectingUserId);
        console.log('chat is falsy:', !chat);
        console.log('connectingUserId is falsy:', !connectingUserId);
        return;
    }

    console.log('sendConnectMessageWithoutResume: Creating channel...');
    console.log('Members:', [currentUserId, connectingUserId]);

    const newChannel = chat.channel("messaging", {
        members: [currentUserId, connectingUserId],
    })

    console.log('Channel created, now creating on Stream...');
    await newChannel.create();
    console.log('Channel created successfully with ID:', newChannel.id);

    console.log('Sending message...');
    await newChannel.sendMessage({
        text: message,
        user: {
            id: currentUserId,
        }
    });
    console.log('Message sent successfully');

    console.log('Setting channel ID:', newChannel.id);
    setChannelId(newChannel.id);

    // TODO: add a check to see if the user has already received an email notification from this user
    console.log("push notif preference:" + pushNotifPreference)
    if(pushNotifPreference){
        const sendEmailNotifications = httpsCallable(getFunctions(), "sendEmailNotifications");
        try{
            // Get current user's name from localStorage
            const basicUserInfo = localStorage.getItem("basicUserInfo");
            const senderName = basicUserInfo ? JSON.parse(basicUserInfo).userName : 'A Launchpad user';

            const result = await sendEmailNotifications({receiverId: connectingUserId, senderName: senderName, messagePreview: message});
            console.log('Email notification sent:', result);
        }catch(error){
            console.log('Email notification error:', error);
        }
    }
}

export async function sendConnectMessageWithResume(message, resumeURL, metaData, currentUserId, connectingUserId, setChannelId, chat){
    if (!chat || !connectingUserId) {
        console.log('sendConnectMessageWithResume: Missing chat or connectingUserId');
        return;
    }
    
    console.log('sendConnectMessageWithResume: Creating channel with resume...');
    console.log('Members:', [currentUserId, connectingUserId]);
    console.log('Resume URL:', resumeURL);

    const newChannel = chat.channel("messaging", {
        members: [currentUserId, connectingUserId]
    })

    console.log('Channel created, now creating on Stream...');
    await newChannel.create();
    console.log('Channel created successfully with ID:', newChannel.id);

    console.log('Sending message with resume attachment...');
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
    console.log('Message with resume sent successfully');

    console.log('Setting channel ID:', newChannel.id);
    setChannelId(newChannel.id);

    if(pushNotifPreference){
        const sendEmailNotifications = httpsCallable(getFunctions(), "sendEmailNotifications");
        try{
            // Get current user's name from localStorage
            const basicUserInfo = localStorage.getItem("basicUserInfo");
            const senderName = basicUserInfo ? JSON.parse(basicUserInfo).userName : 'A Launchpad user';

            const result = await sendEmailNotifications({receiverId: connectingUserId, senderName: senderName, messagePreview: message});
            console.log('Email notification sent:', result);
        }catch(error){
            console.log('Email notification error:', error);
        }
    }
}