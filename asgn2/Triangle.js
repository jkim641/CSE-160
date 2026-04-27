//Part 9: triangle
class Triangle
{
    constructor()
    {
        this.type='triangle';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.vertices = [];
    }

    render()
    {
        var rgba = this.color;

        //Pass the position of a point to a_Position variable
        //before: gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        //Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        //draw
        drawTriangle(this.vertices);
    }
}

//draw trianglw
function drawTriangle(vertices)
{
    //number of vertices
    //var n = 3;
    var n = vertices.length / 2;

    //buffer
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) 
    {
        console.log('Failed to create the buffer object!');
        return -1;
    }

    //bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //write date into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    //buffer-a position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    //enable assigment
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);


}

//3d
function drawTriangle3D(vertices)
{
    //number of vertices
    //var n = 3;
    var n = vertices.length / 3;

    //buffer
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) 
    {
        console.log('Failed to create the buffer object!');
        return -1;
    }

    //bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //write date into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    //buffer-a position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    //enable assigment
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);


}