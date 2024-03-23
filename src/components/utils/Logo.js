import React from 'react';

const Logo = ({fontSize, color, text}) => {
    return (
        <>
            <span style={{ color: "#0267C1", fontFamily: "Poppins", fontSize: fontSize }}>
                <h2>N</h2>
            </span>
            <span style={{ color: color, fontFamily: "Poppins", fontSize: fontSize }}>
                <h2>euttron {text}</h2>
            </span>
        </>
    )
}

export default Logo