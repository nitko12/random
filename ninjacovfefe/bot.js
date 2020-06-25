//bot class


function Bot(width, heigth, fr) {
    this.x = Math.floor(Math.random() * width );
    this.y = Math.floor(Math.random() * heigth );
    this.dir = Math.floor(Math.random() * 2);
    this.isded = false;
    this.q = [];
    this.statex=0;
    this.statey=0;
    //max vrijeme u interval
}