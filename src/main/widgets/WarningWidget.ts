
import { CubicSpline } from 'deepslate';
import { IWidget, LGraphCanvas, LGraphNode, Vector2, WidgetCallback, widgetTypes } from 'litegraph.js'
import { DensityFunctionNode } from '../nodes/density_function';
import { IdentityNumberFunction } from '../util';

export class WarningWidget implements IWidget<void>{
    name: string;
    value: void; //unused

    static marker = true

    private is_warning: boolean = false
    private expanded: boolean = false
    private description_line_count: number = 0

    draw(ctx: CanvasRenderingContext2D, node: LGraphNode, width: number, posY: number, height: number): void {
        var warning: string
        var description: string
        if (node instanceof DensityFunctionNode && node.warning !== undefined){
            warning = node.warning.getWarning()
            description = node.warning.getDescription()
        } else {
            warning = ""
            description = ""
        }

        if (warning && warning !== ""){
            this.is_warning = true
            ctx.fillStyle = "#42381f"
            ctx.strokeStyle = "#f4db9c"
            ctx.lineWidth = 1
            roundRect(ctx,10, posY, width - 20, this.expanded ? 25 + this.description_line_count * 16 : 20, 5)
            ctx.fill()
            ctx.stroke()
            ctx.fillStyle = "#d7b600"
            ctx.beginPath()
            ctx.lineTo(15, posY + 15)
            ctx.lineTo(20, posY + 5)
            ctx.lineTo(25, posY + 15)
            ctx.fill()
            ctx.fillStyle = "black"
            ctx.fillText("!", 20 - 0.5 * ctx.measureText("!").width, posY + 14)
            ctx.fillStyle = "#f4db9c"
            ctx.fillText(warning, 30, posY + 15)

            if ((description && description !== "") || this.expanded){
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.lineTo(width - 25, posY + (this.expanded ? 13 : 7))
                ctx.lineTo(width - 20, posY + (this.expanded ? 7 : 13))
                ctx.lineTo(width - 15, posY + (this.expanded ? 13 : 7))
                ctx.stroke()
            }

            if (this.expanded){
                this.description_line_count = wrapText(ctx, description, 15, posY + 33, width - 30, 16)
            }
        } else {
            this.is_warning = false
        }
    }

    mouse(event: MouseEvent, pos: Vector2, node: LGraphNode): boolean {
        if (event.type === "mousedown"){
            if (node instanceof DensityFunctionNode && node.warning !== undefined){
                const description = node.warning.getDescription()
                if ((description && description !== "") || this.expanded){
                    this.expanded = !this.expanded
                    ;(node as any).setSize(node.computeSize())
                }
            }
        }
        return true
    }

    computeSize(width: number): [number, number] {
        return [width, this.is_warning ? (this.expanded ? 25 + this.description_line_count * 16 : 20) : 0];
    }
    
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | {tl: number, tr: number, br: number, bl: number}) {
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    var words = text.split(' ');
    var line = '';
    var line_count = 0

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        line_count ++
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    return line_count + 1
}