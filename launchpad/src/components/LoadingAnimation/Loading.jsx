import "./loading.css";

export default function Loading({style={}}){
    return(
        <div className="loading-spinner-container" style={style}>
            <div className="loading-spinner">
                <div className="spinner-accent"></div>
            </div>
        </div>
    )
}