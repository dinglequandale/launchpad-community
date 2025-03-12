import { memo, useCallback } from "react";
import DefaultIcon from "../../components/DefaultIcon/DefaultIcon";

// Memoize the channel preview component to prevent unnecessary re-renders
export const CustomChannelPreview = memo(({
  channel,
  activeChannel,
  Avatar,
  setActiveChannel,
  latestMessage,
  lastMessage,
  displayImage,
  displayTitle
}) => {
  const isActive = channel?.cid === activeChannel?.cid;
  
  const handleClick = useCallback(() => {
    if (setActiveChannel && channel) {
      setActiveChannel(channel);
    }
  }, [channel, setActiveChannel]);
  
  return (
    <div
      onClick={handleClick}
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
        {displayImage ? <Avatar 
          image={displayImage} 
          name={displayTitle} 
          size={40}
        /> : <DefaultIcon size={35}/>}
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
});