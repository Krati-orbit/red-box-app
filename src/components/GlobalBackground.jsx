import React from 'react';
import Cubes from './Cubes';

export default function GlobalBackground() {
    return (
        <div className="global-bg-wrapper">
            <Cubes
                gridSize={12}
                maxAngle={30}
                radius={4}
                borderStyle="var(--cube-border)"
                faceColor="transparent"
                rippleColor="var(--cube-ripple)"
                rippleSpeed={1}
                autoAnimate={true}
                rippleOnClick={true}
                global={true}
            />
        </div>
    );
}
