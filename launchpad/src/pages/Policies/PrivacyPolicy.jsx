import { RiArrowGoBackFill } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom"
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import LegalityGoBack from "../../components/Legality Footer/LegalityGoBack";

export default function PrivacyPolicy() {

    const location = useLocation();
    const navigate = useNavigate();
    const previousTab = location.state;
    console.log(previousTab);

    return(
    <div className="privacyContainer">
    <LegalityGoBack/>
    <main style={{margin: "70px 200px"}}>
    <h1>Privacy Policy</h1>
    <p>Last updated: June 10, 2024</p>
    <h2>Definitions</h2>
    <p>For the purposes of this Privacy Policy, the following terms have the meanings set forth below. Additional definitions may be provided in context.</p>
    <ul>
      <li><strong>Personal Data:</strong> Any information relating to an identified or identifiable individual.</li>
      <li><strong>Service:</strong> The Launchpad platform, website, and related services.</li>
      <li><strong>User:</strong> Any individual who accesses or uses the Service.</li>
      <li><strong>Parent/Guardian:</strong> A legal parent or guardian of a minor user.</li>
      <li><strong>Cookies:</strong> Small data files stored on your device to help websites and apps function and collect information.</li>
      <li><strong>Data Controller:</strong> The entity that determines the purposes and means of processing personal data.</li>
      <li><strong>Data Processor:</strong> An entity that processes personal data on behalf of the Data Controller.</li>
    </ul>
    <h2>1. Who Are We?</h2>
    <p>
      Launchpad (the "Company", "we", "us", or "our") is the data controller for your personal data collected via our platform and website. For privacy-related inquiries, contact us at <a href="mailto:support@launchpadhouston.com">support@launchpadhouston.com</a>.
    </p>
    <h2>2. How Do We Collect Your Data?</h2>
    <p>We collect information about you when you:</p>
    <ul>
      <li>Register for or use our services/platform</li>
      <li>Fill in forms or contact us</li>
      <li>Communicate with us via email or other channels</li>
      <li>Interact with us via third-party social media services</li>
      <li>Use our website or platform (automatically via cookies, analytics, and similar technologies)</li>
      <li>Are referred to us by third parties (e.g., your school, parent, or other community members)</li>
    </ul>
    {/* <h2>Cookies and Tracking Technologies</h2>
    <p>We use cookies and similar tracking technologies to collect and store information about your use of our Service, to enable essential features, analyze usage, and personalize your experience. You can manage your cookie preferences through your browser settings. For more details, please see our <a href="#">Cookie Policy</a>.</p> */}
    <h2>3. What Data Do We Collect?</h2>
    <p>We collect both personal and non-personal data, including but not limited to:</p>
    <ul>
      <li>Name, email address, and contact information</li>
      <li>Account credentials and profile information</li>
      <li>School affiliation, role (student, parent, etc.), and community membership</li>
      <li>Usage data (IP address, device info, browser type, time spent, etc.)</li>
      <li>Communications and content you submit (messages, posts, feedback, etc.)</li>
      <li>Information from third-party social media services (if you connect them)</li>
      <li>Payment or billing information (if applicable)</li>
      <li>Other data you choose to provide</li>
    </ul>
    <p><strong>Do not submit sensitive personal data</strong> (such as government IDs, full credit card numbers, or medical records) unless explicitly requested and protected by law.</p>
    <h2>4. Legal Basis for Processing</h2>
    <p>We process your personal data based on:</p>
    <ul>
      <li>Performance of a contract (e.g., providing our services to you)</li>
      <li>Your consent (e.g., for marketing or optional features)</li>
      <li>Our legitimate interests (e.g., improving our services, security, community management)</li>
      <li>Compliance with legal obligations</li>
    </ul>
    <h2>5. How Do We Use Your Data?</h2>
    <ul>
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
    <h2>6. Sharing Your Data</h2>
    <p>We may share your data with:</p>
    <ul>
      <li>Service providers (hosting, analytics, communications, payment processors, etc.)</li>
      <li>Affiliates and business partners (as needed to provide services)</li>
      <li>Other users (when you interact in public areas or share content)</li>
      <li>Third parties as required by law or to protect rights, safety, or property</li>
      <li>In connection with business transfers (merger, acquisition, etc.)</li>
      <li>With your consent or at your direction</li>
    </ul>
    <p>We require third parties to protect your data and only use it for specified purposes. We do not sell your personal data.</p>
    <h2>7. International Data Transfers</h2>
    <p>Your data may be transferred to and processed in countries outside your own, including the United States. We implement safeguards (such as standard contractual clauses or other legal mechanisms) to protect your data in accordance with applicable law.</p>
    <h2>8. Data Retention</h2>
    <p>We retain your personal data only as long as necessary for the purposes described in this policy, to comply with legal obligations, resolve disputes, and enforce agreements. Criteria for retention include the type of data, purpose of collection, and legal requirements. You may request deletion of your data as described below.</p>
    <h2>9. Your Rights</h2>
    <p>Depending on your location and applicable law, you may have the right to:</p>
    <ul>
      <li>Access your personal data</li>
      <li>Correct or update your data</li>
      <li>Request deletion of your data</li>
      <li>Object to or restrict processing</li>
      <li>Withdraw consent at any time (where processing is based on consent)</li>
      <li>Request data portability</li>
    </ul>
    <p>To exercise your rights, contact us at <a href="mailto:support@launchpadhouston.com">support@launchpadhouston.com</a>. Parents or legal guardians may exercise these rights on behalf of minors.</p>
    <h2>10. Security</h2>
    <p>We use industry-standard technical and organizational measures to protect your personal data, including encryption, access controls, and regular security reviews. However, no method of transmission or storage is 100% secure.</p>
    <h2>11. Data Breach Notification</h2>
    <p>In the event of a data breach that affects your personal data, we will notify you and relevant authorities as required by law, including the nature of the breach, the data affected, and steps you can take to protect yourself.</p>
    <h2>12. Automated Decision-Making and Profiling</h2>
    <p>We do not use your personal data for automated decision-making or profiling that produces legal or similarly significant effects, unless we have obtained your explicit consent or as otherwise permitted by law. If this changes, we will update this policy and notify you as required.</p>
    <h2>13. Children's Privacy</h2>
    <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers.</p>
    <p>If we need to rely on consent as a legal basis for processing your information and your country requires consent from a parent, we may require your parent's consent before we collect and use that information.</p>
    <h2>Special Notice for Minors and Parents</h2>
    <p>
      If you are under the age of 18, you may use our Service only with the involvement and consent of a parent or legal guardian. We encourage parents and guardians to monitor their children's use of the Service and to help enforce this Privacy Policy by instructing their children never to provide personal information without their permission.
    </p>
    <p>
      If you are a parent or guardian and believe that your child under 18 has provided us with personal information without your consent, please contact us at <a href="mailto:support@launchpadhouston.com">support@launchpadhouston.com</a>. We will take steps to delete such information from our records as soon as possible.
    </p>
    <p>
      Parents and legal guardians have the right to review, correct, or request deletion of their child’s personal information. To exercise these rights, please contact us at <a href="mailto:support@launchpadhouston.com">support@launchpadhouston.com</a>.
    </p>
    <h2>14. State-Specific Rights (California and Others)</h2>
    <p>If you are a resident of California or another state with specific privacy rights, you may have additional rights regarding your personal data, including the right to know, access, delete, and opt out of the sale or sharing of your personal information. To exercise these rights, please contact us at <a href="mailto:support@launchpadhouston.com">support@launchpadhouston.com</a>. We do not sell your personal information.</p>
    <h2>15. Complaints and Dispute Resolution</h2>
    <p>If you have concerns about our privacy practices, please contact us at <a href="mailto:support@launchpadhouston.com">support@launchpadhouston.com</a>. If you are not satisfied with our response, you may have the right to lodge a complaint with your local data protection authority or seek other remedies under applicable law.</p>
    <h2>16. Links to Other Websites</h2>
    <p>Our Service may contain links to other websites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
    <h2>17. Changes to this Privacy Policy</h2>
    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and, where appropriate, by email or a prominent notice on our Service at least 30 days before changes take effect. The "Last updated" date at the top of this Privacy Policy will be revised accordingly. If you object to the changes, you may close your account before the new effective date to have your data deleted.</p>
    <h2>18. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy or your data, you can contact us:</p>
    <ul>
      <li>By email: <a href="mailto:support@launchpadhouston.com">support@launchpadhouston.com</a></li>
      {/* <li>By mail: [Insert Full Legal Entity Name and Address]</li> */}
    </ul>
    <h2>19. Effective Date and Version History</h2>
    <p>This Privacy Policy is effective as of January 24, 2025. Previous versions are available upon request.</p>
    </main>
    <footer className="landing-footer">
        <LegalityFooter pathName={location.pathname}/>
    </footer>
    </div>
    )
}