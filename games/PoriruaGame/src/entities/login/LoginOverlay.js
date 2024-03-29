var LoginOverlay = function(state){
	Kiwi.Group.call(this, state);
	this.state = state;
	this.game = this.state.game;
	game.huds.defaultHUD.removeAllWidgets();

	this.background = new Kiwi.GameObjects.StaticImage(this.state, this.state.textures.overlay, 0, 0);
	this.overlayLogin = new Kiwi.GameObjects.StaticImage(this.state, this.state.textures.overlayLogin, 305 - 130, 112 - 80);

	this.stopCalls = false;


	////////////
	//Create Four buttons to be pressed.
	this.okButton = new Kiwi.GameObjects.Sprite(this.state, this.state.textures.okLogin, 590- 130, 442 - 80);
	this.backLogin = new Kiwi.GameObjects.Sprite(this.state, this.state.textures.backLogin, 315 - 130, 442 - 80);
	this.createAccountLogin = new Kiwi.GameObjects.Sprite(this.state, this.state.textures.createAccountLogin, 558 - 130, 268 - 80);
	this.facebookLogin = new Kiwi.GameObjects.Sprite(this.state, this.state.textures.facebookLogin, 671 - 130, 317 - 80);


	//////////////////
	//Create two HUDinput objects
	this.usernameText = new HUDInput(game, "text", 420 - 130, 188  - 80);
    this.usernameText.input.style.backgroundColor = "#b0d9e6";
    this.usernameText.input.style.width = "280px";
    this.usernameText.input.style.height = "24px";


	this.passwordText = new HUDInput(game, "password", 420 - 130, 221  - 80);
	this.passwordText.input.style.backgroundColor = "#b0d9e6";
    this.passwordText.input.style.width = "280px";
    this.passwordText.input.style.height = "24px";


	this.state.addChild(this.background);
	this.state.addChild(this.overlayLogin);
	this.state.addChild(this.okButton);
	this.state.addChild(this.backLogin);
	this.state.addChild(this.createAccountLogin);
	this.state.addChild(this.facebookLogin);

	this.game.huds.defaultHUD.addWidget(this.usernameText);
	this.game.huds.defaultHUD.addWidget(this.passwordText);



	this.createAccountLogin.input.onUp.add(this.createAccount, this);
	this.okButton.input.onUp.add(this.okButtonHit, this);
	this.backLogin.input.onUp.add(this.backLoginHit, this);


	this.state.game.input.onUp.add(this.facebookLoginHit, this);


}
Kiwi.extend(LoginOverlay , Kiwi.Group);

LoginOverlay.prototype.update = function(){
	Kiwi.Group.prototype.update.call(this);

}

LoginOverlay.prototype.remove = function() {
	this.background.exists = false;
	this.overlayLogin.exists = false;
	this.state.noOverlay = true;



	////////////
	//Create Four buttons to be pressed.
	this.okButton.exists = false;
	this.backLogin.exists = false;
	this.createAccountLogin.exists = false;
	this.facebookLogin.exists = false;


	this.state.game.huds.defaultHUD.removeAllWidgets();
	//this.state.addBoard();


	this.createAccountLogin.input.onUp.remove(this.createAccount, this);
	this.okButton.input.onUp.remove(this.okButtonHit, this);
	this.backLogin.input.onUp.remove(this.backLoginHit, this);

	this.state.game.input.onUp.remove(this.facebookLoginHit, this);


	this.state.addScoreUI();
	this.state.addBoard();
};

LoginOverlay.prototype.createAccount = function(){

	if(this.stopCalls) return;

	console.log("createAccount");
	this.stopCalls = true;
	this.remove();
	this.state.startSignUp();
}


LoginOverlay.prototype.okButtonHit = function(){
	console.log("okButtonHit");

	if(this.stopCalls) return;

	var data = { username: this.usernameText.input.value, password: this.passwordText.input.value };

	this.game.user.login( data, function(loggedIn) {

		if(loggedIn) {

			//Logged in G
			this.remove();
			this.state.submitScore();


		} else {
			//Error management code here...
			console.log('Yo zach, error code goes here for failing to login.')

		}

		this.stopCalls = false;

	}, this);

}


LoginOverlay.prototype.backLoginHit = function(){

	if(this.stopCalls) return;

	console.log("backLoginHit");
	this.stopCalls = true;
	this.remove();

}


LoginOverlay.prototype.facebookLoginHit = function(x,y){


	if( !this.facebookLogin.box.hitbox.contains(x,y) ) return;


	if(this.stopCalls) return;

	console.log("facebookLoginHit");
	this.stopCalls = true;

	if(!this.game.user.facebookLogin( function(loggedIn) {

		if(loggedIn) {
			this.remove();
			this.state.submitScore();
		} else {
			//
			alert('Could not log you in.');	
		}

		this.stopCalls = false;

	}, this)) {
		this.stopCalls = false;
	}

}