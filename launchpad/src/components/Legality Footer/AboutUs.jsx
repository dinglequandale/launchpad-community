import './footer_content.css';
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
                        We're a team of high school and college students who grew tired of watching 
                        the education system fall short—not because it doesn't try, but because it 
                        forgets what students really need: connection.
                    </p>
                    
                    <p className="about-us-text">
                        The truth is, schools today have been reduced to curriculums instead of 
                        communities. Even the best institutions overlook the most powerful learning 
                        tool sitting right in front of them—networks of alumni, parents, and 
                        professionals who are willing to help, but have no way to reach the 
                        students who need it most.
                    </p>

                    <p className="about-us-emphasis">That's why we built Launchpad.</p>

                    <p className="about-us-text">
                        Launchpad was born from one problem we all experienced firsthand: it's 
                        incredibly hard to find the right connection or opportunity to further 
                        your career—especially as a high schooler. But beneath that was a deeper 
                        issue: the system wasn't designed to make that easy.
                    </p>
                    
                    <p className="about-us-text">So we're changing that.</p>

                    <p className="about-us-mission">
                        Our platform transforms every school into a living, breathing network—where 
                        opportunity is just one message away. Because we believe schools should do 
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