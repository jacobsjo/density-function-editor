
import { Spline } from 'deepslate';
import { IWidget, LGraphCanvas, LGraphNode, Vector2, WidgetCallback, widgetTypes } from 'litegraph.js'

export class SplineWidget implements IWidget<Spline<number>>{
    name: string;
    value: Spline<number> = new Spline<number>("spine", (c) => c, [-1, 1], [() => -1, () => 1], [1, 1]);

    public min_input: number = -1;
    public max_input: number = 1;
    public min_value: number = -1;
    public max_value: number = 1;

    options = {}

    private widged_width: number
    private widget_posy: number

    private dragging_id: number = -1
    private selected_id: number = -1
    private dragging_derivative: boolean = false
    private last_click_time: number = 0 

    private node: LGraphNode

    draw(ctx: CanvasRenderingContext2D, node: LGraphNode, width: number, posY: number, _height: number): void {
        this.node = node

        ctx.save()
        width-=20;
        this.widged_width = width
        this.widget_posy = posY

        ctx.fillStyle = "black"
        ctx.rect(10, posY, width, width)
        ctx.clip()
        ctx.fillRect(10, posY, width, width)

        ctx.lineWidth = 0.5
        ctx.strokeStyle = "gray"
        for (var location = Math.floor(this.min_input / 2) * 2 ; location <= this.max_input ; location+=0.5){
            ctx.beginPath()
            const x = this.inputToPos(location, width)
            ctx.lineTo(x, posY)
            ctx.lineTo(x, posY + width)
            ctx.stroke()
        }
        for (var value = Math.floor(this.min_value / 2) * 2 ; value <= this.max_value ; value+=0.5){
            ctx.beginPath()
            const y = this.outputToPos(value, width)
            ctx.lineTo(10, y)
            ctx.lineTo(10+width, y)
            ctx.stroke()
        }

        ctx.lineWidth = 1
        ctx.strokeStyle = "white"
        ctx.beginPath()
        const step = 5
        for (var x = 0; x<=width; x+=step){
            ctx.lineTo(x+10, this.outputToPos(this.value.apply(this.posToInput(x + 10, width)), width))
        }
        ctx.lineTo(width+10, this.outputToPos(this.value.apply(this.posToInput(width + 10, width)), width))
        ctx.stroke()

        for (var i = 0 ; i<this.value.locations.length ; i++){
            const x = this.inputToPos(this.value.locations[i], width)
            const y = this.outputToPos(this.value.values[i](0), width)
            ctx.fillStyle = i == this.selected_id ? "orange" : "white"
            ctx.beginPath()
            ctx.arc(x, y, i == this.selected_id ? 3 : 2, 0, 2 * Math.PI);  
            ctx.fill()   
            if (i == this.selected_id){
                ctx.strokeStyle = "orange"
                ctx.lineWidth = 0.5
                const derivative = this.value.derivatives[i] * (this.max_input - this.min_input) / (this.max_value - this.min_value)
                const angle = Math.atan(derivative)
                ctx.beginPath()
                ctx.lineTo(x - 30*Math.cos(angle), y + 30*Math.sin(angle))
                ctx.lineTo(x + 30*Math.cos(angle), y - 30*Math.sin(angle))
                ctx.stroke()
            }
       }

       //ctx.fillText(this.max_value.toFixed(2), 10, posY+12)
       //ctx.fillText(this.min_value.toFixed(2), 10, posY+width-1)

       ctx.restore()

       ctx.fillStyle = "white"
       ctx.fillText(this.min_input.toFixed(2), 10, posY+width+12)
       ctx.fillText(this.max_input.toFixed(2), 10+width-ctx.measureText(this.max_input.toFixed(2)).width, posY+width+12)
       if (this.selected_id >= 0){
           ctx.fillStyle = "orange"
           const text = "(" + this.value.locations[this.selected_id].toFixed(2) + ", " + this.value.values[this.selected_id](0).toFixed(2) + ")"
           ctx.fillText(text, 10+width/2-ctx.measureText(text).width/2, posY+width+12)
       }
    }

    private posToInput(pos: number, width: number){
        return (pos - 10)/width * (this.max_input - this.min_input) + this.min_input
    } 

    private inputToPos(input: number, width: number){
        return (input - this.min_input) / (this.max_input - this.min_input) * width + 10
    } 

    private posToOutput(pos: number, width: number){
        return (1 - ((pos - this.widget_posy) /width)) * (this.max_value - this.min_value) + this.min_value
    } 

    private outputToPos(output: number, height: number){
        return (1 - ((output - this.min_value) / (this.max_value - this.min_value))) * height + this.widget_posy
    }

