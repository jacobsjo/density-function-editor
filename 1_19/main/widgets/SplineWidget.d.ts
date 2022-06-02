import { CubicSpline } from 'deepslate';
import { IWidget, LGraphNode, Vector2 } from 'litegraph.js';
export declare class SplineWidget implements IWidget<CubicSpline.MultiPoint<number>> {
    onChange?: () => void;
    name: string;
    value: CubicSpline.MultiPoint<number>;
    min_input: number;
    max_input: number;
    min_value: number;
    max_value: number;
    options: {};
    private widged_width;
    private widget_posy;
    private dragging_id;
    private selected_id;
    private dragging_derivative;
    private last_click_time;
    private node;
    constructor(onChange?: () => void);
    draw(ctx: CanvasRenderingContext2D, node: LGraphNode, width: number, posY: number, _height: number): void;
    private posToInput;
    private inputToPos;
    private posToOutput;
    private outputToPos;
    mouse(event: MouseEvent, pos: Vector2, node: LGraphNode): boolean;
    computeSize(width: number): [number, number];
    private expand_timer_vertical;
    private expand_timer_horizontal;
    private startExpand;
    private stopExpand;
    private shrink_timer;
    private startShrink;
    private stopShrink;
}
//# sourceMappingURL=SplineWidget.d.ts.map