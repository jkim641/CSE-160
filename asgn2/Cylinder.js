class Cylinder {
  constructor(segments = 20) {
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = segments;
  }

  render() {
    // Apply matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let n = this.segments;

    // Color variations
    let sideColor = this.color;
    let topColor = [
      this.color[0] * 1.2,
      this.color[1] * 1.2,
      this.color[2] * 1.2,
      this.color[3]
    ];
    let bottomColor = [
      this.color[0] * 0.7,
      this.color[1] * 0.7,
      this.color[2] * 0.7,
      this.color[3]
    ];

    for (let i = 0; i < n; i++) {
      let angle1 = (i / n) * 2 * Math.PI;
      let angle2 = ((i + 1) / n) * 2 * Math.PI;

      let x1 = Math.cos(angle1) * 0.5;
      let z1 = Math.sin(angle1) * 0.5;
      let x2 = Math.cos(angle2) * 0.5;
      let z2 = Math.sin(angle2) * 0.5;

      // ── Bottom cap (darker) ──
      gl.uniform4f(u_FragColor, bottomColor[0], bottomColor[1], bottomColor[2], bottomColor[3]);
      drawTriangle3D([
        0,  -0.5,  0,
        x2, -0.5, z2,
        x1, -0.5, z1
      ]);

      // ── Side quad (normal color) ──
      gl.uniform4f(u_FragColor, sideColor[0], sideColor[1], sideColor[2], sideColor[3]);

      drawTriangle3D([
        x1,  0.5, z1,
        x1, -0.5, z1,
        x2,  0.5, z2
      ]);

      drawTriangle3D([
        x2,  0.5, z2,
        x1, -0.5, z1,
        x2, -0.5, z2
      ]);

      // ── Top cap (lighter) ──
      gl.uniform4f(u_FragColor, topColor[0], topColor[1], topColor[2], topColor[3]);
      drawTriangle3D([
        0,   0.5, 0,
        x1,  0.5, z1,
        x2,  0.5, z2
      ]);
    }
  }
}