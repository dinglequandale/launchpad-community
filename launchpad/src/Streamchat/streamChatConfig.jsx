import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  LoadingIndicator,
  ChannelList
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import Loading from '../components/LoadingAnimation/Loading';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

export default function InitializeStream() {
    
    const {currentUser} = getAuth();

    const user = {
        id: currentUser.uid,
        name: "Konrad Tittel",
        image: "/assets/awty-logo.jpg"
    }

    const [client, setClient] = useState(null);

    const filters = {type: "messaging", members: {$in: [currentUser.uid]}};
    const sort = {last_message_at: -1};

    useEffect(()=>{
    async function init() {
        const chatClient = StreamChat.getInstance(apiKey);
        if(currentUser){
            await chatClient.connectUser(user, chatClient.devToken(currentUser.uid));
            
            const channel = chatClient.channel("messaging", "launchpad-messaging", {
                image: "/assets/awty-logo.jpg",
                name: "Connect",
                members: [user.id]
            })

            await channel.watch();
            setClient(chatClient);
        }
    }

    init();

    if(client) return () => client.disconnectUser
    }, [])

    if(!client) return <Loading/>;

    return (
        <Chat client={client} theme="messaging light">
            <ChannelList
            filters={filters}
            sort={sort}
            />
            <Channel>
                <Window>
                    <ChannelHeader/>
                    <MessageList/>
                    <MessageInput/>
                </Window>
                <Thread/>
            </Channel>
        </Chat>
    )
}