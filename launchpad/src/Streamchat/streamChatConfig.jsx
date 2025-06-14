import { StreamChat } from 'stream-chat';
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/auth/AuthContext';
import Loading from '../components/LoadingAnimation/Loading';
import TopBar from '../components/Topbar/TopBar';
import SideNav from '../components/Sidenav/SideNav';
import { CustomChat } from './CustomStream';
import { useLocation, useOutletContext } from 'react-router-dom';
import PageLoading from '../components/LoadingAnimation/PageLoading';


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
        const channel = chatClient.channel('messaging', channelId);
        
        await channel.watch();
  
        setActiveChannel(channel);
      } catch (error) {
        console.error('Error opening channel:', error);
      }
  
    }

    if(selectedConnection){
      setExistingChannel(selectedConnection);
    }
  },[selectedConnection])

  if(!chatClient || !channels) return ( <PageLoading/> );

  return (
      <div style={{maxHeight: "100%"}}>
      <TopBar/>
      <SideNav/>
      <div style={{paddingTop: "5%", paddingLeft: "10%"}}>
        <CustomChat client={chatClient} channels={channels} initialActiveChannel={activeChannel} filters={filters}/>
      </div>
      </div>
    )
}