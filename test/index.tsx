




import React from 'react';
import ReactDOM from 'react-dom';
import '../index';
import './index.less';

import { Segment, ShyPath, ShySvg } from '../src/block/svg';
import { Point, Rect } from '../src/common/vector/point';
import { loadPaper } from '../src/paper';


function pc(path) {
    var segs = path.segments;
    var sp = new ShyPath();
    sp.closed = path.closed
    for (var i = 0; i < segs.length; i++) {
        var se = segs[i];
        var sc = new Segment();
        sc.point = new Point(se.point.x, se.point.y);
        if (se.handleIn && !(se.handleIn.x == 0 && se.handleIn.y == 0)) {
            sc.handleIn = new Point(sc.point.x + se.handleIn.x, sc.point.y + se.handleIn.y);
        }
        if (se.handleOut && !(se.handleOut.x == 0 && se.handleOut.y == 0)) {
            sc.handleOut = new Point(sc.point.x + se.handleOut.x, sc.point.y + se.handleOut.y);
        }
        sp.segments.push(sc);
    }
    return sp;
}


async function load(svg) {
    var pa = await loadPaper();
    var project: paper.Project = new pa.Project();
    project.importSVG(svg);
    var items = project.getItems({ class: pa.Path });
    if (items.length == 0) {
        var shapes = project.getItems({ class: pa.Shape }) as any;
        shapes.remove(g => g.type == 'rectangle');
        items = [shapes[0].toPath()];
    }
    var path = (items[0] as any)
    var bound = path.bounds;
    var ss = new ShySvg();
    ss.viewBox = new Rect(bound.x, bound.y, bound.width, bound.height);
    ss.childs.push(pc((items[0] as any)));
    // sg.paths.push(pc((items[1] as any)));
    // sg.paths.push(pc((items[2] as any)));

    // var segs = path.segments;
    // var sp = new ShyPath();
    // sg.paths.push(sp);
    // sp.closed = (items[0] as any).closed
    // for (var i = 0; i < segs.length; i++) {
    //     var se = segs[i];
    //     var sc = new Segment();
    //     sc.point = new Point(se.point.x, se.point.y);
    //     if (se.handleIn && !(se.handleIn.x == 0 && se.handleIn.y == 0)) {
    //         sc.handleIn = new Point(sc.point.x + se.handleIn.x, sc.point.y + se.handleIn.y);
    //     }
    //     if (se.handleOut && !(se.handleOut.x == 0 && se.handleOut.y == 0)) {
    //         sc.handleOut = new Point(sc.point.x + se.handleOut.x, sc.point.y + se.handleOut.y);
    //     }
    //     sp.segments.push(sc);
    // }
    console.log(JSON.stringify(ss.get()));
    console.log((items[0] as any).segments);
    ReactDOM.render(<div><div dangerouslySetInnerHTML={{ __html: svg }}></div>{ss.render()}</div>, document.body.appendChild(document.createElement('div')));
}

window.onload = function () {
    load(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
    <path data-stroke-as-fill-style="placeholder" fill="black" d="M13 12C12.3786 11.5347 11.8742 10.9309 11.527 10.2365C11.1798 9.54212 10.9994 8.77634 11 8V5C11 4.46957 10.7893 3.96086 10.4142 3.58579C10.0391 3.21071 9.53043 3 9 3H8C7.73478 3 7.48043 2.89464 7.29289 2.70711C7.10536 2.51957 7 2.26522 7 2C7 1.73478 7.10536 1.48043 7.29289 1.29289C7.48043 1.10536 7.73478 1 8 1H9C10.0609 1 11.0783 1.42143 11.8284 2.17157C12.5786 2.92172 13 3.93913 13 5V8C13 8.79565 13.3161 9.55871 13.8787 10.1213C14.4413 10.6839 15.2044 11 16 11C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071C16.5196 12.8946 16.2652 13 16 13C15.2044 13 14.4413 13.3161 13.8787 13.8787C13.3161 14.4413 13 15.2044 13 16V19C13 20.0609 12.5786 21.0783 11.8284 21.8284C11.0783 22.5786 10.0609 23 9 23H8C7.73478 23 7.48043 22.8946 7.29289 22.7071C7.10536 22.5196 7 22.2652 7 22C7 21.7348 7.10536 21.4804 7.29289 21.2929C7.48043 21.1054 7.73478 21 8 21H9C9.53043 21 10.0391 20.7893 10.4142 20.4142C10.7893 20.0391 11 19.5304 11 19V16C11 14.364 11.785 12.912 13 12Z"></path>
    </svg>`);

}

