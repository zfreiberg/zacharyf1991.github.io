var Ghost = function(state, x, y){
	Kiwi.GameObjects.Sprite.call(this, state, state.textures['ghost'], x, y);
	this.state = state;
	this.box.hitbox = new Kiwi.Geom.Rectangle(60, 65, 60, 55); 
	this.physics = this.components.add(new Kiwi.Components.ArcadePhysics(this, this.box));

	var animationSpeed = 0.1;
	//var animationSpeed = (Math.random() * 0.1) + 0.05;
	this.animation.add('invis', [0], 0.1, false);
	this.animation.add('appear', [00, 01, 02, 03, 04, 06, 07, 08, 09, 10, 12, 13, 14, 15], 0.06, false);
	this.animation.add('capture', [16, 18, 19, 20, 21, 23, 24, 25, 26, 27], animationSpeed, false);
	this.animation.add('idle',[05, 11], 0.1, true);
	this.animation.add('dash',[05, 11], 0.1, true);
	this.animation.add('damage1',[17], 0.1, false);
	this.animation.add('damage2',[23], 0.1, false);
	this.animation.add('damage3',[29], 0.1, false);
	this.animation.play('invis');


	//this.animation.getAnimation('appear').onStop.add(this.dash, this);
	this.animation.getAnimation('capture').onStop.add(this.capture, this);


	this.health = 3;
	this.yVelo = 0;
	this.xVelo = 0;
	this.dashSpeed = 1.5;
	this.speed = 0.3;
	this.detectionDistance = 300;
	this.oriSpeed = this.speed;
	this.inYRange = false;
	this.inXRange = false;
	this.hit = false;
	this.distanceToEgon = 100000000000;
	this.pauseTime = 0;
	this.isVisible = false;
	this.targetLocation = [0,0];




	this.setupAI();
	





}
Kiwi.extend(Ghost, Kiwi.GameObjects.Sprite);

Ghost.prototype.update = function(){
    Kiwi.GameObjects.Sprite.prototype.update.call(this);


    if(this.state.player.x >this.x){
    	this.scaleX = -1;
    } else if(this.state.player.x < this.x){
    	this.scaleX = 1;
    }

    this.physics.update();
    this.ai.update();
    if(this.hit){
    	//console.log("I am hit!!!!");
    	
    	if(this.x > this.state.weaponManager.myMiniGame.x -15){
    		this.x -= 0.3;
    	}
    	if(this.x < this.state.weaponManager.myMiniGame.x - 15){
    		this.x += 0.3;
    		
   	 	}
   	 	if(this.y > this.state.weaponManager.myMiniGame.y - 15){
    		this.y -= 0.3;
    	}
    	if(this.y < this.state.weaponManager.myMiniGame.y - 15){
    		this.y += 0.3;
    		
   	 	}

    	switch(this.health) {
		case 1:
			if (this.animation.currentAnimation.name != 'damage1'){
	               this.animation.play('damage1');
	    	}
    		break;
		case 2:
    		if (this.animation.currentAnimation.name != 'damage2'){
	               this.animation.play('damage2');
	    	}
    		break;
    	case 3:
    		if (this.animation.currentAnimation.name != 'damage3'){
	               this.animation.play('damage3');
	    	}
    		break;
		}
    }

    
}

Ghost.prototype.capture = function() {
	this.state.addCash(1, this.x, this.y);
	this.state.weaponManager.stopShooting();
	this.destroy();
};


Ghost.prototype.startLoop = function(){
	if (this.animation.currentAnimation.name != 'idle'){
               
               this.animation.play('idle');
       }
}

Ghost.prototype.dash = function(){
	//this.speed = 5;

	//this.animation.play('dash');
}





Ghost.prototype.damageEnemy = function() {
	this.health -= 1;
	if(this.health <= 0){
		this.state.enemyManager.killEnemy(this, this.x, this.y);
		if (this.animation.currentAnimation.name != 'capture'){

               //this.animation.play('capture');
    	}
	}
};
Ghost.prototype.killSelf = function() {
	this.state.weaponManager.stopShooting();
	this.state.enemyManager.kill(this);

};

