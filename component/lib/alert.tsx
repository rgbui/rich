

var alertEle: HTMLElement;
var time;
export function ShyAlert(msg: string, level?: 'success' | 'info' | 'fail' | 'warn' | 'load') {
    if (!alertEle) {
        alertEle = document.createElement('div');
        alertEle.classList.add('.shy-alert');
        alertEle.innerHTML = `<div className='shy-alert-msg'>${msg}</div>`;
        document.body.appendChild(alertEle);
    }
    alertEle.style.display = 'block';
    alertEle.querySelector('.shy-alert-msg').innerHTML = msg;
    if (!time) { clearTimeout(time); time = null; }
    time = setTimeout(() => {
        alertEle.style.display = 'none';
    },3e3);
}



