import "./loading.css";

export default function Loading({style={}, size=null}){
    return(
        <div className="loading-spinner-container" style={style}>
            <div className="loading-spinner" style={{width: size && `${size}px`, height: size && `${size}px`}}>
                <div className="spinner-accent"></div>
            </div>
        </div>
    )
}