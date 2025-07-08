import { useNavigate } from "react-router-dom";

import { SocialIcon } from "react-social-icons";
import 'react-social-icons/instagram';
import 'react-social-icons/youtube';

export default function LegalityFooter({pathname = null}){

    const navigate = useNavigate();

    return(<>
    <div className="footer-content">
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li><a href="/about-us">About Us</a></li>
              {/* <li><a href="#careers">Careers</a></li> */}
              {/* <li><a href="#press">Press</a></li> */}
            </ul>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              {/* <li><a href="#blog">Blog</a></li> */}
              <li><a href="/faqs">FAQ</a></li>
              <li><a href="/faqs">Support</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Legal</h3>
            <ul>
            <li><a onClick={() => {
                navigate("/terms");
                window.scrollTo(0, 0);
              }}>Terms of Service</a></li>
              <li><a onClick={() => {
                navigate("/privacy");
                window.scrollTo(0, 0);
              }}>Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Connect</h3>
            <div className="social-icons" style={{display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "20px"}}>
              <SocialIcon url="https://www.youtube.com"/>
              <SocialIcon url="https://www.instagram.com"/>
            </div>
          </div>
        </div>
        <p className="copyright">&copy; 2024 Launchpad. All rights reserved.</p>
    </>)
}