Ghost.prototype.updateDirection = function() {
	
	
	if(this.y >= this.state.player.y - 20){

		this.yVelo = -this.speed;
		this.inYRange = false;
	} else if(this.y <= this.state.player.y  - 20){
		this.yVelo = this.speed;
		this.inYRange = false;
	} else {
		this.inYRange = true;
		this.yVelo = 0;
	}


	if(this.x < this.state.player.x - 0){
		//this.xVelo = this.speed;
		this.inXRange = false;
	} else if(this.x >= this.state.player.x + 0){
		//this.xVelo = -this.speed;
		this.inXRange = false;
	} else {
		this.xVelo = 0;
		this.inXRange = true;
	}
	this.speed = this.oriSpeed;
};

Ghost.prototype.checkDash = function() {
	var ghostPoint = new Kiwi.Geom.Point(this.x, this.y);
	var playerPoint = new Kiwi.Geom.Point(this.state.player.x, this.state.player.y);
	//console.log(playerPoint);
	this.distanceToEgon = ghostPoint.distanceToXY(this.state.player.x, this.state.player.y);
};

Ghost.prototype.finishedAppear = function() {
	
};

Ghost.prototype.setupAI = function() {
	
	//////////////////////////////////
	//SETUP AI

	
	var aiTree = new Kiwi.Plugins.AITree.AI();

	var moveTo = new Kiwi.Plugins.GhostAI.Actions.MoveToLocation({
		sprite:this
	});

	var selectLocation = new Kiwi.Plugins.GhostAI.Actions.SelectNewLocation({
		sprite:this,
		top: 0,
		bottom: 600,
		left: 0,
		right: 800,
		distance: 200
	});
	var pause = new Kiwi.Plugins.GhostAI.Actions.Pause({
        sprite:this,
        length:100
    });
    var dash = new Kiwi.Plugins.GhostAI.Actions.Dash({
    	sprite:this,
    	target:this.state.player
    });
    var dashPause = new Kiwi.Plugins.GhostAI.Actions.Pause({
        sprite:this,
        length:80
    });
    var dashTargetSelect = new Kiwi.Plugins.GhostAI.Actions.SelectDashTarget({
    	sprite:this,
    	target:this.state.player
    });
    var detectVisible = new Kiwi.Plugins.GhostAI.Conditions.DetectVisible({
    	sprite:this
    });
    var detectEgon = new Kiwi.Plugins.GhostAI.Conditions.DetectEgon({
    	sprite:this,
    	target:this.state.player
    });
    var appear = new Kiwi.Plugins.GhostAI.Actions.Appear({
    	sprite:this
    });
    var hit = new Kiwi.Plugins.GhostAI.Actions.Hit({
        sprite:this
    });
    var detectHit = new Kiwi.Plugins.GhostAI.Conditions.DetectHit({
    	sprite:this
    });

	var randomMoveSequence = new Kiwi.Plugins.AITree.Sequencer({name:'randomMoveSequence'});
	randomMoveSequence.addChild(selectLocation);
	randomMoveSequence.addChild(moveTo);
	randomMoveSequence.addChild(pause);

	var detectEgonSequencer = new Kiwi.Plugins.AITree.Sequencer({name:'detectEgonSequencer'});
	detectEgonSequencer.addChild(detectEgon);
	detectEgonSequencer.addChild(appear);

	var detectEgonSelector = new Kiwi.Plugins.AITree.Selector({name:'detectEgonSelector'});
	detectEgonSelector.addChild(detectEgonSequencer);
	detectEgonSelector.addChild(randomMoveSequence);

	var detectHitSequencer = new Kiwi.Plugins.AITree.Sequencer({name:'detectHitSequencer'});
	detectHitSequencer.addChild(detectHit);
	detectHitSequencer.addChild(hit);

	var dashSequence = new Kiwi.Plugins.AITree.Sequencer({name:'dashSequence'});
	dashSequence.addChild(detectVisible);
	dashSequence.addChild(dashTargetSelect);
	dashSequence.addChild(dashPause);
	dashSequence.addChild(dash);

	var dashSelector = new Kiwi.Plugins.AITree.Selector({name:'dashSelector'});
	dashSelector.addChild(dashSequence);
	dashSelector.addChild(detectEgonSelector);

	var detectHitSelector = new Kiwi.Plugins.AITree.Selector({name:'detectHitSelector'});
	detectHitSelector.addChild(detectHitSequencer);
	detectHitSelector.addChild(dashSelector);

	aiTree.addChild(detectHitSelector);


	this.ai = aiTree;

	////////////////////////////////////////////////////
	//END AI SETUP


};