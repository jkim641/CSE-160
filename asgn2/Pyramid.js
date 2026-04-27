class Pyramid {
  constructor() {
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    var r = this.color;

    // ── Front face ──
    gl.uniform4f(u_FragColor, r[0], r[1], r[2], r[3]);
    drawTriangle3D([
      -0.5, 0.0,  0.5,
       0.5, 0.0,  0.5,
       0.0, 1.0,  0.0
    ]);

    // ── Back face ──
    gl.uniform4f(u_FragColor, r[0]*0.85, r[1]*0.85, r[2]*0.85, r[3]);
    drawTriangle3D([
       0.5, 0.0, -0.5,
      -0.5, 0.0, -0.5,
       0.0, 1.0,  0.0
    ]);

    // ── Left face ──
    gl.uniform4f(u_FragColor, r[0]*0.75, r[1]*0.75, r[2]*0.75, r[3]);
    drawTriangle3D([
      -0.5, 0.0, -0.5,
      -0.5, 0.0,  0.5,
       0.0, 1.0,  0.0
    ]);

    // ── Right face ──
    gl.uniform4f(u_FragColor, r[0]*0.70, r[1]*0.70, r[2]*0.70, r[3]);
    drawTriangle3D([
       0.5, 0.0,  0.5,
       0.5, 0.0, -0.5,
       0.0, 1.0,  0.0
    ]);

    // ── Bottom face ──
    gl.uniform4f(u_FragColor, r[0]*0.5, r[1]*0.5, r[2]*0.5, r[3]);
    drawTriangle3D([
      -0.5, 0.0,  0.5,
      -0.5, 0.0, -0.5,
       0.5, 0.0,  0.5
    ]);
    drawTriangle3D([
       0.5, 0.0,  0.5,
      -0.5, 0.0, -0.5,
       0.5, 0.0, -0.5
    ]);
  }
}