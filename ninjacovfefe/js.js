var img; // Declare variable 'img'.
var bots = [];
var animst = 0;
setInterval(function() {
    animst += 1;
}, 150);
var l = [],
    lf = [],
    r = [],
    rf = [],
    d;
// 0
//143
// 2
var speed = 3;
var moves = [ // samo 10*n vremena!
    [
        [0, 200],
        [4, 200],
        [3, 200]
    ],
    [ 
    [4, 1000],
    ],
    [
        [2, 200],
        [3, 200],
        [2, 200]
    ],
    [
        [0, 200],
    ],
    [
        [1, 200],
    ],
    
    [
      [3, 75],
      [2, 75]
    ],
    
    [
      [3, 75],
      [2, 75]
    ],
    
    [
      [3, 75],
      [2, 75]
    ],
    [
      [3, 75],
      [2, 75]
    ],
    [
    [1, 75],
    [0, 75],
    [4, 20],
    [3, 75]
    ],
    [
    [1, 75],
    [2, 75],
    [3, 20],
    [0, 75]
    ],
    [
    [2, 75],
    [3, 75],
    [2, 20],
    [0, 75]
    ],
    [
    [4, 1000]
    ],
    [
    [4, 100]
    ],
    [
    [4, 100]
    ],
    [
    [4, 1000]
    ]
];
var cntx;
var hero0 = {
    x: Math.floor(Math.random() * (720 -  96)),
    y: Math.floor(Math.random() * (400 -  64)),
    dir: Math.floor(Math.random() * 2),
    keys: {
        up: false,
        down: false,
        left: false,
        right: false,
        fire: false
    },
    isded: false,
    fireAnim: 7
};
var hero1 = {
    x: Math.floor(Math.random() * (720 -  96)),
    y: Math.floor(Math.random() * (400 -  64)),
    dir: Math.floor(Math.random() * 2),
    keys: {
        up: false,
        down: false,
        left: false,
        right: false,
        fire: false
    },
    isded: false,
    fireAnim: 7
};

function setup() {
    canvas = createCanvas(720, 400);
    cntx = canvas.drawingContext;
    document.body.focus();
    d = loadImage("sources/d.png"); // Load the image
    for (let i = 0; i < 7; i++) {
        lf.push(loadImage("sources/lf" + i + ".png")); // Load the image
        rf.push(loadImage("sources/rf" + i + ".png")); // Load the image
    }
    for (let i = 0; i < 3; i++) {
        r.push(loadImage("sources/r" + i + ".png")); // Load the image
        l.push(loadImage("sources/l" + i + ".png")); // Load the image
    }
    frameRate(24);
    canvas.drawingContext.imageSmoothingEnabled = false;
    //spawn bots

    for (let i = 0; i < 30; i++) {
        var bot = new Bot(720, 400, 24);
        bots.push(bot);
    }

}

