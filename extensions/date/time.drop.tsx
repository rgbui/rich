import React from "react";


export class TimeDrop extends React.Component<{ moment?: boolean, hour: number, minute: number, second?: number, onChange: (hour: number, minute: number, second?: number) => void }>{
    renderTime() {
        var self = this;
        function renderHours() {
            var as: JSX.Element[] = [];
            for (let i = 0; i < 24; i++) {
                as.push(<a key={'hour' + i} onMouseDown={e => self.setTime(i)} >{i}</a>)
            }
            return as;
        }
        function renderMinutes() {
            var as: JSX.Element[] = [];
            for (let i = 0; i < 60; i++) {
                as.push(<a key={'Minute' + i} onMouseDown={e => self.setTime(undefined, i)}>{i}</a>)
            }
            return as;
        }
        function renderSeconds() {
            var as: JSX.Element[] = [];
            for (let i = 0; i < 60; i++) {
                as.push(<a key={'Second' + i} onMouseDown={e => self.setTime(undefined, undefined, i)}>{i}</a>)
            }
            return as;
        }
        return <>
            <div className='shy-hours'>{renderHours()}</div>
            <div className='shy-minutes'>{renderMinutes()}</div>
            <div className='shy-seconds'>{renderSeconds()}</div>
        </>
    }
    renderMoment() {
        var as: JSX.Element[] = [];
        for (let i = 0; i < 23; i++) {
            as.push(<a key={i} onMouseDown={e => this.setTime(i, 0, 0)}>{i}:00</a>);
            as.push(<a key={i + 'm'} onMouseDown={e => this.setTime(i, 30, 0)}>{i}:30</a>)
        }
        return <div className='shy-moments'>
            {as}
        </div>
    }
    setTime(hour?: number, minute?: number, second?: number) {

    }
    render() {
        return <div className='shy-time-drop'>
            {this.props.moment == true && this.renderMoment()}
            {this.props.moment != true && this.renderTime()}
        </div>
    }
}