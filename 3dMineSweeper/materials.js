class Materials {
  constructor(scene) {
    this.scene = scene;
    this.plane = new Map();
    this.normal = new Map();
    this.empty = new Map();

    for (let i = 0; i < 30; ++i) {
      this.plane[i.toString()] = this.makeMaterial(i.toString(), 0.8);
    }
    this.plane["?"] = this.makeMaterial("?", 0.8);

    for (let i = 0; i < 30; ++i) {
      this.normal[i.toString()] = this.makeMaterial(i.toString(), 0.1);
    }
    this.normal["?"] = this.makeMaterial("?", 0.1);
    this.empty["?"] = this.makeMaterial("?", 0.0);
  }

  makeMaterial(c, a) {
    var tex = new BABYLON.DynamicTexture("tex", 64, this.scene);
    tex.drawText(
      c,
      0.1 * size * 50,
      0.1 * size * 100,
      "bold " + (size * 10 * 0.9).toString() + "px Arial",
      "#000000",
      "#ffffff",
      true,
      true
    );
    var mat = new BABYLON.StandardMaterial("mat", this.scene);
    mat.diffuseTexture = tex;
    mat.alpha = a;
    return mat;
  }
}
