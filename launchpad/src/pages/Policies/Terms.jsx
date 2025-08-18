import { useLocation, useNavigate } from "react-router-dom";
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import LegalityGoBack from "../../components/Legality Footer/LegalityGoBack";
import "./policies.css";

export default function Terms(){

    const location = useLocation();
    const navigate = useNavigate();
    const previousTab = location.state;

    return(
    <div className="termsContainer" style={{marginTop: "70px"}}>
    <body>
        <LegalityGoBack/>
        <main className="policy-main">
            <div className="policy-container">
                <div className="policy-header">
                    <h1 className="policy-title">Terms and Conditions</h1>
                    <p className="policy-date">Last updated: January 24, 2025</p>
                </div>
                
                <div className="policy-content">
                    <section className="policy-section">
                        <h2 className="policy-section-title">Definitions</h2>
                        <p className="policy-text">For the purposes of these Terms and Conditions, the following terms have the meanings set forth below. Additional definitions may be provided in context.</p>
                        <ul className="policy-list">
                            <li><strong>"Service"</strong> means the Launchpad platform, website, and related services.</li>
                            <li><strong>"User"</strong> means any individual who accesses or uses the Service.</li>
                            <li><strong>"Account"</strong> means a registered user profile on the Service.</li>
                            <li><strong>"Content"</strong> means any information, data, text, images, or other materials uploaded, posted, or transmitted via the Service.</li>
                            <li><strong>"Minor"</strong> means any user under the age of 18.</li>
                            <li><strong>"Parent/Guardian"</strong> means a legal parent or guardian of a minor user.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">1. Acceptance of Terms</h2>
                        <p className="policy-text">By accessing or using the Service, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree, you must discontinue use of the Service immediately. If you are under the age of majority in your jurisdiction, you represent that you have obtained parental or legal guardian consent to use the Service.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">2. User Eligibility and Parental Consent</h2>
                        <p className="policy-text">The Service is available to high school students, professionals, mentors, and alumni. Users must:</p>
                        <ul className="policy-list">
                            <li>Be at least 13 years old. If under the age of majority in your jurisdiction, you must have parental or legal guardian consent.</li>
                            <li>Provide accurate and complete information during registration.</li>
                            <li>Comply with all applicable laws and regulations while using the Service.</li>
                        </ul>
                        <p className="policy-text">We reserve the right to deny or terminate access to users who fail to meet these criteria or who provide false information.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">3. Account Security and Responsibilities</h2>
                        <p className="policy-text">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:</p>
                        <ul className="policy-list">
                            <li>Notify Launchpad immediately of any unauthorized use of your account or any other security breach.</li>
                            <li>Ensure that all account information is up-to-date and accurate.</li>
                            <li>Refrain from sharing your login credentials with anyone else.</li>
                        </ul>
                        <p className="policy-text">Failure to uphold these responsibilities may result in suspension or termination of your account.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">4. Acceptable Use and Prohibited Conduct</h2>
                        <p className="policy-text">By using the Service, you agree to:</p>
                        <ul className="policy-list">
                            <li>Engage respectfully and professionally with other users.</li>
                            <li>Use the Service solely for its intended purpose of networking, mentorship, and learning.</li>
                            <li>Refrain from engaging in harmful activities such as spamming, harassment, or disseminating false information.</li>
                            <li>Not upload, post, or transmit any content that is unlawful, offensive, or infringes on the rights of others.</li>
                            <li>Not attempt to gain unauthorized access to the Service or its related systems or networks.</li>
                            <li>Not use the Service for any commercial purpose without our express written consent.</li>
                        </ul>
                        <p className="policy-text">Any misuse of the Service may result in immediate removal and potential legal action.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">5. Minor Safety and Appropriate Interactions</h2>
                        <p className="policy-text">Launchpad is committed to maintaining a safe environment for all users, particularly minors. The following guidelines must be strictly followed:</p>
                        <ul className="policy-list">
                            <li>All interactions between minors and adults must be professional and focused on academic or career development.</li>
                            <li>Adults must not request or share personal contact information with minors outside the platform.</li>
                            <li>Any inappropriate behavior, including but not limited to harassment, grooming, or attempts to establish non-professional relationships with minors, will result in immediate account termination and may be reported to law enforcement.</li>
                            <li>Minors are encouraged to report any uncomfortable interactions to their school administrators or through our reporting system.</li>
                            <li>Parents and legal guardians have the right to monitor their child's account activity and can request account termination at any time.</li>
                        </ul>
                        <p className="policy-text">By using Launchpad, you acknowledge and agree to these safety guidelines and understand that violation may result in legal consequences.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">6. Privacy and Data Use</h2>
                        <p className="policy-text">Your personal information is collected, stored, and processed in accordance with our <a href="/privacy" className="policy-link">Privacy Policy</a>. This includes:</p>
                        <ul className="policy-list">
                            <li>Information collected during registration, such as your name, email address, and profile details.</li>
                            <li>How we use this information to connect you with relevant opportunities and mentors.</li>
                            <li>Your rights regarding data access, correction, and deletion.</li>
                        </ul>
                        <p className="policy-text">For more details, please review our full <a href="/privacy" className="policy-link">Privacy Policy</a>.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">7. Intellectual Property</h2>
                        <p className="policy-text">All content, trademarks, logos, and intellectual property on the Service are the property of Launchpad or its licensors. You may not use, reproduce, or distribute any content from the Service without our express written permission, except as permitted by law or for your personal, non-commercial use.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">8. Disclaimers and Limitation of Liability</h2>
                        <p className="policy-text">While we strive to provide a reliable and secure platform, Launchpad and its affiliates cannot be held liable for:</p>
                        <ul className="policy-list">
                            <li>Any interruptions or errors in the operation of the platform.</li>
                            <li>Losses or damages arising from reliance on information or connections made through the platform.</li>
                            <li>Unlawful or unauthorized activities carried out by other users.</li>
                        </ul>
                        <p className="policy-text">Use of the platform is at your own risk, and you agree to indemnify Launchpad against any claims or damages resulting from your use of the services.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">9. Indemnification</h2>
                        <p className="policy-text">You agree to indemnify, defend, and hold harmless Launchpad, its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or expenses (including attorney's fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of another.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">10. Termination</h2>
                        <p className="policy-text">Launchpad reserves the right to suspend or terminate your account at any time if you violate these Terms and Conditions or engage in behavior that we deem harmful to the community. Upon termination:</p>
                        <ul className="policy-list">
                            <li>Your access to the platform and services will be revoked.</li>
                            <li>We may retain certain information as required by law or for legitimate business purposes.</li>
                        </ul>
                        <p className="policy-text">If you wish to close your account voluntarily, please contact us at <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a>.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">11. Governing Law and Dispute Resolution</h2>
                        <p className="policy-text">These Terms and Conditions are governed by the laws of the State of Texas, United States, without regard to its conflict of law principles. Any disputes arising from or relating to these Terms or the Service shall be resolved through good faith negotiations. If a resolution cannot be reached, the dispute shall be submitted to binding arbitration in Harris County, Texas, except where prohibited by law. You waive any right to participate in class actions or jury trials.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">12. Modifications</h2>
                        <p className="policy-text">We may revise these Terms and Conditions from time to time to reflect changes in our services, policies, or legal requirements. When updates are made:</p>
                        <ul className="policy-list">
                            <li>The "Last updated" date at the top of this page will be revised.</li>
                            <li>Significant changes will be communicated to you through email or notifications on the platform.</li>
                            <li>Your continued use of the platform signifies acceptance of the updated terms.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">13. Contact Information</h2>
                        <p className="policy-text">If you have any questions or concerns about these Terms and Conditions, please reach out to us at <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a>.</p>
                    </section>

                    <section className="policy-section">
                        <h2 className="policy-section-title">14. Effective Date and Version History</h2>
                        <p className="policy-text">These Terms and Conditions are effective as of January 24, 2025. Previous versions are available upon request.</p>
                    </section>
                </div>
            </div>
        </main>
        <footer className="landing-footer">
            <LegalityFooter pathName={location.pathname}/>
        </footer>
    </body>
    </div>
    )
}