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
  const [channels, setChannels] = useState(null)
  const {currentUser} = getAuth();
  const [token, setToken] = useState("");
  const [client, setClient] = useState(null);

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

  if(!client || !channels) return <Loading/>;

  return (
      <>
      <TopBar/>
      <SideNav/>
      <div style={{paddingTop: "3%", paddingLeft: "10%"}}>
        <CustomChat filters={filters} sort={sort} client={client} channels={channels}/>
      </div>
      </>
    )
}