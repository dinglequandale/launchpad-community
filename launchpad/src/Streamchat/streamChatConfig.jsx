import { StreamChat } from 'stream-chat';
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/auth/AuthContext';
import Loading from '../components/LoadingAnimation/Loading';
import TopBar from '../components/Topbar/TopBar';
import SideNav from '../components/Sidenav/SideNav';
import { CustomChat } from './CustomStream';
import { useLocation, useOutletContext } from 'react-router-dom';


// const apiKey = import.meta.env.VITE_STREAM_API_KEY;


export default function InitializeStream() {

  const location = useLocation();
  const selectedConnection = location.state;

  const [channels, setChannels] = useState(null)
  const {currentUser} = useAuth();


  const [activeChannel, setActiveChannel] = useState(null);
  
  const [error, setError] = useState(null);

  const { chatClient, isConnected } = useOutletContext();

  const filters = { type: "messaging", members: { $in: [currentUser.uid] } };
  const sort = { last_message_at: -1 };
  useEffect(() => {
    async function initializeChat() {
      if (!currentUser || !isConnected) {
        console.log("i'm disconnected")
        return;
      }

      try {
        
        const channelResponse = await chatClient.queryChannels(filters, sort, {
          watch: true,
          state: true,
        });

        console.log("Channels response:", channelResponse);
        setChannels(channelResponse);

        if (selectedConnection) {
          const channel = chatClient.channel('messaging', selectedConnection);
          await channel.watch();
          setActiveChannel(channel);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message);
      }
    }

    initializeChat();
  }, [currentUser, isConnected, chatClient]);


  useEffect(()=>{
    async function setExistingChannel(channelId){
      try {
        // Get the channel using the ID

        const channel = chatClient.channel('messaging', channelId);
        
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

  if(!chatClient || !channels) return (
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
        <CustomChat client={chatClient} channels={channels} activeChannel={activeChannel} filters={filters}/>
      </div>
      </>
    )
}