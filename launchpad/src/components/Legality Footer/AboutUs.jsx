import './footer_content.css';
import LegalityFooter from './LegalityFooter';
import LegalityGoBack from './LegalityGoBack';

export default function AboutUs() {
    return (
        <div className="legality-holder">
            <LegalityGoBack />
            <div className="about-us-container">
                <h2>About Us</h2>
                <div className="about-us-content">
                    <p>
                        We're a team of high school and college students who grew tired of watching 
                        the education system fall short—not because it doesn't try, but because it 
                        forgets what students really need: connection.
                    </p>
                    
                    <p>
                        The truth is, schools today have been reduced to curriculums instead of 
                        communities. Even the best institutions overlook the most powerful learning 
                        tool sitting right in front of them—networks of alumni, parents, and 
                        professionals who are willing to help, but have no way to reach the 
                        students who need it most.
                    </p>

                    <p className="emphasis">That's why we built Launchpad.</p>

                    <p>
                        Launchpad was born from one problem we all experienced firsthand: it's 
                        incredibly hard to find the right connection or opportunity to further 
                        your career—especially as a high schooler. But beneath that was a deeper 
                        issue: the system wasn't designed to make that easy.
                    </p>
                    
                    <p>So we're changing that.</p>

                    <p className="mission-statement">
                        Our platform transforms every school into a living, breathing network—where 
                        opportunity is just one message away. Because we believe schools should do 
                        more than test students. They should launch them into their futures.
                    </p>
                </div>
            </div>
            <LegalityFooter/>
        </div>
    );
}