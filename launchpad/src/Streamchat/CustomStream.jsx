import {
    Chat,
    Channel,
    Window,
    ChannelHeader,
    MessageList,
    MessageInput,
    Thread,
    ChannelList
  } from "stream-chat-react";
import styled from 'styled-components';
import 'stream-chat-react/dist/css/v2/index.css';
import "./stream_styles.css";
import EmptyState from "./EmptyState";

const ChannelHeaderContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding-top: 5px;
  box-shadow: 2px 0 10px 5px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

const ChatContainer = styled.div`
  display: flex;
  height: 94vh;
  width: 100%;

`;

const ChannelListContainer = styled.div`
  width: 30%;
  max-width: 300px;
  box-shadow: var(--shadowColor);
  z-index: 2;
`;

const ChannelContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChannelPreviewCustom = (props) => {
  const { channel, setActiveChannel } = props;
  const { name = 'Unnamed Channel' } = channel.data || {};

  return (
    <div
      onClick={() => setActiveChannel(channel)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        cursor: 'pointer',
        boxShadow: "var(--shadowColor)",
        width: "90%",
        margin: "0 auto",
        marginTop: "20px",
        borderRadius: "20px",
        zIndex: "1",
        transition: 'background-color 0.3s',
        backgroundColor: "var(--neutral)",
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#e0e0e0',
          zIndex: "2",
          boxShadow: "box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1)",
          marginRight: '10px',
        }}
      />
      <div>
        <div style={{ fontWeight: 'bold' }}>{name}</div>
        <div style={{ fontSize: '0.8em', color: '#888' }}>
          {channel.state.messages[channel.state.messages.length - 1]?.text || 'No messages yet'}
        </div>
      </div>
    </div>
  );
};

export const CustomChat = ({client, filters, sort, channels, activeChannel, setActiveChannel}) => {

  console.log(channels)

  return(
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
              // filters={filters}
              // sort={sort}
              channels={channels}
              options={{ state: true, presence: true, limit: 10 }}
              onSelect={(channel) => {
                setActiveChannel(channel)
              }}
              List={(listProps) => (
                <ChannelList {...listProps} Preview={ChannelPreviewCustom} />
              )}
            />
          )}
        </ChannelListContainer>
        <ChannelContainer>
            {channels.length === 0 ? (
              <EmptyState
                title="No Active Conversation"
                subtitle="Select a contact from the list or start a new conversation."
              />
            ) : (
              <Channel channel={activeChannel}>
              <Window>
                <ChannelHeaderContainer>
                  <ChannelHeader />
                </ChannelHeaderContainer>
                <MessageList />
                <MessageInput />
              </Window>
              </Channel>
            )}
        </ChannelContainer>
    </Chat>
  </ChatContainer>
  )
}