import './FooterContent.css';
import LegalityFooter from './LegalityFooter';
import LegalityGoBack from './LegalityGoBack';

export default function AboutUs() {
    return (
        <>
        <div className="legality-holder">
            <LegalityGoBack />
            <div className="about-us-container">
                <div className="about-us-header">
                    <h2 className="about-us-title">About Us</h2>
                    <p className="about-us-subtitle">Building bridges between students and opportunities</p>
                </div>
                <div className="about-us-content">
                    <p className="about-us-text">
                        We're a group of high school and college students who got tired of seeing 
                        the education system fall short—not because it doesn't try, but because it 
                        forgets what students actually need: real connections.
                    </p>
                    
                    <p className="about-us-text">
                        The reality is, schools today have become more about curriculums than 
                        communities. Even the best schools miss the most powerful learning tool 
                        right in front of them—networks of alumni, parents, and professionals 
                        who want to help but have no way to reach the students who need it most.
                    </p>

                    <p className="about-us-emphasis">That's why we built Launchpad.</p>

                    <p className="about-us-text">
                        Launchpad came from a problem we all experienced: it's really hard to find 
                        the right connection or opportunity to move your career forward—especially 
                        as a high schooler. But underneath that was a bigger issue: the system 
                        wasn't built to make that easy.
                    </p>
                    
                    <p className="about-us-text">So we're changing that.</p>

                    <p className="about-us-mission">
                        Our platform turns every school into a living, breathing network—where 
                        opportunity is just one message away. Because we think schools should do 
                        more than test students. They should launch them into their futures.
                    </p>
                </div>
            </div>
        </div>
        <footer className="landing-footer">
            <LegalityFooter pathName={location.pathname}/>
        </footer>
        </>
    );
}