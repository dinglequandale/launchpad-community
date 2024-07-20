import { StreamChat } from 'stream-chat';
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import Loading from '../components/LoadingAnimation/Loading';
import TopBar from '../components/Topbar/TopBar';
import SideNav from '../components/Sidenav/SideNav';
import { CustomChat } from './CustomStream';
import { httpsCallable, getFunctions } from 'firebase/functions';


const apiKey = import.meta.env.VITE_STREAM_API_KEY;


export default function InitializeStream() {
    
    const {currentUser} = getAuth();

    const [token, setToken] = useState("");

    const user = {
        id: currentUser.uid,
        name: "Konrad Tittel",
        image: "/assets/awty-logo.jpg"
    }

    const [client, setClient] = useState(null);

    const filters = {type: "messaging", members: {$in: [currentUser.uid]}};
    const sort = {last_message_at: -1};

    const getToken = async () => {
      const getStreamToken = httpsCallable(getFunctions(),"createStreamToken");
      try {
        const result = await getStreamToken();
        if (result.data && result.data.token) {
          setToken(result.data.token);
        } else {
          console.error('Failed to get token:', result.data);
        }
      } catch (error) {
        console.error('Error getting token:', error);
      }
  
    }
  
    useEffect(()=>{
      getToken();
      const chat = new StreamChat(apiKey);
      if(chat.tokenManager.token === token && chat.userID === user.id){
        return;
      }
      let isInterrupted = false;
      const connectPromise = chat.connectUser({
        id: currentUser.uid,
        name: "Konrad Tittel",
        image: "/assets/awty-logo.jpg"}, token).then(()=>{
          if(isInterrupted) return
          setClient(chat)
        });
      return () => {
        isInterrupted = true;
        setClient(undefined);
        connectPromise.then(()=>{
          chat.disconnectUser();
        })
      }
    }
  // if(streamChat) return () => streamChat.disconnectUser
    , [token, currentUser])

    useEffect(()=>{
    async function init() {
        const chatClient = new StreamChat(apiKey);
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
        <>
        <TopBar/>
        <SideNav/>
        <div style={{paddingTop: "3%", paddingLeft: "10%"}}>
          <CustomChat filters={filters} sort={sort} client={client}/>
        </div>
        </>
    )
}