function draw() {
    var q = [];
    //hero0 
    if(hero0.isded){
      alert("Player 2 wins! reloading site");
      location.reload()
    }
    if(hero1.isded){
      alert("Player 1 wins! reloading site");
      location.reload()
    }
    if (hero0.isded) q.push([d, hero0.x, hero0.y, lf.width, lf.height]);
    else if (hero0.dir == 0) {
        if (hero0.keys.fire == true) {
            //check
            if ( //        --udaraljka      --centar 
                (Math.abs((hero0.x - 10) - (hero1.x + 15))) < 35 &&
                (Math.abs((hero0.y + 30) - (hero1.y + 30))) < 25
            ) //tolerance
                hero1.isded = true;
            // check za botove
            for (let i = 0; i < bots.length; i++)
                if ( //        --udaraljka      --centar 
                    (Math.abs((hero0.x - 10) - (bots[i].x + 15))) < 35 &&
                    (Math.abs((hero0.y + 30) - (bots[i].y + 30))) < 25
                ) //tolerance
                    bots[i].isded = true;
            q.push(["mcl", hero0.x, hero0.y, lf[0].width, lf[0].height, 0, l[animst % 3]]);
        } else
            q.push([l[animst % 3], hero0.x, hero0.y, l[0].width, l[0].height]);
    } else {
        if (hero0.keys.fire == true) {
            //check
            if ( //        --udaraljka      --centar 
                (Math.abs((hero0.x + 30) - (hero1.x + 15))) < 35 &&
                (Math.abs((hero0.y + 30) - (hero1.y + 30))) < 25
            ) //tolerance
                hero1.isded = true;
            // check za botove
            for (let i = 0; i < bots.length; i++)
                if ( //        --udaraljka      --centar 
                    (Math.abs((hero0.x + 30) - (bots[i].x + 15))) < 35 &&
                    (Math.abs((hero0.y + 30) - (bots[i].y + 30))) < 25
                ) //tolerance
                    bots[i].isded = true;
            q.push(["mcr", hero0.x, hero0.y, lf[0].width, lf[0].height, 0, r[animst % 3]]);
        } else
            q.push([r[animst % 3], hero0.x, hero0.y, r[0].width, r[0].height]);
    }
    if (hero1.isded) q.push([d, hero1.x, hero1.y, lf[0].width, lf[0].height]);
    else if (hero1.dir == 0) {
        if (hero1.keys.fire == true) {
            //check
            if ( //        --udaraljka      --centar 
                (Math.abs((hero1.x - 10) - (hero0.x + 15))) < 35 &&
                (Math.abs((hero1.y + 30) - (hero0.y + 30))) < 25
            ) //tolerance
                hero0.isded = true;
            // check za botove
            for (let i = 0; i < bots.length; i++)
                if ( //        --udaraljka      --centar 
                    (Math.abs((hero1.x - 10) - (bots[i].x + 15))) < 35 &&
                    (Math.abs((hero1.y + 30) - (bots[i].y + 30))) < 25
                ) //tolerance
                    bots[i].isded = true;
                //animacija mača 
            q.push(["mcl", hero1.x, hero1.y, lf[0].width, lf[0].height, 1, l[animst % 3]]);
        } else
            q.push([l[animst % 3], hero1.x, hero1.y, l[0].width, l[0].height]);
    } else {
        if (hero1.keys.fire == true) {
            //check
            if ( //        --udaraljka      --centar 
                (Math.abs((hero1.x + 30) - (hero0.x + 15))) < 35 &&
                (Math.abs((hero1.y + 30) - (hero0.y + 30))) < 25
            ) //tolerance
                hero0.isded = true;
            // check za botove
            for (let i = 0; i < bots.length; i++)
                if ( //        --udaraljka      --centar 
                    (Math.abs((hero1.x + 30) - (bots[i].x + 15))) < 35 &&
                    (Math.abs((hero1.y + 30) - (bots[i].y + 30))) < 25
                ) //tolerance
                    bots[i].isded = true;
                //animacija mača 
            q.push(["mcr", hero1.x, hero1.y, rf[0].width, rf[0].height, 1, r[animst % 3]]);
        } else
            q.push([r[animst % 3], hero1.x, hero1.y, r[0].width, r[0].height]);
    }
    bots.forEach(function(bot) {
        if (bot.isded == true)
            q.push([d, bot.x, bot.y, l[0].width, l[0].height]);
        else if (bot.dir == 0) {
            q.push([l[animst % 3], bot.x, bot.y, l[0].width, l[0].height]);
        } else {
            q.push([r[animst % 3], bot.x, bot.y, l[0].width, l[0].height]);
        }
    });
    if (hero0.fireAnim < 7)
        if (hero0.dir == 0) {
            q.push([lf[hero0.fireAnim], hero0.x, hero0.y - 0.1, l[0].width, l[0].height]);
            hero0.fireAnim++;
        } else {
            q.push([rf[hero0.fireAnim], hero0.x, hero0.y - 0.1, l[0].width, l[0].height]);
            hero0.fireAnim++;
        }
    if (hero1.fireAnim < 7)
        if (hero1.dir == 0) {
            q.push([lf[hero1.fireAnim], hero1.x, hero1.y - 0.1, l[0].width, l[0].height]);
            hero1.fireAnim++;
        } else {
            q.push([rf[hero1.fireAnim], hero1.x, hero1.y - 0.1, l[0].width, l[0].height]);
            hero1.fireAnim++;
        }
    q.sort(function(a, b) {
        return a[2] - b[2];
    });
    clear();
    background('rgba(0,255,0, 0.25)');
    for (let i = 0; i < q.length; i++)
        if (q[i][0] === "mcr" || q[i][0] === "mcl") {
            image(q[i][6], q[i][1], q[i][2], q[i][3], q[i][4]);
            if (q[i][5] == 0 && hero0.fireAnim > 6)
                hero0.fireAnim = 0;
            if (q[i][5] == 1 && hero1.fireAnim > 6)
                hero1.fireAnim = 0;

        } else image(q[i][0], q[i][1], q[i][2], q[i][3], q[i][4]);
    move();
}


