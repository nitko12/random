function loadImages(names, callback) {
  // TODO add sounds etc.
  let result = {},
    count = names.length;
  let onload = () => {
    if (--count == 0) callback(result);
  };
  for (let n = 0; n < names.length; n++) {
    let name = names[n];
    result[name] = new Image();
    result[name].onload = onload;
    result[name].src = "/assets/images/" + name + ".png";
  }
}

function mod2(x, m) {
  return ((x % m) + m) % m;
}

function rotate(j, i, dPhi) {
  let phi = Math.atan2(i, j);
  let mag = Math.hypot(i, j);

  phi = phi + dPhi;

  j = Math.cos(phi) * mag;
  i = Math.sin(phi) * mag;

  return [j, i];
}
