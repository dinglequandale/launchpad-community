import "./Loading.css";

export default function Loading({style={}, size=30, className=""}){
    return(
        <div className={`loading-spinner-container ${className}`} style={style}>
            <div className="loading-spinner" style={{width: size && `${size}px`, height: size && `${size}px`}}>
                <div className="spinner-accent"></div>
            </div>
        </div>
    )
}