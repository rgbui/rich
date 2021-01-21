import { Group, TextContent, TextSpan } from "./block";
import { BlockFactory } from "./block.factory";
import { BlockClass } from "./common.enum";
import { Row, View, ViewArea, ViewComponent } from "./view";

BlockFactory.register(BlockClass.view, View, ViewComponent);
BlockFactory.register(BlockClass.viewArea, ViewArea, ViewComponent);
BlockFactory.register(BlockClass.row, Row, ViewComponent);
BlockFactory.register(BlockClass.group, Group, ViewComponent);
BlockFactory.register(BlockClass.text, TextContent, ViewComponent);
BlockFactory.register(BlockClass.textSpan, TextSpan, ViewComponent);