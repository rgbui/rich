import React from "react";
export class DateDrop extends React.Component<{ year: number, month: number }> {
    constructor(props) {
        super(props);
        this.currentScrollYear = this.props.year;
        this.currentYear = this.props.year;
        this.currentMonth = this.props.month;
    }
    onWheel(e: React.WheelEvent<HTMLDivElement>) {

    }
    private currentScrollYear: number = new Date().getFullYear();
    private currentYear: number;
    private currentMonth: number;
    private expandYears: number[] = [];
    onToggleYear(year: number) {
        if (this.expandYears.includes(year)) this.expandYears.remove(g => g === year)
        else this.expandYears.push(year);
        this.forceUpdate()
    }
    renderYears() {
        var d = 20;
        var years: JSX.Element[] = [];
        var self = this;
        var renderMonths = (year: number) => {
            var as: JSX.Element[] = [];
            for (let i = 0; i < 12; i++) {
                as.push(<a className={self.currentYear == year && self.currentMonth == i ? "hover" : ""} key={year.toString() + i.toString()}>{i + 1}</a>)
            }
            return as;
        }
        for (let i = this.currentScrollYear - d; i < this.currentScrollYear + d; i++) {
            var style = { top: this.currentScrollYear * 25 };
            <div className={'shy-date-ym-drop-year' + (this.currentYear == i ? " hover" : "")} style={style}>
                <a onMouseDown={e => this.onToggleYear(i)}>{i}</a>
                {this.expandYears.includes(i) && <div className='shy-date-ym-drop-year-months'>
                    {renderMonths(i)}
                </div>}
            </div>
        }
        return years;
    }
    render() {
        return <div className='shy-date-ym-drop' onWheel={e => this.onWheel(e)}>
            {this.renderYears()}
        </div>
    }
}