import { useState } from 'react';
import './footer_content.css';
import LegalityGoBack from './LegalityGoBack';
import LegalityFooter from './LegalityFooter';

export default function FAQs() {
    const [openFAQs, setOpenFAQs] = useState({});

    const toggleFAQ = (index) => {
        setOpenFAQs(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const faqData = [
        {
            question: "How does Launchpad work?",
            answer: [
                "After signing up and verifying your connection to a school, you join that school's private network. From there, you can connect with verified students, alumni, and parents by browsing profiles or using our advanced search filters based on interests, colleges, and more.",
                "Your profile is only visible to other members of your school's network—not the public or other schools. You can choose to be contacted through the platform or include contact info like your email or LinkedIn. Whether you're seeking or offering advice, mentorship, or opportunities, Launchpad makes it easy to connect with people—from your school community—who genuinely want to learn from you and vice versa."
            ]
        },
        {
            question: "What kind of opportunities can I post or find?",
            answer: ["You can view and/or post job, internship, shadowing, or volunteer opportunities."]
        },
        {
            question: "Do I have to be very active in offering internships to participate?",
            answer: ["Not at all. You choose your level of involvement—whether that's answering one message a month or offering an internship."]
        },
        {
            question: "Is Launchpad free to use?",
            answer: ["Yes! There's no cost for individuals to join or use Launchpad."]
        },
        {
            question: "What are some of the features I can expect to find on my school's Launchpad network?",
            answer: [
                "Your school's network is split into 4 tabs: the resource tab, the network tab, the opportunities tab, and the messaging tab. Key features include:",
                "• Profile Matching: Toggle with our advanced search filters to find students, alumni, and professionals who share your college and work interests.",
                "• Direct Messaging and Convenient Application Process: Start conversations in-platform or via email, using our recommended networking scripts.",
                "• Academic & Career Resources: Access reputed resources regarding networking, career & personality exploration, resume-building, and SAT/ACT prep.",
                "• Initiative Generator: Create and publish opportunity cards in our organization hub.",
                "• Networking Commitment: Professionals indicate their level of networking commitment on their profiles."
            ]
        },
        {
            question: "What does Launchpad look like?",
            answer: ["Check out our onboarding video: [insert onboarding video]"]
        },
        {
            question: "How is my data stored?",
            answer: ["Your data is securely stored with Google Firebase. Each school's network is kept completely separate to ensure privacy. We only store basic info like your name, email, LinkedIn (if added), and any opportunities you choose to share—nothing sensitive or personal beyond that."]
        },
        {
            question: "How are users vetted?",
            answer: ["All users must verify their connection to a school through invite codes or google authorization. This ensures only real students, alumni, and parents join. We also monitor activity to prevent impersonation or misuse."]
        },
        {
            question: "Can I connect with all users?",
            answer: ["No—Launchpad is private and school-specific. You can only connect with verified members of your own school's network."]
        },
        {
            question: "How can I stay safe when talking to strangers?",
            answer: ["At the end of the day, though only verified users in your school can contact you, these alumni and parents are still strangers. Do your own due diligence: check their LinkedIn, tell a trusted adult if you are meeting up with them, cross-check if their internship postings are real on google, etc... Keep conversations on-platform, and report anything suspicious—we're here to help."]
        }
    ];

    return (
        <>
        <div className='legality-holder'>
            <LegalityGoBack />
            <div className="faq-container">
                <h2>FAQs</h2>
                <div className="faq-list">
                    {faqData.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <div 
                                className="faq-question" 
                                onClick={() => toggleFAQ(index)}
                            >
                                <h3>{faq.question}</h3>
                                <span className={`plus-icon ${openFAQs[index] ? 'open' : ''}`}>+</span>
                            </div>
                            {openFAQs[index] && (
                                <div className="faq-answer">
                                    {faq.answer.map((paragraph, pIndex) => (
                                        <p key={pIndex}>{paragraph}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <footer className="landing-footer">
            <LegalityFooter/>
      </footer>
        </>
    );
}