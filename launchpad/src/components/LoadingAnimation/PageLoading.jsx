import Loading from "./Loading";

export default function PageLoading() {
    return(
        <div style={{width: "100vw", height: "100vh"}}>
        <div style={{position: "absolute", top: "0", bottom: "0", marginTop: "auto", marginBottom: "auto", height: "200px",
          left: "0", right: "0", marginLeft: "auto", marginRight: "auto"
        }}>
          <div style={{display: "flex", justifyContent: "center"}}>
            <img src="assets/launchpad_logo.png" alt="" style={{width: "500px"}}/>
          </div>
          <Loading/>
        </div>
      </div>
    )
}