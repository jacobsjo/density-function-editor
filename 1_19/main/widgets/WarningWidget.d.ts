import { IWidget, LGraphNode, Vector2 } from 'litegraph.js';
export declare class WarningWidget implements IWidget<void> {
    name: string;
    value: void;
    static marker: boolean;
    private is_warning;
    private expanded;
    private description_line_count;
    draw(ctx: CanvasRenderingContext2D, node: LGraphNode, width: number, posY: number, height: number): void;
    mouse(event: MouseEvent, pos: Vector2, node: LGraphNode): boolean;
    computeSize(width: number): [number, number];
}
//# sourceMappingURL=WarningWidget.d.ts.map