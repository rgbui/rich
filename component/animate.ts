import 'animate.css';



/***
 * 
 * 
 * @url https://animate.style/
 */
export enum AnimateCommand {
    // Attention seekers
    bounce,
    flash,
    pulse,
    rubberBand,
    shakeX,
    shakeY,
    headShake,
    swing,
    tada,
    wobble,
    jello,
    heartBeat,
    // Back entrances
    backInDown,
    backInLeft,
    backInRight,
    backInUp,
    // Back exits
    backOutDown,
    backOutLeft,
    backOutRight,
    backOutUp,
    // Bouncing entrances
    bounceIn,
    bounceInDown,
    bounceInLeft,
    bounceInRight,
    bounceInUp,
    // Bouncing exits
    bounceOut,
    bounceOutDown,
    bounceOutLeft,
    bounceOutRight,
    bounceOutUp,
    // Fading entrances
    fadeIn,
    fadeInDown,
    fadeInDownBig,
    fadeInLeft,
    fadeInLeftBig,
    fadeInRight,
    fadeInRightBig,
    fadeInUp,
    fadeInUpBig,
    fadeInTopLeft,
    fadeInTopRight,
    fadeInBottomLeft,
    fadeInBottomRight,
    // Fading exits
    fadeOut,
    fadeOutDown,
    fadeOutDownBig,
    fadeOutLeft,
    fadeOutLeftBig,
    fadeOutRight,
    fadeOutRightBig,
    fadeOutUp,
    fadeOutUpBig,
    fadeOutTopLeft,
    fadeOutTopRight,
    fadeOutBottomRight,
    fadeOutBottomLeft,
    // Flippers
    flip,
    flipInX,
    flipInY,
    flipOutX,
    flipOutY,
    Lightspeed,
    lightSpeedInRight,
    lightSpeedInLeft,
    lightSpeedOutRight,
    lightSpeedOutLeft,
    // Rotating entrances
    rotateIn,
    rotateInDownLeft,
    rotateInDownRight,
    rotateInUpLeft,
    rotateInUpRight,
    // Rotating exits
    rotateOut,
    rotateOutDownLeft,
    rotateOutDownRight,
    rotateOutUpLeft,
    rotateOutUpRight,
    // Specials,
    hinge,
    jackInTheBox,
    rollIn,
    rollOut,
    // Zooming entrances
    zoomIn,
    zoomInDown,
    zoomInLeft,
    zoomInRight,
    zoomInUp,
    // Zooming exits
    zoomOut,
    zoomOutDown,
    zoomOutLeft,
    zoomOutRight,
    zoomOutUp,
    // Sliding entrances
    slideInDown,
    slideInLeft,
    slideInRight,
    slideInUp,
    // Sliding exits,,
    slideOutDown,
    slideOutLeft,
    slideOutRight,
    slideOutUp,
}

export const AnimateCSS = (node: HTMLElement, animation: AnimateCommand, prefix = 'animate__') =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        if (typeof animation == 'number') {
            animation = AnimateCommand[animation] as any;
        }
        const animationName = `${prefix}${animation}`;
        node.classList.add(`${prefix}animated`, animationName);
        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }
        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });