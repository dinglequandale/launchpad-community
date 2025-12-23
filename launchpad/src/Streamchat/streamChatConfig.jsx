import { StreamChat } from 'stream-chat';
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/auth/AuthContext';
import Loading from '../components/LoadingAnimation/Loading';
import TopBar from '../components/Topbar/TopBar';
import SideNav from '../components/Sidenav/SideNav';
import { CustomChat } from './CustomStream';
import { useLocation, useOutletContext } from 'react-router-dom';
import PageLoading from '../components/LoadingAnimation/PageLoading';
import './stream_styles.css';


// const apiKey = import.meta.env.VITE_STREAM_API_KEY;


export default function InitializeStream() {

  const location = useLocation();
  const selectedChannelId = location.state; // Channel ID passed from navigation

  const [channels, setChannels] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {currentUser} = useAuth();


  const [activeChannel, setActiveChannel] = useState(null);

  const [error, setError] = useState(null);

  const { chatClient, isConnected } = useOutletContext();

  const filters = { type: "messaging", members: { $in: [currentUser.uid] } };
  const sort = { last_message_at: -1 };

  console.log('[InitializeStream] Received channel ID from navigation:', selectedChannelId);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      const isCollapsed = event.detail.isCollapsed;
      setIsSidebarCollapsed(isCollapsed);
    };

    // Initial check - get current state from DOM
    const sidebar = document.querySelector('.v0-sidebar');
    if (sidebar) {
      const isCollapsed = sidebar.classList.contains('v0-sidebar-collapsed');
      setIsSidebarCollapsed(isCollapsed);
    }

    // Listen for custom sidebar toggle events
    window.addEventListener('sidebarToggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);
  // Initialize chat and load channels
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
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message);
      }
    }

    initializeChat();
  }, [currentUser, isConnected, chatClient]);

  // Handle opening a specific channel (from navigation)
  useEffect(() => {
    async function openSpecificChannel() {
      if (!selectedChannelId || !chatClient || !isConnected) {
        console.log('[InitializeStream] Cannot open channel:', { selectedChannelId, chatClient: !!chatClient, isConnected });
        return;
      }

      try {
        console.log('[InitializeStream] Opening channel:', selectedChannelId);
        const channel = chatClient.channel('messaging', selectedChannelId);
        await channel.watch();
        setActiveChannel(channel);
        console.log('[InitializeStream] Channel opened successfully');
      } catch (error) {
        console.error('[InitializeStream] Error opening channel:', error);
      }
    }

    openSpecificChannel();
  }, [selectedChannelId, chatClient, isConnected])

  if(!chatClient || !channels) return ( <PageLoading/> );

  return (
    <>
      <div style={{height: "100vh", overflow: "hidden"}}>
      <TopBar isSidebarCollapsed={isSidebarCollapsed}/>
      <SideNav/>
      <div className={`v0-messages-container ${isSidebarCollapsed ? 'v0-messages-sidebar-collapsed' : 'v0-messages-sidebar-expanded'}`}>
        <CustomChat client={chatClient} channels={channels} initialActiveChannel={activeChannel} filters={filters}/>
      </div>
      </div>
    </>
  )
}