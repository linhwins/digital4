window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        game.load.image('popeye', 'assets/popeye1.png');
        game.load.image('bullet', 'assets/bullet0.png');
        game.load.image('banana', 'assets/spin2.png');

    }
    
    var sprite;
    var bullets;
    var veggies;
    var cursors;
    var bananas; 
    
    var score = 0;
    var score_text; 
    var gameOver; 
    
    var timer;

    var bulletTime = 0;
    var bullet;
    
    var spawner; 

  
    function create() {
        game.stage.backgroundColor = '#00FFFF';
        //game.physics.startSystem(Phaser.Physics.ARCADE);
        //game.physics.arcade.gravity.y = 60;

    //  This will check Group vs. Group collision (bullets vs. veggies!)

    /*veggies = game.add.group();
    veggies.enableBody = true;
    veggies.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 50; i++)
    {
        var c = veggies.create(game.world.randomX, Math.random() * 500, 'veggies', game.rnd.integerInRange(0, 36));
        c.name = 'veg' + i;
        c.body.immovable = true;
    }*/ 
        
        //introduce the notion of a time limit.
        timer = game.time.create(false);
        //30 second timer
        timer.loop(Phaser.Timer.SECOND * 30, stopGame, this); //will kill timer once stopGame is called
        timer.start();
        
        spawner = game.time.create(false);
        spawner.loop(Phaser.Timer.SECOND * 0.9, spawnBananas, this);
        spawner.start();
        
        bananas = game.add.group();

        //  We will enable physics for any treat that is created in this group
        bananas.enableBody = true;

        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < 20; i++)
        {
            var b = bullets.create(0, 0, 'bullet');
            b.name = 'bullet' + i;
            b.exists = false;
            b.visible = false;
            b.checkWorldBounds = true;
            b.events.onOutOfBounds.add(resetBullet, this);
        }
        //550
        sprite = game.add.sprite(400, 400, 'popeye');
        game.physics.enable(sprite, Phaser.Physics.ARCADE);

        cursors = game.input.keyboard.createCursorKeys();
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
        
         //  The score
        score_text = game.add.text(16, 16, 
            'Score: ' + score, { fontSize: '32px', fill: '#9999ff' });
        
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        var text = game.add.text( game.world.centerX, 50, "Feed the fish! Press space to hook the worms", style );
        text.anchor.setTo( 0.5, 0.0 );
    }  
    
    
    function update() {
        
         //  As we don't need to exchange any velocities or motion we can the 'overlap' check instead of 'collide'
        game.physics.arcade.overlap(bullets, bananas, collisionHandler, null, this);

        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;

        if (cursors.left.isDown)
        {
            sprite.body.velocity.x = -200;
        }
        else if (cursors.right.isDown)
        {
            sprite.body.velocity.x = 200;
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
        {
            fireBullet();
        }
       
    }
    
    
       //randomly spawns treats on a timer
    function spawnBananas() {
        var banana = bananas.create((Math.random() * 700)+50, 0, 'banana'); //spawns a treat at a random location
        
        //format for the treat (its settings)
        //scale down the treats
        banana.scale.x -= 0.8;
        banana.scale.y -= 0.8;

        //  Let gravity do its thing
        banana.body.gravity.y = 250;
        //found a bug where treats that hit the ground didn't actually hit the ground and fell through
        banana.body.collideWorldBounds = true;

        //  This just gives each treat a slightly random bounce value
        banana.body.bounce.y = 0.7 + Math.random() * 0.3;
        
        //now give random x velocity
        var num = Math.random(); //if the random number generated is less than 0.5, then we move right
        var modifier = 0;
        if (num < 0.5)
            modifier = 1; //moves to the right direction
        else
            modifier = -1; //moves to the left direction
        
        banana.body.velocity.x = (Math.random() * 200 * modifier) + (100 * modifier); //random number between 100 <-> 300 || -300 <-> -100
    }
    
    
    function fireBullet () {

        if (game.time.now > bulletTime)
        {
            bullet = bullets.getFirstExists(false);

            if (bullet)
            {
                bullet.reset(sprite.x + 6, sprite.y - 0);
                bullet.body.velocity.y = -300;
                bulletTime = game.time.now + 150;
            }
        }

    }
    
    
    function resetBullet (bullet) {

        bullet.kill();

    }
    
    function collisionHandler (bullet, banana) {

        bullet.kill();
        banana.kill();
        
        score = score + 10;
        score_text.text = "Score: " + score;

    }
    
     
    //terminates the game
    function stopGame() {
        //stop the timer
        timer.stop();
        //reset game input
        game.input.reset();
        
        game.input.keyboard.enabled = false; //stop keyboard usage
        
        
        //add text to tell the player the game ended
        var text = game.add.text(350, 32, "Game Over", {fontSize: '32px', fill: '##9999ff'});

    }
    
    
};