window.onkeydown = function(e) {
    var kc = e.keyCode;
    e.preventDefault();
    if (kc === 37) hero0.keys.left = true;
    if (kc === 38) hero0.keys.up = true;
    if (kc === 39) hero0.keys.right = true;
    if (kc === 40) hero0.keys.down = true;
    if (kc === 13) {
        hero0.keys.fire = true;
        //limit attack speed
        this.setTimeout(function() { hero0.keys.fire = false; }, 100);

    }

    if (kc === 65) hero1.keys.left = true;
    if (kc === 87) hero1.keys.up = true;
    if (kc === 68) hero1.keys.right = true;
    if (kc === 83) hero1.keys.down = true;
    if (kc === 32) {
        hero1.keys.fire = true;
        //limit attack speed
        this.setTimeout(function() { hero1.keys.fire = false; }, 100);
    }
};

window.onkeyup = function(e) {
    var kc = e.keyCode;
    e.preventDefault();
    if (kc === 37) hero0.keys.left = false;
    if (kc === 38) hero0.keys.up = false;
    if (kc === 39) hero0.keys.right = false;
    if (kc === 40) hero0.keys.down = false;

    if (kc === 65) hero1.keys.left = false;
    if (kc === 87) hero1.keys.up = false;
    if (kc === 68) hero1.keys.right = false;
    if (kc === 83) hero1.keys.down = false;
};

function rndMove() {
    var newArray = [];
    var mov = moves[Math.floor(Math.random() * moves.length)];
    for (let j = 0; j < mov.length; j++)
        newArray[j] = mov[j].slice();
    return newArray;
}

function move() {
    if (hero0.keys.up && hero0.y >= 0 && !hero0.isded) {
        hero0.y -= speed;
    }

    if (hero0.keys.down && (hero0.y + l[0].height) <= 400 && !hero0.isded) {
        hero0.y += speed;
    }

    if (hero0.keys.left && hero0.x >= 0 && !hero0.isded) {
        hero0.x -= speed;
        hero0.dir = 0;
    }

    if (hero0.keys.right && (hero0.x + l[0].width) <= 720 && !hero0.isded) {
        hero0.x += speed;
        hero0.dir = 1;
    }

    if (hero1.keys.up && hero1.y >= 0 && !hero1.isded) {
        hero1.y -= speed;

    }

    if (hero1.keys.down && (hero1.y + l[0].height) <= 400 && !hero1.isded) {
        hero1.y += speed;
    }

    if (hero1.keys.left && hero1.x >= 0 && !hero1.isded) {
        hero1.x -= speed;
        hero1.dir = 0;
    }

    if (hero1.keys.right && (hero1.x + l[0].width) <= 720 && !hero1.isded) {
        hero1.x += speed;
        hero1.dir = 1;
    }
    for (let i = 0; i < bots.length; i++) {
        if (bots[i].q.length == 0) {
            rndMove().forEach(function(element) {
                bots[i].q.push(element);
            });

        }
        if (bots[i].q[0][1] < 10) {
            bots[i].q.splice(0, 1);
            if (bots[i].q.length == 0)
                rndMove().forEach(function(element) {
                    bots[i].q.push(element);
                });
        }

        switch (bots[i].q[0][0]) {
            case 0:
                if (bots[i].y >= 0 && !bots[i].isded){
                    bots[i].y -= speed;
                }
                bots[i].q[0][1] -= speed;
                break;
            case 1:
                bots[i].dir = 0;
                if (bots[i].x >= 0 && !bots[i].isded){
                  
                    bots[i].x -= speed;}
                bots[i].q[0][1] -= speed;
                break;
            case 2:
                if ((bots[i].y) <= (400 - 64 ) && !bots[i].isded){
                  
                    bots[i].y += speed;}
                bots[i].q[0][1] -= speed;
                break;
            case 3:
                bots[i].dir = 1;
                if ((bots[i].x) <= (720 - 96 ) && !bots[i].isded){
                    if(bots[i])
                      bots[i].x += speed;}
                bots[i].q[0][1] -= speed;
                break;
            case 4:
                // nikud ne ide, čeka
                bots[i].q[0][1] -= speed;
                break;
        }

    }
}