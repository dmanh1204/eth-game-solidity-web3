// import React from 'react'
// import "./colors";
// import "./Car.css";

// const SoldCar = ({ sellCar, levelUp, handleSelectCar, selectedCar}) => {
//     const { id, name, color: _colors, level, ready} = sellCar;
//     const rect = ( _colors % 7) + 1;
//     const front = ( _colors % 4) + 1;
//     const hood = ( _colors % 5) + 1;
//     const window = ( _colors % 3) + 1;
//     const f_hood = ( _colors % 2) + 1;
//     const wheel_border = ( _colors % 4) + 1;
//     return (
//         <>
//             <div>
//                 <div id="car" className={!selectedCar.includes(id) ? "inselect" : "select"} onClick={() =>handleSelectCar(id)}>
//                     <div className="rect" style={{ background: colors.rect[rect] }}></div>
//                     <div className="front" style={{ background: colors.front[front] }}>
//                         <div className="window" style={{ background: colors.window[window] }}></div>
//                         <div className="f_hood" style={{ background: colors.f_hood[f_hood] }}></div>
//                     </div>
//                     <div className="tyres" style={{ background: colors.wheel_border[wheel_border] }}></div>
//                     <div className="f_tyres" style={{ background: colors.wheel_border[wheel_border] }}></div>
//                     <div className="ff_tyres" style={{ background: colors.wheel_border[wheel_border] }}></div>
//                     <div className="hood" style={{ background: colors.hood[hood] }}></div>
//                 </div>
//                 <div style={{width: "212px"}}>
//                     <p>{name}</p>
//                     <p>{level}</p>
//                     <button onClick={() => (levelUp(id, level))}>Up level!</button>
//                 </div>
//             </div>
//         </>
//     )
// }

// export default SoldCar
