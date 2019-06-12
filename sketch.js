var canvasX = window.innerWidth;
var canvasY = window.innerHeight;

var randomMap = [];

var tileSize = 10;

var globalMap = new Array(Math.floor(canvasX/tileSize));
for (i=0; i<canvasX/tileSize; i++) globalMap[i] = new Array(Math.floor(canvasY/tileSize));

function createMap(){
    for (var x = 0; x < globalMap.length; x++) {
		for (var y = 0; y < globalMap[x].length; y++) {
            var c = 255 * noise(0.05 * x, 0.05 * y);
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
    

    for (var x = 0; x < canvasX; x+=10) {
		for (var y = 0; y < canvasY; y+=10) {
            var c = 255 * noise(0.01 * x, 0.01 * y);
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

            randomMap.push([x, y, type]);
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
    /*for (var m = 0; m < randomMap.length; m++) {
        var el = randomMap[m];
        var x = el[0];
        var y = el[1];
        var type = el[2];

        var col;
        if(type == "water") col = color('#00BAFF');
        if(type == "sand") col = color('#E8BB45');
        if(type == "land") col = color('#2EC624');
        if(type == "food") col = color('#E0FF00')
        fill(col);
        rect(x, y, 10, 10);
  	}*/
}

// MOBS

function createMobs(){
    for (var x = 0; x < globalMap.length; x++) {
		for (var y = 0; y < globalMap[x].length; y++) {
            var type = globalMap[x][y];
            var r = Math.random() * 100;
            if(r > 99.9 && type != "water"){
                mobs.push(new Mob((x*tileSize)+(tileSize/2), (y*tileSize)+(tileSize/2)));
            }
        }
    }
}


function drawMobs(){
    textAlign(CENTER);
    for (let i = 0; i < mobs.length; i++) {
        var mob = mobs[i];

        // Field of view
        noFill();
        circle(mob.x, mob.y, (mob.fov*(2*tileSize)));

        // Mob
        fill(color(mob.color))
        circle(mob.x, mob.y, tileSize);

        // Text 
        var hungerPercentage = Math.round(mob.hungerPercentage()*100);
        var thirstPercentage = Math.round(mob.thirstPercentage()*100);
        var predominatingNeed = mob.predominatingNeed();

        fill(color("white"));
        if(predominatingNeed == "hunger") fill(color("red"));
        text('H: '+hungerPercentage+'%', mob.x, mob.y-15);

        fill(color("white"));
        if(predominatingNeed == "thirst") fill(color("red"));
        text('T: '+thirstPercentage+'%', mob.x, mob.y-5);
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
        for (var m = 0; m < randomMap.length; m++) {
            var el = randomMap[m];
            var x = el[0];
            var y = el[1];
            var type = el[2];

            // Searching for nearest place to drink
            if(predominatingNeed == "thirst" && type == "water"){ 
                var distanceX = x-mob.x;
                var distanceY = y-mob.y;
                var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                if(distance <= ((mob.fov*10)+5)){
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
            }

            // Searching for nearest place to eat
            if(predominatingNeed == "hunger" && type == "food"){ 
                var distanceX = x-mob.x;
                var distanceY = y-mob.y;
                var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                if(distance <= ((mob.fov*10)+5)){
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
            text(mob.id, mob.closestTarget.x+5, mob.closestTarget.y-5);
            text("("+mob.closestTarget.x+","+mob.closestTarget.y+")", mob.closestTarget.x, mob.closestTarget.y-15);
            fill(color("purple"))
            circle(mob.closestTarget.x+5, mob.closestTarget.y+5, 10);

            fill(color("white"))
            switch (mob.closestTarget.type) {
                case "water":
                    text("Going to water", mob.x, mob.y+15);
                    break;

                case "food":
                        text("Going to food", mob.x, mob.y+15);
                        break;
            
                default:
                    break;
            }
            
        }
        else{
            fill(color("white"))
            text("Wandering : "+predominatingNeed, mob.x, mob.y+15);
        }
        
        
        


        if(mob.closestTarget.target){
            if(mob.closestTarget.dX <= -10) mob.nextMove = "W";
            else if(mob.closestTarget.dX >= 10) mob.nextMove = "E";
            else{ // We are at the spot
                if(mob.closestTarget.dY <= -10) mob.nextMove = "N";
                else if(mob.closestTarget.dY >= 10) mob.nextMove = "S";
                else{ // We are at the spot
                    switch (mob.closestTarget.type) {
                        case "water":
                            mob.thirst = 0;
                            break;
                        
                        case "food":
                                mob.hunger = 0;
                                for (var m = 0; m < randomMap.length; m++) {
                                    var el = randomMap[m];
                                    var x = el[0];
                                    var y = el[1];
                                    var type = el[2];

                                    if(type == "food" && x==mob.closestTarget.x && y==mob.closestTarget.y){
                                        randomMap[m][2] = "land";
                                    }
                                }
                                break;
                        
                    
                        default:
                            break;
                    }
                    mob.nextMove = "STILL";
                }
            }
        }

        // If no spot found, wander around
        if(mob.nextMove){
            switch (mob.nextMove) {
                case "N":
                    mob.y-=10;
                    break;
                case "S":
                    mob.y+=10;
                    break;
                case "E":
                    mob.x+=10;
                    break;
                case "W":
                    mob.x-=10;
                    break;
            
                default:
                    break;
            }
        }
        else{
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
                    mob.y-=10;
                    break;
                case 2:
                    mob.y+=10;
                    break;
                case 3:
                    mob.x+=10;
                    break;
                case 4:
                    mob.x-=10;
                    break;
            
                default:
                    mob.x-=10;
                    break;
            }
        }

    });
}