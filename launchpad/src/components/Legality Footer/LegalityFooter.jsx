import { useNavigate } from "react-router-dom";

import { SocialIcon } from "react-social-icons";
import 'react-social-icons/instagram';
import 'react-social-icons/youtube';

export default function LegalityFooter({pathName}){

    const navigate = useNavigate();

    return(<>
    <div className="footer-content">
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li><a href="#about">About Us</a></li>
              {/* <li><a href="#careers">Careers</a></li> */}
              {/* <li><a href="#press">Press</a></li> */}
            </ul>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              {/* <li><a href="#blog">Blog</a></li> */}
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Legal</h3>
            <ul>
            <li><a onClick={() => {
                navigate("/terms", {state: pathName});
              }}>Terms of Service</a></li>
              <li><a onClick={() => {
                navigate("/privacy", {state: pathName});
              }}>Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Connect</h3>
            <div className="social-icons">
              <SocialIcon url="www.youtube.com"/>
              <SocialIcon url="www.instagram.com"/>
            </div>
          </div>
        </div>
        <p className="copyright">&copy; 2024 Launchpad. All rights reserved.</p>
    </>)
}