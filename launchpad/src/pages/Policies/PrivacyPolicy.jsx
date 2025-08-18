import { RiArrowGoBackFill } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom"
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import LegalityGoBack from "../../components/Legality Footer/LegalityGoBack";
import "./policies.css";

export default function PrivacyPolicy() {

    const location = useLocation();
    const navigate = useNavigate();
    const previousTab = location.state;
    console.log(previousTab);

    return(
    <div className="privacyContainer">
    <LegalityGoBack/>
    <main className="policy-main">
        <div className="policy-container">
            <div className="policy-header">
                <h1 className="policy-title">Privacy Policy</h1>
                <p className="policy-date">Last updated: June 10, 2024</p>
            </div>
            
            <div className="policy-content">
                <section className="policy-section">
                    <h2 className="policy-section-title">Definitions</h2>
                    <p className="policy-text">For the purposes of this Privacy Policy, the following terms have the meanings set forth below. Additional definitions may be provided in context.</p>
                    <ul className="policy-list">
                        <li><strong>Personal Data:</strong> Any information relating to an identified or identifiable individual.</li>
                        <li><strong>Service:</strong> The Launchpad platform, website, and related services.</li>
                        <li><strong>User:</strong> Any individual who accesses or uses the Service.</li>
                        <li><strong>Parent/Guardian:</strong> A legal parent or guardian of a minor user.</li>
                        <li><strong>Cookies:</strong> Small data files stored on your device to help websites and apps function and collect information.</li>
                        <li><strong>Data Controller:</strong> The entity that determines the purposes and means of processing personal data.</li>
                        <li><strong>Data Processor:</strong> An entity that processes personal data on behalf of the Data Controller.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">1. Who Are We?</h2>
                    <p className="policy-text">
                        Launchpad (the "Company", "we", "us", or "our") is the data controller for your personal data collected via our platform and website. For privacy-related inquiries, contact us at <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a>.
                    </p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">2. How Do We Collect Your Data?</h2>
                    <p className="policy-text">We collect information about you when you:</p>
                    <ul className="policy-list">
                        <li>Register for or use our services/platform</li>
                        <li>Fill in forms or contact us</li>
                        <li>Communicate with us via email or other channels</li>
                        <li>Interact with us via third-party social media services</li>
                        <li>Use our website or platform (automatically via cookies, analytics, and similar technologies)</li>
                        <li>Are referred to us by third parties (e.g., your school, parent, or other community members)</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">3. What Data Do We Collect?</h2>
                    <p className="policy-text">We collect both personal and non-personal data, including but not limited to:</p>
                    <ul className="policy-list">
                        <li>Name, email address, and contact information</li>
                        <li>Account credentials and profile information</li>
                        <li>School affiliation, role (student, parent, etc.), and community membership</li>
                        <li>Usage data (IP address, device info, browser type, time spent, etc.)</li>
                        <li>Communications and content you submit (messages, posts, feedback, etc.)</li>
                        <li>Information from third-party social media services (if you connect them)</li>
                        <li>Payment or billing information (if applicable)</li>
                        <li>Other data you choose to provide</li>
                    </ul>
                    <p className="policy-text"><strong>Do not submit sensitive personal data</strong> (such as government IDs, full credit card numbers, or medical records) unless explicitly requested and protected by law.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">4. Legal Basis for Processing</h2>
                    <p className="policy-text">We process your personal data based on:</p>
                    <ul className="policy-list">
                        <li>Performance of a contract (e.g., providing our services to you)</li>
                        <li>Your consent (e.g., for marketing or optional features)</li>
                        <li>Our legitimate interests (e.g., improving our services, security, community management)</li>
                        <li>Compliance with legal obligations</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">5. How Do We Use Your Data?</h2>
                    <ul className="policy-list">
                        <li>To provide, maintain, and improve our services</li>
                        <li>To manage your account and access to the platform</li>
                        <li>To communicate with you (including support, updates, and marketing, where permitted)</li>
                        <li>To personalize your experience and content</li>
                        <li>To analyze usage and improve our platform (including via analytics and cookies)</li>
                        <li>To comply with legal obligations and enforce our terms</li>
                        <li>For security, fraud prevention, and community safety</li>
                        <li>For business transfers (e.g., merger, acquisition)</li>
                        <li>For other purposes with your consent</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">6. Sharing Your Data</h2>
                    <p className="policy-text">We may share your data with:</p>
                    <ul className="policy-list">
                        <li>Service providers (hosting, analytics, communications, payment processors, etc.)</li>
                        <li>Affiliates and business partners (as needed to provide services)</li>
                        <li>Other users (when you interact in public areas or share content)</li>
                        <li>Third parties as required by law or to protect rights, safety, or property</li>
                        <li>In connection with business transfers (merger, acquisition, etc.)</li>
                        <li>With your consent or at your direction</li>
                    </ul>
                    <p className="policy-text">We require third parties to protect your data and only use it for specified purposes. We do not sell your personal data.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">7. International Data Transfers</h2>
                    <p className="policy-text">Your data may be transferred to and processed in countries outside your own, including the United States. We implement safeguards (such as standard contractual clauses or other legal mechanisms) to protect your data in accordance with applicable law.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">8. Data Retention</h2>
                    <p className="policy-text">We retain your personal data only as long as necessary for the purposes described in this policy, to comply with legal obligations, resolve disputes, and enforce agreements. Criteria for retention include the type of data, purpose of collection, and legal requirements. You may request deletion of your data as described below.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">9. Your Rights</h2>
                    <p className="policy-text">Depending on your location and applicable law, you may have the right to:</p>
                    <ul className="policy-list">
                        <li>Access your personal data</li>
                        <li>Correct or update your data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to or restrict processing</li>
                        <li>Withdraw consent at any time (where processing is based on consent)</li>
                        <li>Request data portability</li>
                    </ul>
                    <p className="policy-text">To exercise your rights, contact us at <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a>. Parents or legal guardians may exercise these rights on behalf of minors.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">10. Security</h2>
                    <p className="policy-text">We use industry-standard technical and organizational measures to protect your personal data, including encryption, access controls, and regular security reviews. However, no method of transmission or storage is 100% secure.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">11. Data Breach Notification</h2>
                    <p className="policy-text">In the event of a data breach that affects your personal data, we will notify you and relevant authorities as required by law, including the nature of the breach, the data affected, and steps you can take to protect yourself.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">12. Automated Decision-Making and Profiling</h2>
                    <p className="policy-text">We do not use your personal data for automated decision-making or profiling that produces legal or similarly significant effects, unless we have obtained your explicit consent or as otherwise permitted by law. If this changes, we will update this policy and notify you as required.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">13. Children's Privacy</h2>
                    <p className="policy-text">Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers.</p>
                    <p className="policy-text">If we need to rely on consent as a legal basis for processing your information and your country requires consent from a parent, we may require your parent's consent before we collect and use that information.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">Special Notice for Minors and Parents</h2>
                    <p className="policy-text">
                        If you are under the age of 18, you may use our Service only with the involvement and consent of a parent or legal guardian. We encourage parents and guardians to monitor their children's use of the Service and to help enforce this Privacy Policy by instructing their children never to provide personal information without their permission.
                    </p>
                    <p className="policy-text">
                        If you are a parent or guardian and believe that your child under 18 has provided us with personal information without your consent, please contact us at <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a>. We will take steps to delete such information from our records as soon as possible.
                    </p>
                    <p className="policy-text">
                        Parents and legal guardians have the right to review, correct, or request deletion of their child's personal information. To exercise these rights, please contact us at <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a>.
                    </p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">14. State-Specific Rights (California and Others)</h2>
                    <p className="policy-text">If you are a resident of California or another state with specific privacy rights, you may have additional rights regarding your personal data, including the right to know, access, delete, and opt out of the sale or sharing of your personal information. To exercise these rights, please contact us at <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a>. We do not sell your personal information.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">15. Complaints and Dispute Resolution</h2>
                    <p className="policy-text">If you have concerns about our privacy practices, please contact us at <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a>. If you are not satisfied with our response, you may have the right to lodge a complaint with your local data protection authority or seek other remedies under applicable law.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">16. Links to Other Websites</h2>
                    <p className="policy-text">Our Service may contain links to other websites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">17. Changes to this Privacy Policy</h2>
                    <p className="policy-text">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and, where appropriate, by email or a prominent notice on our Service at least 30 days before changes take effect. The "Last updated" date at the top of this Privacy Policy will be revised accordingly. If you object to the changes, you may close your account before the new effective date to have your data deleted.</p>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">18. Contact Us</h2>
                    <p className="policy-text">If you have any questions about this Privacy Policy or your data, you can contact us:</p>
                    <ul className="policy-list">
                        <li>By email: <a href="mailto:support@launchpadhouston.com" className="policy-link">support@launchpadhouston.com</a></li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2 className="policy-section-title">19. Effective Date and Version History</h2>
                    <p className="policy-text">This Privacy Policy is effective as of January 24, 2025. Previous versions are available upon request.</p>
                </section>
            </div>
        </div>
    </main>
    <footer className="landing-footer">
        <LegalityFooter pathName={location.pathname}/>
    </footer>
    </div>
    )
}