import { StreamChat } from 'stream-chat';
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import Loading from '../components/LoadingAnimation/Loading';
import TopBar from '../components/Topbar/TopBar';
import SideNav from '../components/Sidenav/SideNav';
import { CustomChat } from './CustomStream';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useLocation } from 'react-router-dom';


const apiKey = import.meta.env.VITE_STREAM_API_KEY;


export default function InitializeStream() {

  const location = useLocation();
  const selectedConnection = location.state;

  const [channels, setChannels] = useState(null)
  const {currentUser} = getAuth();
  const [token, setToken] = useState("");
  const [client, setClient] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);

  const user = {
      id: currentUser.uid,
      name: "Konrad Tittel",
      image: "/assets/awty-logo.jpg"
  }

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

  const filters = {type: "messaging", members: {$in: [currentUser.uid]}};
  const sort = {last_message_at: -1};

  useEffect(()=>{
    async function init(){
      await getToken();
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
      console.log("Wassup")
      
      const channels = await chat.queryChannels(filters, sort);
      setChannels(channels);
      return () => {
        isInterrupted = true;
        setClient(undefined);
        connectPromise.then(()=>{
          chat.disconnectUser();
        })
      }
    }

    init();
  }
// if(streamChat) return () => streamChat.disconnectUser
  , [token, currentUser])
  useEffect(()=>{
    async function setExistingChannel(channelId){
      try {
        // Get the channel using the ID
        const chat = new StreamChat(apiKey);

        const channel = client.channel('messaging', channelId);
        
        // Watch the channel to receive real-time updates
        await channel.watch();
        
        // Set it as the active channel
        setActiveChannel(channel);
      } catch (error) {
        console.error('Error opening channel:', error);
        // Handle error (e.g., channel not found)
      }
  
    }

    if(selectedConnection){
      setExistingChannel(selectedConnection);
    }
  },[selectedConnection])

  if(!client || !channels) return (
  <div style={{position: "absolute", transform: "translateY(35%)", width: "100%", height: "100%"}}>
    <div style={{display: "flex", justifyContent: "center"}}>
    <img src="assets/launchpad_logo.png" alt="" style={{width: "500px"}}/>
    </div>
    <Loading/>
  </div>
);

  return (
      <>
      <TopBar/>
      <SideNav/>
      <div style={{paddingTop: "3%", paddingLeft: "10%"}}>
        <CustomChat filters={filters} sort={sort} client={client} channels={channels} activeChannel={activeChannel}/>
      </div>
      </>
    )
}