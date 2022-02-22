import { Spline } from 'deepslate';
import { IWidget, LGraphNode, Vector2 } from 'litegraph.js';
export declare class SplineWidget implements IWidget<Spline<number>> {
    name: string;
    value: Spline<number>;
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
    draw(ctx: CanvasRenderingContext2D, node: LGraphNode, width: number, posY: number, _height: number): void;
    private posToInput;
    private inputToPos;
    private posToOutput;
    private outputToPos;
    mouse(event: MouseEvent, pos: Vector2, node: LGraphNode): boolean;
    computeSize(width: number): [number, number];
}
//# sourceMappingURL=SplineWidget.d.ts.map