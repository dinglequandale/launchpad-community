import "./connectionbanner.css";

export default function ConnectionBanner(userData){
    let txtAvailability = "internships";
    return(
        <div className="bannerContainer">
            <div className="banner"> 
                <span className="bannerTxt">Open to {txtAvailability}</span>
            </div>
        </div>
    )
}