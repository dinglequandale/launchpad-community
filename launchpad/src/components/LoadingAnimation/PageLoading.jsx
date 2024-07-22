import Loading from "./Loading";

export default function PageLoading() {
    return(
        <div style={{position: "absolute", transform: "translateY(35%)", width: "100%", height: "100%"}}>
        <div style={{display: "flex", justifyContent: "center"}}>
        <img src="assets/launchpad_logo.png" alt="" style={{width: "500px"}}/>
        </div>
        <Loading/>
      </div>
    )
}