    mouse(event: MouseEvent, pos: Vector2, node: LGraphNode): boolean {
        if (event.type === "mousedown"){
            for (var i = 0 ; i<this.value.locations.length ; i++){
                const x = this.inputToPos(this.value.locations[i], this.widged_width)
                const y = this.outputToPos(this.value.values[i](0), this.widged_width)


                const distance = (x - pos[0])*(x - pos[0]) + (y - pos[1])*(y - pos[1])
                if (distance < 100){
                    if (this.selected_id == i && (new Date().getTime() - this.last_click_time)< 500 && this.value.locations.length > 1){
                        this.value.locations.splice(i, 1)
                        this.value.values.splice(i, 1)
                        this.value.derivatives.splice(i, 1)
                        this.dragging_id = -1
                        this.selected_id = -1
                        return false
                    } else {
                        this.dragging_id = i
                        this.selected_id = i
                        this.dragging_derivative = false
                        this.last_click_time = new Date().getTime()
                        this.stopShrink()
                        return false
                    }
                } else if (distance < 1000 && i == this.selected_id){
                    const derivative = this.value.derivatives[i] * (this.max_input - this.min_input) / (this.max_value - this.min_value)
                    const mouse_angle = Math.atan((y - pos[1])/ (-x + pos[0]))
                    const derivative_angle = Math.atan(derivative)
                    if (Math.abs(mouse_angle - derivative_angle)<0.1){
                        this.dragging_id = i
                        this.dragging_derivative = true
                        this.stopShrink()
                        return false
                    }
                }
            }

            const location = this.posToInput(pos[0], this.widged_width)
            const value = this.posToOutput(pos[1], this.widged_width)

            if (Math.abs(this.outputToPos(this.value.apply(location), this.widged_width) - pos[1]) < 10){
                var index = this.value.locations.findIndex((loc) => loc > location)
                if (index === -1)
                    index = this.value.locations.length
                this.value.locations.splice(index, 0, location)
                this.value.values.splice(index, 0, () => value)
                this.value.derivatives.splice(index, 0, 0)
                this.dragging_id = index
                this.selected_id = index
                this.dragging_derivative = false
                this.stopShrink()
                return false
            }   

            this.dragging_id = -1
            this.selected_id = -1
        } else if (event.type === "mousemove" && this.dragging_id >= 0){
            if (this.dragging_derivative){
                const x = this.inputToPos(this.value.locations[this.dragging_id], this.widged_width)
                const y = this.outputToPos(this.value.values[this.dragging_id](0), this.widged_width)

                this.value.derivatives[this.dragging_id] = (y - pos[1])/ (-x + pos[0]) / (this.max_input - this.min_input) * (this.max_value - this.min_value)
            } else {
                if (pos[0] < 0){
                    this.startExpand("left")
                } else if (pos[0] > this.widged_width + 20){
                    this.startExpand("right")
                } else {
                    this.stopExpand()
                }

                const location = Math.clamp(this.posToInput(pos[0], this.widged_width), this.min_input, this.max_input)
                const value = Math.clamp(this.posToOutput(pos[1], this.widged_width), this.min_value, this.max_value)
                const derivative = this.value.derivatives[this.dragging_id]

                
                while (this.dragging_id > 0 && location < this.value.locations[this.dragging_id-1]){
                    this.value.locations[this.dragging_id] = this.value.locations[this.dragging_id-1]
                    this.value.derivatives[this.dragging_id] = this.value.derivatives[this.dragging_id-1]
                    this.value.values[this.dragging_id] = this.value.values[this.dragging_id-1]
                    this.dragging_id--
                    this.selected_id--
                } 

                
                while (this.dragging_id < this.value.locations.length - 1 && location > this.value.locations[this.dragging_id+1]){
                    this.value.locations[this.dragging_id] = this.value.locations[this.dragging_id+1]
                    this.value.derivatives[this.dragging_id] = this.value.derivatives[this.dragging_id+1]
                    this.value.values[this.dragging_id] = this.value.values[this.dragging_id+1]
                    this.dragging_id++
                    this.selected_id++
                }

                this.value.locations[this.dragging_id] = location
                this.value.values[this.dragging_id] = () => value
                this.value.derivatives[this.dragging_id] = derivative

            }
            return false
        } else if (event.type === "mouseup"){
            this.stopExpand()
            this.dragging_id = -1
            this.startShrink()
        }

        return false
    }

    computeSize(width: number): [number, number] {
        return [width, width-20+15];
    }

    private expand_timer: NodeJS.Timer = undefined
    private startExpand(direction: "left"|"right"){
        if (!this.expand_timer){
                this.expand_timer = setInterval(() => {
                    if (direction === "left"){
                        this.min_input -= 0.02
                        this.value.locations[this.dragging_id] = this.min_input
                    } else {
                        this.max_input += 0.02
                        this.value.locations[this.dragging_id] = this.max_input
                    }
                    this.node?.setDirtyCanvas(true, false)
                }, 20)
        }
    }

    private stopExpand(){
        if (this.expand_timer){
            clearInterval(this.expand_timer)
            this.expand_timer = undefined
        }
    }

    private shrink_timer: NodeJS.Timer = undefined
    private startShrink(){
        if (!this.shrink_timer){
            this.shrink_timer = setInterval(() => {
                console.log("shrink")
                var changed = false
                if (this.min_input < this.value.locations[0]-0.3){
                    this.min_input += 0.02
                    changed = true
                }
                if (this.max_input > this.value.locations[this.value.locations.length - 1]+0.3){
                    this.max_input -= 0.02
                    changed = true
                }
                if (!changed){
                    this.stopShrink()
                } else {
                    this.node?.setDirtyCanvas(true, false)
                }
            }, 20)
        }
    }

    private stopShrink(){
        if (this.shrink_timer){
            clearInterval(this.shrink_timer)
            this.shrink_timer = undefined
        }
    }
}