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
import { useState } from "react";

const ChannelHeaderContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding-top: 8px;
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

// const ChannelPreviewCustom = (props) => {
//   const { channel, setActiveChannel, activeChannel } = props;
//   const { name = 'Unnamed Channel' } = channel.data || {};

//   const lastMessage = channel.state.messages[channel.state.messages.length - 1];
//   const [isHovering, setIsHovering] = useState(false);
//   return (
//     <div
//       onClick={
//         () => {
//           setActiveChannel(activeChannel === channel ? null : channel);
//         }
//       }
//       onMouseEnter={()=>setIsHovering(true)}
//       onMouseLeave={()=>setIsHovering(false)}
//       style={{
//         display: 'flex',
//         padding: '10px',
//         cursor: 'pointer',
//         boxShadow: "var(--shadowColor)",
//         width: "90%",
//         margin: "0 auto",
//         marginTop: "20px",
//         borderRadius: "20px",
//         zIndex: "4",
//         height: "60px",
//         overflow: "hidden",
//         transition: 'background-color 0.3s',
//         backgroundColor: `${channel === activeChannel || isHovering ? "#9b7bd4" : "var(--neutral)"}`,
//         color: "var(--primary)",
//       }}
//     >
//       <div
//         style={{
//           width: '40px',
//           height: '40px',
//           borderRadius: '50%',
//           backgroundColor: '#e0e0e0',
//           zIndex: "3",
//           boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
//           marginRight: '10px',
//         }}
//       />
//       <div>
//         <div style={{ fontWeight: 'bold' }}>{name}</div>
//         <div style={{ fontSize: '0.8em', color: '#888' }}>
//           {lastMessage?.text || 'No messages yet'}
//         </div>
//       </div>
//     </div>
//   );
// };

const CustomChannelPreview = ({
  channel,
  activeChannel,
  Avatar,
  displayImage,
  displayTitle,
  lastMessage,
  latestMessage,
}) => {
  const isActive = channel === activeChannel;
  
  return (
    <div 
      className={`custom-channel-preview ${isActive ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: isActive ? '#f0f0f0' : 'white',
        borderBottom: '1px solid #e0e0e0',
        cursor: 'pointer',
      }}
    >
      <div style={{ flexShrink: 0, width: '40px', marginRight: '10px' }}>
        <Avatar 
          image={displayImage} 
          name={displayTitle} 
          size={40}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 'bold',
          marginBottom: '1px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {displayTitle}
        </div>
        <div style={{
          fontSize: '0.9em',
          color: '#888',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {typeof latestMessage === 'string' 
            ? latestMessage 
            : lastMessage?.text || 'No messages yet'}
        </div>
      </div>
    </div>
  );
};


export const CustomChat = ({client, filters, sort, channels, activeChannel}) => {

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
              filters={filters}
              sort={sort}
              options={{ state: true, presence: true, limit: 10 }}
              onSelect={(channel)=>{
                console.log(channel)
              }}
              Preview={CustomChannelPreview}
            />
          )}
        </ChannelListContainer>
        {<ChannelContainer>
              <Channel channel={activeChannel}>
              <Window>
                <ChannelHeaderContainer>
                  <ChannelHeader />
                </ChannelHeaderContainer>
                <MessageList />
                <MessageInput />
              </Window>
              </Channel>
        </ChannelContainer>
      //    : 
      //   <EmptyState
      //   title="No Conversation Selected"
      //   subtitle="Click on a conversation to start chatting!"
      // />
        }
    </Chat>
  </ChatContainer>
  )
}