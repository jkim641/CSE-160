class OBJModel {
    constructor() {
        this.vertices = [];
        this.normals = [];

        this.vertexBuffer = null;
        this.normalBuffer = null;

        this.numVertices = 0;

        this.color = [1,1,1,1];
        this.matrix = new Matrix4();
    }

    async load(url) {
        const response = await fetch(url);
        const text = await response.text();

        this.parseOBJ(text);
        this.initBuffers();
    }

    parseOBJ(data) {
        const lines = data.split('\n');

        let tempVerts = [];
        let tempNormals = [];

        for (let line of lines) {
            line = line.trim();

            const parts = line.split(/\s+/);

            //vertex
            if (parts[0] === 'v') {
                tempVerts.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            }

            //normal
            else if (parts[0] === 'vn') {
                tempNormals.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            }

            //face
            else if (parts[0] === 'f') {

                for (let i = 1; i <= 3; i++) {

                    const vals = parts[i].split('/');

                    const vIndex = parseInt(vals[0]) - 1;
                    const nIndex = parseInt(vals[2]) - 1;

                    const v = tempVerts[vIndex];
                    const n = tempNormals[nIndex];

                    this.vertices.push(v[0], v[1], v[2]);
                    this.normals.push(n[0], n[1], n[2]);
                }
            }
        }

        this.numVertices = this.vertices.length / 3;
    }

    initBuffers() {

        this.vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.vertices),
            gl.STATIC_DRAW
        );

        this.normalBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.normals),
            gl.STATIC_DRAW
        );
    }

    render() {

        if (!this.vertexBuffer || !this.normalBuffer) {
            return;
        }

        gl.uniform4f(
            u_FragColor,
            this.color[0],
            this.color[1],
            this.color[2],
            this.color[3]
        );

        gl.uniformMatrix4fv(
            u_ModelMatrix,
            false,
            this.matrix.elements
        );

        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();

        gl.uniformMatrix4fv(
            u_NormalMatrix,
            false,
            normalMatrix.elements
        );

        //vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        gl.vertexAttribPointer(
            a_Position,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.enableVertexAttribArray(a_Position);

        //normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);

        gl.vertexAttribPointer(
            a_Normal,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
}