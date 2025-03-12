export const createCustomStylesheet = () => {
    // These are the variables you can customize
    const customStyles = {
      // Message input styling
      messageInputBorderColor: '#FF6B6B', // Change this to your desired border color
      messageInputBorderColorFocus: '#FF8787', // Change this to your desired focus border color
      messageInputBackground: '#FFFFFF',
      
      // File upload button styling
      fileUploadButtonColor: 'red', // Change this to your desired file upload button color
      fileUploadButtonHoverColor: 'red', // Change this to your desired file upload button hover color
      
      // Send button styling
      // sendButtonColor: 'var(--accent)', // Change this to your desired send button color
      // sendButtonHoverColor: 'var(--secondaryHighlight)', // Change this to your desired send button hover color
      
      // Message styling
      myMessageBackgroundColor: 'var(--highlight)', // Change this to your desired sent message background color
      otherMessageBackgroundColor: 'var(--secondaryHighlight)', // Change this to your desired received message background color
      
      // Avatar styling
      avatarBorderColor: 'var(--dark)',
      myAvatarBorderColor: 'var(--secondaryHighlight)', // Change this to your desired avatar border color
    };
  
    return `
      /* Message Input Styling */
      .str-chat__input {
        border: 3px solid ${customStyles.messageInputBorderColor} !important;
        background: ${customStyles.messageInputBackground} !important;
        transition: border-color 0.2s ease !important;
      }
      
      .str-chat__input-flat:focus-within {
        border-color: ${customStyles.messageInputBorderColorFocus} !important;
      }
      
      /* File Upload Button Styling */
      .str-chat__input-flat-fileupload {
        position: relative;
      }
      
      .str-chat__input-flat-fileupload svg {
        fill: ${customStyles.fileUploadButtonColor} !important;
        
      }
      
      .str-chat__input-flat-fileupload:hover svg {
        fill: ${customStyles.fileUploadButtonHoverColor} !important;
      }
      
      /* Send Button Styling */
      .str-chat__send-button {
        background-color: ${customStyles.sendButtonColor} !important;
        transition: background-color 0.2s ease !important;
      }
      
      .str-chat__send-button:hover {
        background-color: ${customStyles.sendButtonHoverColor} !important;
        box-shadow: var(--shadowColor);
      }
      
      .str-chat__send-button svg {
        fill: red;
      }
      
      /* Styling message containers */
      .str-chat__message--me .str-chat__message-text {
        background-color: ${customStyles.myMessageBackgroundColor} !important;
        color: white !important;
        border-radius: 15px;
      }
      
      .str-chat__message--other .str-chat__message-text {
        background-color: ${customStyles.otherMessageBackgroundColor} !important;
        color: #333 !important;
        border-radius: 15px;
      }
      
      /* Avatar styling */
      .str-chat__avatar {
        border-radius: 12px !important;
        // border: 2px solid ${customStyles.avatarBorderColor} !important;
      }
      
      .str-chat__message--me .str-chat__avatar {
        border-color: ${customStyles.myAvatarBorderColor} !important;
      }
      
      /* Message header styling */
      .str-chat__message-header {
        margin-bottom: 6px !important;
      }
      
      .str-chat__message-header-name {
        font-weight: 600 !important;
        font-size: 14px !important;
      }
    `;
  };