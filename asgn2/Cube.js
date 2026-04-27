class Cube
{
    constructor()
    {
        this.type='cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;

        this.matrix = new Matrix4();
    }

    render()
    {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        //Pass the position of a point to a_Position variable
        //before: gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        //Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //pass the matrix to u_ModelMatrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        //draw
        //var d = this.size/200.0;
        //let angleStep = 360 / this.segments;
        //let vertices = [];

        //for (let angle = 0; angle < 360; angle += angleStep)
        //{
            //let angle1 = angle;
            //let angle2 = angle + angleStep;

            //let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
            //let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];

            //let pt1 = [xy[0]+vec1[0], xy[1]+vec1[1]];
            //let pt2 = [xy[0]+vec2[0], xy[1]+vec2[1]];

            // push triangle
            //vertices.push(
                //xy[0], xy[1],
                //pt1[0], pt1[1],
                //pt2[0], pt2[1]
            //);
        //}

        //drawTriangle(vertices);
        //let angleStep = 360/this.segments;
        //for(var angle = 0; angle < 360; angle += angleStep)
        //{
            //let centerPt = [xy[0], xy[1]];
            //let angle1 = angle;
            //let angle2 = angle + angleStep;
            //let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
            //let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
            //let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            //let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

            //drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        //}

        //cube --------------------------
        //front
        drawTriangle3D([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]);

        // back
        drawTriangle3D([0,0,1, 1,1,1, 1,0,1]);
        drawTriangle3D([0,0,1, 0,1,1, 1,1,1]);

        //lighting for top
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

        //top
        drawTriangle3D([0,1,0, 0,1,1, 1,1,1])
        drawTriangle3D([0,1,0, 1,1,1, 1,1,0])

        //lighting for side rught
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);

        //right side
        drawTriangle3D([1,0,0, 1,1,1, 1,1,0]);
        drawTriangle3D([1,0,0, 1,0,1, 1,1,1]);

        //left
        drawTriangle3D([0,0,0, 0,1,0, 0,1,1]);
        drawTriangle3D([0,0,0, 0,1,1, 0,0,1]);

        //lighting for side rught
        gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);

        // bottom
        drawTriangle3D([0,0,0, 1,0,1, 1,0,0]);
        drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);

    }
}