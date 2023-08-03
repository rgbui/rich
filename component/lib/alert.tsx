

var alertEle: HTMLElement;
var time;
export function ShyAlert(msg: string, level?: 'success' | 'info' | 'fail' | 'warn' | 'load', ti?: number) {
    if (!alertEle) {
        alertEle = document.createElement('div');
        alertEle.classList.add('shy-alert');
        alertEle.innerHTML = `<div class='shy-alert-msg'>${msg}</div>`;
        document.body.appendChild(alertEle);
    }
    alertEle.style.display = 'block';
    alertEle.classList.add('shy-alert-' + (level || 'info'));
    alertEle.querySelector('.shy-alert-msg').innerHTML = msg;
    if (!time) { clearTimeout(time); time = null; }
    time = setTimeout(() => {
        alertEle.style.display = 'none';
        alertEle.setAttribute('class', 'shy-alert')
    },ti || 3e3);
}

export function CloseShyAlert() {
    if (!time) { clearTimeout(time); time = null; }
    alertEle.style.display = 'none';
    alertEle.setAttribute('class', 'shy-alert')
}



