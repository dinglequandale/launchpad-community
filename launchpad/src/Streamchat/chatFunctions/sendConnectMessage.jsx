export async function sendConnectMessageWithoutResume(message, currentUserId, connectingUserId, setChannelId, chat){
    if (!chat || !connectingUserId) return;

    const currStreamUserData = chat.user;

    // Fetch the connecting user's data
    const connectingUser = await chat.queryUsers({ id: connectingUserId });
    const connectingUserData = connectingUser.users[0];

    // also need the user data for the conenctUserId (target)

    const newChannel = chat.channel("messaging", {
        // name: "", // needs to become dynamic
        // image: "", 
        members: [currentUserId, connectingUserId],
    })

    await newChannel.create();

    // Set custom channel data for current user
    // await newChannel.updatePartial({
    //     set: {
    //         [`name_${currentUserId}`]: connectingUserData.name,
    //         [`image_${currentUserId}`]: connectingUserData.image || "/assets/awty-logo.jpg"
    //     }
    // });



    // // Set custom channel data for connecting user
    // await newChannel.updatePartial({
    //     set: {
    //         [`name_${connectingUserId}`]: currStreamUserData.name,
    //         [`image_${connectingUserId}`]: currStreamUserData.image || "/assets/awty-logo.jpg"
    //     }
    // });

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