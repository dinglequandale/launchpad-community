import UserCard from "../Usercard/UserCard";
import "./userwheelview.css";
import { IoIosArrowDropright } from "react-icons/io";
import { IoIosArrowDropleft } from "react-icons/io";

export default function UserWheelView(){
    return(
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "5%"}}>
            <IoIosArrowDropleft size={30} className="scroll"/>
            <div style={{display: "flex", gap: "40px", justifyContent: "center"}}>
                <UserCard/>
                <UserCard/>
                <UserCard/>
            </div>
            <IoIosArrowDropright size={32} className="scroll"/>
        </div>
    )
}