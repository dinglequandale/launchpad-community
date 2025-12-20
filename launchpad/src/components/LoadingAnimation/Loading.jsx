import "./Loading.css";

export default function Loading({style={}, size=40, className="", inline=false}){
    return(
        <div className={`loading-spinner-container ${inline ? 'loading-inline' : ''} ${className}`} style={style}>
            <div className="loading-spinner" style={{width: `${size}px`, height: `${size}px`}}>
                <div className="spinner-ring"></div>
            </div>
        </div>
    )
}