var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by 48089748z on 21/04/16.
 */
var MyGame;
(function (MyGame) {
    var mainState = (function (_super) {
        __extends(mainState, _super);
        function mainState() {
            _super.apply(this, arguments);
        }
        mainState.prototype.preload = function () {
            _super.prototype.preload.call(this);
            if (this.game.device.desktop) {
                this.game.cursors = this.input.keyboard.createCursorKeys();
            }
        };
        mainState.prototype.create = function () {
            _super.prototype.create.call(this);
            this.configMAP();
            this.configPLAYER();
            this.configBULLETS();
            this.configCOINS();
            this.configEXPLOSIONS();
            this.configPOLITICIANS();
            this.configTEXTS();
        };
        mainState.prototype.update = function () {
            _super.prototype.update.call(this);
            if (this.game.politicians.countLiving() == 0) {
                this.game.LEVEL += 1;
                this.newLevel();
            }
            this.physics.arcade.collide(this.game.coins, this.game.player, this.getCoin, null, this);
            this.physics.arcade.collide(this.game.politicians, this.game.player, this.politicianHitPlayer, null, this);
            this.physics.arcade.collide(this.game.player, this.game.walls);
            this.physics.arcade.collide(this.game.bullets, this.game.walls, this.destroyBullet, null, this);
            this.physics.arcade.collide(this.game.bullets, this.game.politicians, this.destroyPolitician, null, this);
            this.physics.arcade.collide(this.game.politicians, this.game.politicians);
            this.physics.arcade.collide(this.game.politicians, this.game.walls);
            this.game.player.rotation = this.physics.arcade.angleToPointer(this.game.player, this.input.activePointer);
            this.game.levelText.setText("LEVEL: " + this.game.LEVEL + "        Level Enemies: " + this.game.LEVEL * 10 + "     Level Coins: " + this.game.LEVEL * 3 + "\n                     Killed Enemies: " + this.game.TOTAL_KILLED + "     Taken Coins: " + this.game.TAKEN_COINS);
            this.onMouseLeftClick();
        };
        mainState.prototype.getCoin = function (player, coin) {
            coin.kill();
            this.game.SCORE += 20;
            this.game.TAKEN_COINS += 1;
            this.game.scoreText.setText("PLAYER: " + this.game.player.NAME + "\nSCORE: " + this.game.SCORE);
        };
        mainState.prototype.politicianHitPlayer = function (player, politician) {
            politician.kill();
            this.game.SCORE -= 100;
            player.health -= 1;
            this.game.scoreText.setText("PLAYER: " + this.game.player.NAME + "\nSCORE: " + this.game.SCORE);
            this.game.livesText.setText("LIVES: " + this.game.player.health);
            if (player.health == 0) {
                player.kill();
                this.game.informationText.setText("GAME OVER\nCLICK TO RESTART");
                this.input.onTap.addOnce(this.finishGame, this);
            }
        };
        mainState.prototype.finishGame = function () {
            this.game.LEVEL = 1;
            this.game.SCORE = 0;
            this.checkIfHighScore();
            this.game.state.restart();
        };
        mainState.prototype.newLevel = function () {
            this.checkIfHighScore();
            this.game.state.restart();
        };
        mainState.prototype.checkIfHighScore = function () {
            var highScore = localStorage.getItem("highScore");
            if (highScore == null || highScore < this.game.SCORE) {
                localStorage.setItem("highScore", this.game.SCORE.toString());
                localStorage.setItem("highUser", this.game.player.NAME);
            }
        };
        mainState.prototype.destroyPolitician = function (bullet, politician) {
            this.game.SCORE += 10;
            this.game.TOTAL_KILLED += 1;
            this.game.scoreText.setText("PLAYER: " + this.game.player.NAME + "\nSCORE: " + this.game.SCORE);
            bullet.explosion.doExplode(bullet.body.x, bullet.body.y);
            politician.kill();
            bullet.kill();
        };
        mainState.prototype.destroyBullet = function (bullet, wall) {
            bullet.kill();
            bullet.explosion.doExplode(bullet.body.x, bullet.body.y);
        };
        mainState.prototype.configCOINS = function () {
            this.game.coins = this.add.group();
            this.game.coins.enableBody = true;
            for (var x = 0; x < this.game.LEVEL * 3; x++) {
                var randomX = this.game.rnd.integerInRange(50, 1500);
                var randomY = this.game.rnd.integerInRange(200, 700);
                var coin = new MyGame.Coin(this.game, randomX, randomY, 'coin', 0);
                this.game.coins.add(coin);
            }
        };
        mainState.prototype.configPOLITICIANS = function () {
            this.game.politicians = this.add.group();
            this.game.politicians.physicsBodyType = Phaser.Physics.ARCADE;
            this.game.politicians.enableBody = true;
            for (var x = 0; x < this.game.LEVEL * 10; x++) {
                var randomX = this.game.rnd.integerInRange(300, 1500);
                var randomY = this.game.rnd.integerInRange(200, 700);
                var politician = new Politician(this.game, randomX, randomY, 'pablo', 0);
                this.game.politicians.add(politician);
            }
        };
        mainState.prototype.onMouseLeftClick = function () {
            if (this.input.activePointer.isDown && this.time.now > this.game.NEXT_FIRE) {
                var bullet = this.game.bullets.getFirstDead();
                if (bullet) {
                    var x = this.game.player.x + (Math.cos(this.game.player.rotation) * this.game.player.width * 0.3 + 3);
                    var y = this.game.player.y + (Math.sin(this.game.player.rotation) * this.game.player.width * 0.3 + 3);
                    bullet.reset(x, y);
                    bullet.angle = this.game.player.angle;
                    var velocity = this.physics.arcade.velocityFromRotation(bullet.rotation, this.game.BULLET_SPEED);
                    bullet.body.velocity.setTo(velocity.x, velocity.y);
                    this.game.NEXT_FIRE = this.time.now + this.game.FIRE_RATE;
                }
            }
        };
        mainState.prototype.configTEXTS = function () {
            this.game.scoreText = this.add.text(50, 0, 'PLAYER: ' + this.game.player.NAME + '\nSCORE: ' + this.game.SCORE, { font: "30px Arial", fill: "#000000" });
            this.game.scoreText.fixedToCamera = true;
            this.game.livesText = this.add.text(1600, 20, 'LIVES: ' + this.game.player.health, { font: "30px Arial", fill: "#000000" });
            this.game.livesText.fixedToCamera = true;
            this.game.informationText = this.add.text(this.world.centerX, this.world.centerY, '', { font: "130px Arial", fill: "#000000" });
            this.game.informationText.anchor.setTo(0.5, 0.5);
            this.game.levelText = this.add.text(this.world.centerX, 35, "LEVEL: " + this.game.LEVEL + "        Level Enemies: " + this.game.LEVEL * 10 + "     Level Coins: " + this.game.LEVEL * 3 + "\n                     Killed Enemies: " + this.game.TOTAL_KILLED + "     Taken Coins: " + this.game.TAKEN_COINS, { font: "20px Arial", fill: "#000000" });
            this.game.levelText.anchor.setTo(0.5, 0.5);
            this.game.levelText.fixedToCamera = true;
            this.game.highestScoreText = this.add.text(this.world.centerX, this.world.height - 30, "HIGHEST SCORE: " + localStorage.getItem("highScore") + " by " + localStorage.getItem("highUser"), { font: "50px Arial", fill: "#000000" });
            this.game.highestScoreText.anchor.setTo(0.5, 0.5);
            this.game.highestScoreText.fixedToCamera = true;
        };
        mainState.prototype.configMAP = function () {
            switch (this.game.LEVEL) {
                case 1: {
                    this.game.stage.backgroundColor = "#FFFFFF";
                    break;
                }
                case 2: {
                    this.game.stage.backgroundColor = "#FFF700";
                    break;
                }
                case 3: {
                    this.game.stage.backgroundColor = "#89FF00";
                    break;
                }
                case 4: {
                    this.game.stage.backgroundColor = "#00FCFF";
                    break;
                }
                case 5: {
                    this.game.stage.backgroundColor = "#FF00C4";
                    break;
                }
                case 6: {
                    this.game.stage.backgroundColor = "#FF0000";
                    break;
                }
                default: {
                    this.game.stage.backgroundColor = "#6E6E6E";
                    break;
                }
            }
            this.game.walls = this.add.group();
            for (var x = 1; x < 19; x++) {
                var upperWall = new MyGame.Wall(this.game, (x - 1) * 100, 0, 'upper_wall', 0);
                this.saveWall(upperWall);
                var lowerWall = new MyGame.Wall(this.game, (x - 1) * 100, this.world.height - 100, 'lower_wall', 0);
                this.saveWall(lowerWall);
                if (x < this.game.LEVEL) {
                    var obstacle = new MyGame.Wall(this.game, this.world.centerX, x * 200, 'obstacle', 0);
                    this.saveWall(obstacle);
                    obstacle = new MyGame.Wall(this.game, this.world.centerX - 500, x * 200, 'obstacle', 0);
                    this.saveWall(obstacle);
                    obstacle = new MyGame.Wall(this.game, this.world.centerX + 500, x * 200, 'obstacle', 0);
                    this.saveWall(obstacle);
                }
            }
        };
        mainState.prototype.saveWall = function (wall) {
            this.game.add.existing(wall);
            this.game.walls.add(wall);
        };
        mainState.prototype.configPLAYER = function () {
            var player = new MyGame.Player(localStorage.getItem("username").toString(), this.game.PLAYER_LIVES, this.game, +50, this.world.centerY, 'player', null);
            this.game.player = this.add.existing(player);
        };
        mainState.prototype.configBULLETS = function () {
            this.game.bullets = this.add.group();
            this.game.bullets.enableBody = true;
            this.game.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            for (var x = 0; x < 30; x++) {
                var bullet = new MyGame.Bullet(this.game, 'bullet');
                this.game.bullets.add(bullet);
            }
        };
        mainState.prototype.configEXPLOSIONS = function () {
            this.game.explosions = this.add.group();
            this.game.explosions.enableBody = true;
            for (var x = 0; x < 3000; x++) {
                var explosion = new MyGame.Explosion(this.game);
                this.game.explosions.add(explosion);
            }
        };
        return mainState;
    })(Phaser.State);
    MyGame.mainState = mainState;
})(MyGame || (MyGame = {}));
//# sourceMappingURL=MainState.js.map