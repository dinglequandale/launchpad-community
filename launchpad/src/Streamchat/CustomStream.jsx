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
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 1;
`;

const ChatContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  max-height: calc(100vh - 80px);
`;

const ChannelListContainer = styled.div`
  width: 300px;
  min-width: 300px;
  flex-shrink: 0;
  z-index: 2;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    display: ${props => props.$hideOnMobile ? 'none' : 'block'};
  }
`;

const ChannelContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
    display: ${props => props.$hideOnMobile ? 'none' : 'flex'};
  }
`;

const MobileBackButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: none;
    border-bottom: 1px solid #e5e7eb;
    color: #1157e2;
    cursor: pointer;
    padding: 12px 16px;
    font-weight: 500;
    font-size: 14px;
    transition: background 0.2s ease;

    &:hover {
      background: #f9fafb;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
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

  const handleBackToChannelList = () => {
    setActiveChannel(null);
  };

  return (
    <ChatContainer>
      <Chat client={client} theme="messaging light">
        <ChannelListContainer $hideOnMobile={!!activeChannel}>
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

        <ChannelContainer $hideOnMobile={!activeChannel}>
          {activeChannel ? (
            <Channel
              channel={activeChannel}
              Message={MessageSimple} // Using default MessageSimple, but styled via CSS
            >
              <Window>
                <MobileBackButton onClick={handleBackToChannelList}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Conversations
                </MobileBackButton>
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