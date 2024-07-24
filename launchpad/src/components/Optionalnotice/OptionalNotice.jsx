export default function OptionalNotice({bottomSpacing="-6px"}) {
    return(
    <div style={{right: "0", bottom: {bottomSpacing}, position: "absolute"}}>
        <span style={{color: "var(--secondary)"}}>(optional)</span>
    </div>
    )
}