import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  ChannelList,
  MessageSimple
} from "stream-chat-react";
import styled from 'styled-components';
import 'stream-chat-react/dist/css/v2/index.css';
import "./stream_styles.css";
import EmptyState from "./EmptyState";
import { useState, useEffect } from "react";
// import DefaultIcon from "../components/DefaultIcon/DefaultIcon";
import { createCustomStylesheet } from "./Stream Components/ChatStyleSheet";
import { CustomChannelPreview } from "./Stream Components/CustomChannelPreview";
import CustomChannelHeader from "./Stream Components/CustomChannelHeader";
import { Avatar as StreamAvatar } from 'stream-chat-react';


// Styled components for custom elements
const ChannelHeaderContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding-top: 0px;
  box-shadow: 2px 0 10px 5px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

const ChatContainer = styled.div`
  display: flex;
  height: 90vh;
  width: 100%;
`;

const ChannelListContainer = styled.div`
  width: 30%;
  max-width: 300px;
  // box-shadow: var(--shadowColor);
  z-index: 2;
`;

const ChannelContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 5px;
`;

// Add display name for memo component
CustomChannelPreview.displayName = 'CustomChannelPreview';

// Create a stylesheet with your custom styles

export const CustomChat = ({ client, filters, sort, channels, activeChannel: initialActiveChannel }) => {
  const [activeChannel, setActiveChannel] = useState(initialActiveChannel);
  
  // Update active channel when prop changes
  useEffect(() => {
    if (initialActiveChannel && initialActiveChannel !== activeChannel) {
      setActiveChannel(initialActiveChannel);
    }
  }, [initialActiveChannel, activeChannel]);

  // Inject custom CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = createCustomStylesheet();
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <ChatContainer>
      <Chat client={client} theme="messaging light">
        <ChannelListContainer>
          {channels.length === 0 ? (
            <EmptyState
              title="No Contacts Yet"
              subtitle="Start a conversation or add a new contact to begin chatting."
            />
          ) : (
            <ChannelList
              filters={filters}
              sort={sort}
              options={{ state: true, presence: true, limit: 10 }}
              Preview={(previewProps) => (
                <CustomChannelPreview 
                  {...previewProps} 
                  activeChannel={activeChannel}
                  setActiveChannel={setActiveChannel}
                />
              )}
            />
          )}
        </ChannelListContainer>
        
        <ChannelContainer>
          {activeChannel ? (
            <Channel 
              channel={activeChannel}
              Message={MessageSimple} // Using default MessageSimple, but styled via CSS
            >
              <Window>
                <ChannelHeaderContainer>
                  <ChannelHeader 
                />
                </ChannelHeaderContainer>
                <MessageList />
                <MessageInput />
              </Window>
            </Channel>
          ) : (
            <EmptyState
              title="No Conversation Selected"
              subtitle="Click on a conversation to start chatting!"
            />
          )}
        </ChannelContainer>
      </Chat>
    </ChatContainer>
  );
};