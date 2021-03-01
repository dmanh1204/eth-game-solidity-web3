import React, { useState, useEffect } from 'react'
import "./Car.css";
import colors from "./colors";

const Car = ({ car }) => {
    const { id, name, color: _colors, level, ready} = car;
    console.log(id, name, level, ready);
    const rect = ( _colors % 7) + 1;
    const front = ( _colors % 4) + 1;
    const hood = ( _colors % 5) + 1;
    const window = ( _colors % 3) + 1;
    const f_hood = ( _colors % 2) + 1;
    const wheel_border = ( _colors % 4) + 1;
    return (
        <>
            <div id="car">
                <div class="rect" style={{ background: colors.rect[rect] }}></div>
                <div class="front" style={{ background: colors.front[front] }}>
                    <div class="window" style={{ background: colors.window[window] }}></div>
                    <div class="f_hood" style={{ background: colors.f_hood[f_hood] }}></div>
                </div>
                <div class="tyres" style={{ background: colors.wheel_border[wheel_border] }}></div>
                <div class="f_tyres" style={{ background: colors.wheel_border[wheel_border] }}></div>
                <div class="ff_tyres" style={{ background: colors.wheel_border[wheel_border] }}></div>
                <div class="hood" style={{ background: colors.hood[hood] }}></div>
            </div>
            <div>
                <button></button>
            </div>
        </>
    )
}

export default Car
