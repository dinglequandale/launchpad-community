import { useLocation, useNavigate } from "react-router-dom";
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import LegalityGoBack from "../../components/Legality Footer/LegalityGoBack";

export default function Terms(){

    const location = useLocation();
    const navigate = useNavigate();
    const previousTab = location.state;

    return(
    <div className="termsContainer">
    <body>
        <LegalityGoBack/>
        <main>
        <div class="container">
            <h1>Terms and Conditions</h1>
            <p>Last updated: November 25, 2024</p>
            <section>
                <h3>1. Introduction</h3>
                <p>Welcome to Launchpad, an online platform that connects high school students with mentors, professionals, and alumni to help them achieve their academic and career goals. By using this website and the services provided, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree, please discontinue the use of Launchpad.</p>
            </section>
            <section>
                <h3>2. User Eligibility</h3>
                <p>Launchpad is available to high school students, professionals, mentors, and alumni who are interested in fostering a productive network for career and educational growth. Users must:</p>
                <ul>
                    <li>Be at least 13 years old. If under the age of majority in your jurisdiction, you must have parental or legal guardian consent.</li>
                    <li>Provide accurate information during registration, including a valid email address and relevant details about your profile.</li>
                    <li>Comply with all applicable laws and regulations while using our platform.</li>
                </ul>
                <p>We reserve the right to deny access to users who fail to meet these criteria.</p>
            </section>
            <section>
                <h3>3. Account Responsibilities</h3>
                <p>You are solely responsible for maintaining the confidentiality of your account credentials, including your password, and for all activities carried out under your account. You agree to:</p>
                <ul>
                    <li>Notify Launchpad immediately of any unauthorized use of your account or any other security breach.</li>
                    <li>Ensure that all account information is up-to-date and accurate.</li>
                    <li>Refrain from sharing your login credentials with anyone else.</li>
                </ul>
                <p>Failure to uphold these responsibilities may result in suspension or termination of your account.</p>
            </section>
            <section>
                <h3>4. Usage of Services</h3>
                <p>Launchpad provides a platform for students to connect with mentors and explore career development opportunities. By using our services, you agree to:</p>
                <ul>
                    <li>Engage respectfully and professionally with other users.</li>
                    <li>Use the platform solely for its intended purpose of networking, mentorship, and learning.</li>
                    <li>Refrain from engaging in harmful activities such as spamming, harassment, or disseminating false information.</li>
                </ul>
                <p>Any misuse of the platform, including attempts to exploit or disrupt its services, may result in immediate removal and potential legal action.</p>
            </section>
            <section>
                <h3>5. Privacy Policy</h3>
                <p>We prioritize the privacy of our users. Your personal information is collected, stored, and processed in accordance with our Privacy Policy. This includes:</p>
                <ul>
                    <li>Information collected during registration, such as your name, email address, and profile details.</li>
                    <li>How we use this information to connect you with relevant opportunities and mentors.</li>
                    <li>Your rights regarding data access, correction, and deletion.</li>
                </ul>
                <p>For more details, please review our full <a href="/privacy">Privacy Policy</a>.</p>
            </section>
            <section>
                <h3>6. Limitations of Liability</h3>
                <p>While we strive to provide a reliable and secure platform, Launchpad and its affiliates cannot be held liable for:</p>
                <ul>
                    <li>Any interruptions or errors in the operation of the platform.</li>
                    <li>Losses or damages arising from reliance on information or connections made through the platform.</li>
                    <li>Unlawful or unauthorized activities carried out by other users.</li>
                </ul>
                <p>Use of the platform is at your own risk, and you agree to indemnify Launchpad against any claims or damages resulting from your use of the services.</p>
            </section>
            <section>
                <h3>7. Termination</h3>
                <p>Launchpad reserves the right to suspend or terminate your account at any time if you violate these Terms and Conditions or engage in behavior that we deem harmful to the community. Upon termination:</p>
                <ul>
                    <li>Your access to the platform and services will be revoked.</li>
                    <li>We may retain certain information as required by law or for legitimate business purposes.</li>
                </ul>
                <p>If you wish to close your account voluntarily, please contact us at <a href="mailto:launchpadhelpline@gmail.com">launchpadhelpline@gmail.com</a>.</p>
            </section>
            <section>
                <h3>8. Modifications</h3>
                <p>We may revise these Terms and Conditions from time to time to reflect changes in our services, policies, or legal requirements. When updates are made:</p>
                <ul>
                    <li>The "Last updated" date at the top of this page will be revised.</li>
                    <li>Significant changes will be communicated to you through email or notifications on the platform.</li>
                    <li>Your continued use of the platform signifies acceptance of the updated terms.</li>
                </ul>
            </section>
            <p>If you have any questions or concerns about these Terms and Conditions, please reach out to us at <a href="mailto:launchpadhelpline@gmail.com">launchpadhelpline@gmail.com</a>.</p>
        </div>
        </main>
        <footer className="landing-footer">
            <LegalityFooter pathName={location.pathname}/>
        </footer>
        </body>
        </div>
    )
}