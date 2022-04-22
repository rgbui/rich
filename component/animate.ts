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