// initialize the game and setup the canvas
kontra.init();

// set default asset paths
kontra.assets.imagePath = "images/";

// helper function to convert degrees to radians
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

kontra.assets.load().then(function(){

/*
* object pools
*/
var cities = kontra.pool({
    create: kontra.sprite,
    maxSize: 5
  });

var bombs = kontra.pool({
    create: kontra.sprite,
    maxsize: 26
    });

var flak = kontra.pool({
    create: kontra.sprite,
    maxsize: 100
    });

/*
* game objects
*/
var quadtree = kontra.quadtree();


var gun = kontra.sprite({
    x: kontra.canvas.width/2,
    y: kontra.canvas.height -5,
    width: 6,
    rotation: 270,
    dt: 0,
    color: 'white', // we'll use this later for collision detection
    render: function() {
        this.context.save();
      // transform the origin and rotate around it 
    // using the ships rotation
    this.context.translate(this.x, this.y);
    this.context.rotate(degreesToRadians(this.rotation));

        // draw a right facing triangle
        this.context.beginPath();

        this.context.moveTo(-3, -5);
        this.context.lineTo(12, 0);
        this.context.lineTo(-3, 5);
    
        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    },
    update() {
        this.dt += 1/60;
        // rotate the ship left or right
        if (kontra.keys.pressed('left')) {
          this.rotation += -4
        }
        else if (kontra.keys.pressed('right')) {
          this.rotation += 4
        }
        if (kontra.keys.pressed('space') && this.dt > 0.25){
         this.dt = 0;
          shoot();
        }
//will include move the gun here

if (kontra.keys.pressed('a')) {
    this.x += -2
  }
  else if (kontra.keys.pressed('s')) {
    this.x += 2
  }
      }
  });

function shoot(){
    const cos = Math.cos(degreesToRadians(gun.rotation));
    const sin = Math.sin(degreesToRadians(gun.rotation));
    flak.get({
        x: gun.x + cos * 12,
        y: gun.y + sin * 12,
        dx: 0 + cos * 5,
        dy: -2 + sin * 5,
        type: 'bullet',
        // bullets are small
        width: 2,
        height: 2,
        color: 'white',
        // live only 50 frames
        ttl: 50,
        update: function(){
        this.advance();
        }
    })
}

//create cities
function createCities(pos){
cities.get({
    x: pos,
    y: kontra.canvas.height - 10,
    color: '#1C1C4D',
    radius: 20,
    ttl: Infinity,
    render: function() {
      this.context.fillStyle = this.color;
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius, 0, Math.PI, true);
      this.context.fill();
      this.context.lineWidth = 2;
      this.context.strokeStyle = '#FFFFFF';
      this.context.stroke();
    }
  });
}

// create bombs

function createBomb(type){
    for (var i = 1; i <= 1; i++){
    bombs.get({
    x: Math.random() *(kontra.canvas.width),
    y: 0,
    dx: 0,
    dy: 0.5,
    radius: 2,
    ttl: Infinity,
    type: type,
    color: 'white',
     update: function() {
      this.advance();
    //when bombs hit the bottom
  if (this.y > kontra.canvas.height) {
    this.ttl=0;
    //explode
  }


     },
     render: function() {
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
      }
  });
}
}
createCities(30);
createCities(90);
createCities(150);
createCities(210);
createCities(270);

// create the game loop to update and render the sprite
window.loop = kontra.gameLoop({
  fps: 60,
  update: function(dt) {
    //pointer.update();
    gun.update();
    bombs.update();
    flak.update();
    var liveBullets = flak.getAliveObjects();
    var city = cities.getAliveObjects();
    quadtree.clear();
    quadtree.add(bombs.getAliveObjects(),cities.getAliveObjects(),flak.getAliveObjects());
    // randomly drop bombs
    if (Math.floor(Math.random()*101)/100 < .005) {
        createBomb('nuke');
      }
    // find collisions between the player ship and enemy bullets
    objects = quadtree.get(gun);

    for (var i = 0, obj; obj = objects[i]; i++) {
      if (obj.type === 'nuke' && obj.collidesWith(gun)) {
        console.log("hit");
      }
    }

// find collisions between the player bullets and enemy bombs
for (var i = 0, bullet; bullet = liveBullets[i]; i++) {
    objects = quadtree.get(bullet);

    for (var j = 0, obj; obj = objects[j]; j++) {
      if (obj.type === 'nuke' && obj.collidesWith(bullet)) {
        bullet.ttl = 0;
        obj.ttl = 0;
        console.log("hit");

      }
    }
  }


  },
  render: function() {
    // pointer.render()
      cities.render();
      flak.render();
      bombs.render();
      gun.render();
  }
});





// start the loop
loop.start();
});