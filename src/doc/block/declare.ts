
import { BlockFactory } from "./block.factory";
import { BlockClass } from "./common.enum";
import { ViewArea, ViewAreaComponent } from "./common/area";
import { Group, GroupView } from "./common/group";
import { Row, RowView } from "./common/row";
import { TextContent, TextContentView } from "./common/text";
import { TextSpan, TextSpanView } from "./common/textspan";
import { View, ViewComponent } from "./common/view";
import { Image, ImageView } from "./components/image";
import { ToDo, ToDoView } from "./components/todo";

import './components/style.less';
import "./common/style.less";

BlockFactory.register(BlockClass.view, View, ViewComponent);
BlockFactory.register(BlockClass.viewArea, ViewArea, ViewAreaComponent);
BlockFactory.register(BlockClass.row, Row, RowView);
BlockFactory.register(BlockClass.group, Group, GroupView);
BlockFactory.register(BlockClass.text, TextContent, TextContentView);
BlockFactory.register(BlockClass.textSpan, TextSpan, TextSpanView);
BlockFactory.register(BlockClass.todo, ToDo, ToDoView);
BlockFactory.register(BlockClass.image, Image, ImageView);