var canvasX = window.innerWidth;
var canvasY = window.innerHeight;

var tileSize = 10;

var globalMap = new Array(Math.floor(canvasX/tileSize));
for (i=0; i<canvasX/tileSize; i++) globalMap[i] = new Array(Math.floor(canvasY/tileSize));

function createMap(){
    for (var x = 0; x < globalMap.length; x++) {
		for (var y = 0; y < globalMap[x].length; y++) {
            var c = 255 * noise(0.1 * x, 0.1 * y);
            var type;
            if(c < 100) type = "water";
            if(c >= 100 && c < 120) type = "sand";
            if(c >= 120 && c < 255) type = "land";

            // Generating food
            if(type == "land"){ 
                var r = Math.floor(Math.random() * 100);
                if(r > 95){
                    type = "food";
                }
            }
            globalMap[x][y] = type;
        }
    }
}


var mobs = [];

function setup() {
    createCanvas(canvasX, canvasY);
    frameRate(2);

    createMap();
    createMobs();
}
  
function draw() {
    background(0); 

    drawMap();
    
    moveMobs();
    updateMobs();
    drawMobs();
}

function drawMap(){
    for (var x = 0; x < globalMap.length; x++) {
		for (var y = 0; y < globalMap[x].length; y++) {
            var col;
            var type = globalMap[x][y];
            if(type == "water") col = color('#00BAFF');
            if(type == "sand") col = color('#E8BB45');
            if(type == "land") col = color('#2EC624');
            if(type == "food") col = color('#E0FF00')
            fill(col);
            rect(x*tileSize, y*tileSize, tileSize, tileSize);
        }
    }
}

// MOBS

function createMobs(){
    for (var x = 0; x < globalMap.length; x++) {
		for (var y = 0; y < globalMap[x].length; y++) {
            var type = globalMap[x][y];
            var r = Math.random() * 100;
            if(r > 99.9 && type != "water"){
                mobs.push(new Mob(x, y));
            }
        }
    }
}


function drawMobs(){
    textAlign(CENTER);
    for (let i = 0; i < mobs.length; i++) {
        var mob = mobs[i];
        var mobX = (mob.x*tileSize)+(tileSize/2);
        var mobY = (mob.y*tileSize)+(tileSize/2);

        // Field of view
        noFill();
        circle(mobX, mobY, (mob.fov*(2*tileSize)));

        // Mob
        fill(color(mob.color))
        circle(mobX, mobY, tileSize);

        // Text 
        var hungerPercentage = Math.round(mob.hungerPercentage()*100);
        var thirstPercentage = Math.round(mob.thirstPercentage()*100);
        var predominatingNeed = mob.predominatingNeed();

        fill(color("white"));
        if(predominatingNeed == "hunger") fill(color("red"));
        text('H: '+hungerPercentage+'%', mobX, mobY-15);

        fill(color("white"));
        if(predominatingNeed == "thirst") fill(color("red"));
        text('T: '+thirstPercentage+'%', mobX, mobY-5);
    }
}

function updateMobs(){
    mobs.forEach(function(mob, i, object) {
        mob.hunger++;
        mob.thirst++;

        if(mob.hunger >= mob.maxHunger || mob.thirst >= mob.maxThirst){
            mobs.splice(i, 1);
        }
    });

}

function moveMobs(){
    mobs.forEach(function(mob, i, object) {

        // Getting what we most need 
        var predominatingNeed = mob.predominatingNeed();


        // Finding the nearest spot to eat/dring
        mob.nextMove = false;
        mob.closestTarget.target = false;

        var minX = mob.x-mob.fov;
        var maxX = mob.x+mob.fov;
        if(minX<0)minX = 0;
        if(maxX>globalMap.length)maxX = globalMap.length;

        var minY = mob.y-mob.fov;
        var maxY = mob.y+mob.fov;
        if(minY<0)minY = 0;
        if(maxY>globalMap[0].length)maxY = globalMap[0].length;

        for (var x = minX; x < maxX; x++) {
            for (var y = minY; y < maxY; y++) {
                var type = globalMap[x][y];

                // Searching for nearest place to drink
                if(predominatingNeed == "thirst" && type == "water"){ 
                    var distanceX = x-mob.x;
                    var distanceY = y-mob.y;
                    var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                    if(!mob.closestTarget.target || distance < mob.closestTarget.distance){
                        mob.closestTarget.x = x;
                        mob.closestTarget.y = y;
                        mob.closestTarget.dX = distanceX;
                        mob.closestTarget.dY = distanceY;
                        mob.closestTarget.distance = distance;
                        mob.closestTarget.target = true;
                        mob.closestTarget.type = "water";
                    }
                }

                // Searching for nearest place to eat
                if(predominatingNeed == "hunger" && type == "food"){ 
                    var distanceX = x-mob.x;
                    var distanceY = y-mob.y;
                    var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                    if(!mob.closestTarget.target || distance < mob.closestTarget.distance){
                        mob.closestTarget.x = x;
                        mob.closestTarget.y = y;
                        mob.closestTarget.dX = distanceX;
                        mob.closestTarget.dY = distanceY;
                        mob.closestTarget.distance = distance;
                        mob.closestTarget.target = true;
                        mob.closestTarget.type = "food";
                    }
                }
            }
        }

        // Displaying nearest place to drink
        if(mob.closestTarget.target){
            var targetX = (mob.closestTarget.x*tileSize);
            var targetY = (mob.closestTarget.y*tileSize);

            fill(color("purple"))
            circle(targetX+(tileSize/2), targetY+(tileSize/2), tileSize);

            fill(color("white"))
            switch (mob.closestTarget.type) {
                case "water":
                    text("Going to water", (mob.x*tileSize)+(tileSize/2), (mob.y*tileSize)+(tileSize/2)+15);
                    break;

                case "food":
                        text("Going to food", (mob.x*tileSize)+(tileSize/2), (mob.y*tileSize)+(tileSize/2)+15);
                        break;
            
                default:
                    break;
            }
        }
        
        
        


        if(mob.closestTarget.target){
            if(mob.closestTarget.dX <= -1) mob.nextMove = "W";
            else if(mob.closestTarget.dX >= 1) mob.nextMove = "E";
            else{ // We are at the spot
                if(mob.closestTarget.dY <= -1) mob.nextMove = "N";
                else if(mob.closestTarget.dY >= 1) mob.nextMove = "S";
                else{ // We are at the spot
                    switch (mob.closestTarget.type) {
                        case "water":
                            mob.thirst = 0;
                            break;
                        
                        case "food":
                                mob.hunger = 0;
                                globalMap[mob.closestTarget.x][mob.closestTarget.y] = "land";
                                break;
                        
                    
                        default:
                            break;
                    }
                    mob.nextMove = "STILL";
                }
            }
        }

        // If target, go to
        if(mob.nextMove){
            switch (mob.nextMove) {
                case "N":
                    mob.y--;
                    break;
                case "S":
                    mob.y++;
                    break;
                case "E":
                    mob.x++;
                    break;
                case "W":
                    mob.x--;
                    break;
            
                default:
                    break;
            }
        }
        else{ // Wander around
            var destination;
            if(mob.persistance.currentPersistance > 0){
                mob.persistance.currentPersistance--;
            }
            else{
                mob.resetPersistance();
            }
            destination = mob.persistance.persistanceMove;
            switch (destination) {
                case 1:
                    mob.y--;
                    break;
                case 2:
                    mob.y++;
                    break;
                case 3:
                    mob.x++;
                    break;
                case 4:
                    mob.x--;
                    break;
            
                default:
                    mob.x--;
                    break;
            }
        }

    });
}