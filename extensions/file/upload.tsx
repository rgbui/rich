import React from "react";
import { Button } from "../../component/button";

export class Upload extends React.Component {
    render() {
        return <div className='shy-upload'>
            <Button block>上传文件</Button>
            <div className='shy-upload-remark'></div>
        </div>
    }
}