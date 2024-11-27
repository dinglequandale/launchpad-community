import { useState, useRef, useEffect } from 'react';
import Loading from '../LoadingAnimation/Loading';

export default function SecurityCodeInput({onSubmit}) {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
    
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    // Handle input change for each box
    const handleChange = (index, value) => {
        const sanitizedValue = value.slice(-1).toUpperCase();
        
        const newCode = [...code];
        newCode[index] = sanitizedValue;
        setCode(newCode);

        if (sanitizedValue && index < 7) {
        inputRefs[index + 1].current.focus();
        }
    };

    // Handle keydown for backspace functionality
    const handleKeyDown = (index, event) => {
        // Move focus back and clear current input on backspace
        if (event.key === 'Backspace' && !code[index] && index > 0) {
        inputRefs[index - 1].current.focus();
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        const fullCode = code.join('');
        if (fullCode.length === 8) {
        console.log('Security Code Submitted:', fullCode);

        await onSubmit(fullCode);
        } else {
        alert('Please complete the entire security code');
        }
        setIsSubmitting(false);
    };

    return (
        <div>
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputContainer}>
            {code.map((digit, index) => (
                <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                    ...styles.input,
                    ...(document.activeElement === inputRefs[index].current 
                    ? styles.inputFocus 
                    : {})
                }}
                />
            ))}
            </div>
            <span className="onboardingQuestion" style={{color: "black"}}>Please enter the security code sent by your school.</span>
            <button 
            type="submit" 
            disabled={isSubmitting || code.join('').length < 8}
            className='continueButton'
            style={{background: (isSubmitting || code.join('').length < 8) ? "gray" : "", cursor: (isSubmitting || code.join('').length < 8) ? "not-allowed" : ""}}
            >
            {!isSubmitting ? "Submit Code" : <Loading size={25}/>}
            </button>
        </form>
        </div>
    );
};

// Embedded CSS styles as a JavaScript object
const styles = {
  container: {
    maxWidth: '28rem',
    margin: '0 auto',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif'
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textAlign: 'center',
    color: '#2c3e50'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  input: {
    width: '2.5rem',
    height: '3rem',
    textAlign: 'center',
    fontSize: '1.25rem',
    border: '2px solid #e0e0e0',
    borderRadius: '0.375rem',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)'
  },
  submitButton: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  }
};