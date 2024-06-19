import UserCard from "../Usercard/UserCard";
import "./userwheelview.css";
import { IoIosArrowDropright } from "react-icons/io";
import { IoIosArrowDropleft } from "react-icons/io";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import ProfileCard from "../Profilecard/ProfileCard";
import { useState, useEffect } from "react";

export default function UserWheelView({userNetworkData}){

  const [profileCardVisibility, setProfileCardVisibility] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", onKeyPress, true)
  }, [])

  const onKeyPress = (e) => {
    if(e.key === "Escape"){
      setProfileCardVisibility(false);
    }
  }

  const handleOnProfileClick = () => {
    setProfileCardVisibility(true);
  }

    const settings = {
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            centerPadding: '0px'
          };
        
                //     centerMode: true,
        //     centerPadding: '0px',
          return (
            <>
            {profileCardVisibility && <ProfileCard onClose={()=>setProfileCardVisibility(false)}/>}
            <div style={{width: "80%", margin: "0 auto"}}>
              <Slider {...settings}>
                {userNetworkData.map((profile) => (
                        <UserCard key={profile.id} userData={profile} onProfileClick={handleOnProfileClick} />
                        ))}
              </Slider>
            </div>
          </>
    )
}