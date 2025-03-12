import React, { memo } from 'react';
import { useChannelStateContext } from 'stream-chat-react';
import { TypingIndicator } from 'stream-chat-react';
import DefaultIcon from '../../components/DefaultIcon/DefaultIcon';

const CustomChannelHeader = memo((props) => {
  // This will receive all the same props that Stream's ChannelHeader component receives
  console.log('Header props received:', props);
  
  // Destructure the props you need
  const { Avatar, displayImage, displayTitle } = props;
  console.log("display:", displayImage, displayTitle)
  
  return (
    <div className="str-chat__header-livestream">
      <div className="str-chat__header-livestream-left">
        {/* Use the Stream Avatar but style it your way */}
        {displayImage ? <Avatar 
                  image={displayImage} 
                  name={displayTitle} 
                  size={40}
                /> : <DefaultIcon size={35}/>}
        
        <div className="str-chat__header-livestream-info">
          {/* Rest of your header */}
          <p className="str-chat__header-livestream-title">
            {props.displayTitle}
          </p>
        </div>
      </div>
    </div>
  );
});



// Define a very simple custom profile picture component
const CustomPfp = memo(({ displayImage, displayTitle, Avatar }) => {
  // const channelImage = channel?.data?.image;
  // const channelName = channel?.data?.name || '';
  // console.log("channel", channel);
  console.log(displayImage);
  return (
    <div className="custom-profile-picture">
      {displayImage ? <Avatar 
                image={displayImage} 
                name={displayTitle} 
                size={40}
              /> : <DefaultIcon size={35}/>}
    </div>
  );
});

export default CustomChannelHeader;