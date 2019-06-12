class Mob {
    constructor(x, y) {
        this.id = Math.floor(Math.random() * 1000);
        this.closestTarget = {
            x: 0, y: 0, 
            dX: 500, dY: 500, 
            distance: false, 
            target: false
        };

        // Position
        this.x = x;
        this.y = y;
        this.nextMove = false;
        

        // Properties
        this.fov = Math.floor(Math.random() * 6) + 1;
        
        this.hunger = 0;
        this.maxHunger = Math.floor(Math.random() * 100) + 20;

        this.thirst = 0;
        this.maxThirst = Math.floor(Math.random() * 150) + 20;

        var c = Math.floor(Math.random() * 3);
        if(c == 0) this.color = "#C62444";
        if(c == 1) this.color = "#000000";
        if(c == 2) this.color = "#FF7800";

        this.persistance = {
            currentPersistance: 0,
            maxPersistance: 5,
            persistanceMove: 1
        }

    }

    resetPersistance(){
        this.persistance.currentPersistance = Math.floor(Math.random() * this.persistance.maxPersistance+1) + 1;
        this.persistance.persistanceMove = Math.floor(Math.random() * 5) + 1;
    }

    hungerPercentage(){
        return (this.hunger/this.maxHunger);
    }

    thirstPercentage(){
        return (this.thirst/this.maxThirst);
    }

    predominatingNeed(){
        if(this.hungerPercentage() > this.thirstPercentage()){
            return "hunger";
        }
        else{
            return "thirst";
        }
    }
}