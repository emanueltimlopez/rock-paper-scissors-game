let game = null;

let gameScene = new Phaser.Scene('Game');
let resultScene = new Phaser.Scene('Result');
let menuScene = new Phaser.Scene('Menu');

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [menuScene, gameScene, resultScene]
};

window.onload = () => {
  game = new Phaser.Game(config);
}

gameScene.preload = function() {
  this.load.image('rock', 'assets/rock.png');
  this.load.image('paper', 'assets/paper.png');
  this.load.image('scissors', 'assets/scissors.png');
  this.load.image('live', 'assets/live.png');
  this.load.image('bg', 'assets/bg.jpg');
}

gameScene.create = function() {
  this.add.image(0, 0, 'bg').setOrigin(0, 0);
  
  var rect = new Phaser.Geom.Rectangle(this.sys.game.config.width / 2 - 80, 0, 170, this.sys.game.config.height);
  var graphics = this.add.graphics({ fillStyle: { color: 0xffffff } });
  graphics.fillRectShape(rect);

  this.player = this.add
    .sprite(this.sys.game.config.width / 2, this.sys.game.config.height - 100, 'rock')
    .setScale(0.8)
    .setOrigin(0.5);

  this.enemy = this.add
    .sprite(this.sys.game.config.width / 2, 0, 'rock')
    .setScale(0.8)
    .setOrigin(0.5);

  this.live_01 = this.add
    .sprite(50, 50, 'live')
    .setScale(0.3)
    .setOrigin(0.5);

  this.live_02 = this.add
    .sprite(120, 50, 'live')
    .setScale(0.3)
    .setOrigin(0.5);

  this.live_03 = this.add
    .sprite(190, 50, 'live')
    .setScale(0.3)
    .setOrigin(0.5);

  this.rockKey = this.input.keyboard.addKey('A');
  this.paperKey = this.input.keyboard.addKey('S');
  this.scissorsKey = this.input.keyboard.addKey('D');

  this.enemyOption = 'rock';
  this.enemyFinish = true;
  this.score = 0;
  this.lives = 3;
  this.activePlay = 'rock';

  const scoreFont = "80px Arial";
  this.scoreLabel = this.add.text(this.sys.game.config.width - 150, 10, "0", 
    {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 15}); 
}

const getOption = () => {
  const option = Math.floor(Math.random() * 3) + 1  
  if (option === 1) {
    return 'rock';
  } else if (option === 2) {
    return 'paper';
  } else if (option === 3) {
    return 'scissors';
  } 
}

const newEnemy = function() {
  const option = getOption();
  this.enemy.setTexture(option);
  this.enemyOption = option;
}

const win = function(enemyOption, playerOption) {
  if (enemyOption === 'rock') {
    if (playerOption === 'paper') {
      return true;
    }
    return false;
  } else if (enemyOption === 'paper') {
    if (playerOption === 'scissors') {
      return true;
    }
    return false;   
  } else if (enemyOption === 'scissors') {
    if (playerOption === 'rock') {
      return true;
    }
    return false;  
  }
}

gameScene.update = function() {

  if (this.enemyFinish) {
    newEnemy.call(this);
    this.enemyFinish = false;
    this.enemy.x = this.sys.game.config.width / 2;
    this.enemy.y = 0;
  } else {
    this.enemy.y += 5;
    if (this.score > 10) {
      this.enemy.y += 3;
    }
  }

  if (this.enemy.y > (this.player.y - 100)) {
    this.tweens.add({
      targets: this.player,
      alpha: 0.5,
      ease: 'Cubic.easeOut',  
      duration: 200,
      repeat: 0,
      yoyo: true
    });

    if (win(this.enemyOption, this.activePlay)) {
      this.score += 1;

      const scoreFont = "70px Arial";
      const scoreAnimation = this.add
        .text(this.sys.game.config.width / 2, this.sys.game.config.height - 100, '+1', 
          {font: scoreFont, fill: "#39d179", stroke: "#ffffff", strokeThickness: 10})
        .setOrigin(0.5);
      
      var tween = this.tweens.add({
        targets: scoreAnimation,
        x: this.sys.game.config.width - 120,               
        y: 70,               
        ease: 'Power2',
        duration: 1000,
        repeat: 0,            
        yoyo: false,
        onComplete: () => {
          this.scoreLabel.text = this.score;
          scoreAnimation.destroy();
        }
      });

    } else {
      this.cameras.main.shake(300);
      this.lives -= 1;
      if (this.lives == 2) {
        this.live_03.destroy()
      } else if (this.lives == 1) {
        this.live_02.destroy()
      } else {
        this.live_01.destroy()
      }
    }

    this.enemyFinish = true;
  }

  if (this.lives === 0) {
    setTimeout(() => this.scene.start('Result', { score: this.score }), 500);
  }

  if (this.rockKey.isDown) {
    this.activePlay = 'rock';
    this.player.setTexture('rock');
  } else if (this.paperKey.isDown) {
    this.activePlay = 'paper';
    this.player.setTexture('paper');
  } else if (this.scissorsKey.isDown) {
    this.activePlay = 'scissors';
    this.player.setTexture('scissors');
  }
};

resultScene.preload = function() {
  this.load.image('bg', 'assets/bg.jpg');
}

resultScene.create = function(data) {
  this.add.image(0, 0, 'bg').setOrigin(0, 0);

  this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 100, 'Final score',
    { font: "40px Arial", fill: "#eba352", backgroundColor: 'rgba(255,255,255,1)' }).setOrigin(0.5);
  this.add.text(this.sys.game.config.width / 2, (this.sys.game.config.height / 2 - 50) + 50, data.score, 
    {font: "70px Arial", fill: "#ffffff", stroke: "#535353", strokeThickness: 15}).setOrigin(0.5);

  this.add
    .text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 150, 'RESTART', 
    { font: "50px Arial", fill: "#ffdd67", stroke: "#eba352", strokeThickness: 10 })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.scene.start('Game'));
}

menuScene.preload = function() {
  this.load.audio('music', 'assets/music_cut.mp3');
  this.load.image('rock', 'assets/rock.png');
  this.load.image('paper', 'assets/paper.png');
  this.load.image('scissors', 'assets/scissors.png');
  this.load.image('keys', 'assets/keys.png');
  this.load.image('bg', 'assets/bg.jpg');
}

menuScene.create = function() {
  var music = this.sound.add('music');
  music.setLoop(true);
  music.play();

  this.add.image(0, 0, 'bg').setOrigin(0, 0);

  const rockImage = this.add
    .sprite(this.sys.game.config.width / 2 - 100, 170, 'rock')
    .setScale(0.8)
    .setOrigin(0.5);

  this.tweens.add({
    targets: rockImage,
    alpha: 0.5,
    ease: 'Cubic.easeOut',  
    duration: 500,
    delay: 500,
    repeat: -1,
    yoyo: true
  });

  const paperImage = this.add
    .sprite(this.sys.game.config.width / 2, 170, 'paper')
    .setScale(0.8)
    .setOrigin(0.5);

  this.tweens.add({
    targets: paperImage,
    alpha: 0.5,
    ease: 'Cubic.easeOut',  
    duration: 500,
    delay: 1000,
    repeat: -1,
    yoyo: true
  });

  const scissorsImage = this.add
    .sprite(this.sys.game.config.width / 2 + 100, 170, 'scissors')
    .setScale(0.8)
    .setOrigin(0.5);

  this.tweens.add({
    targets: scissorsImage,
    alpha: 0.5,
    ease: 'Cubic.easeOut',  
    duration: 500,
    delay: 1500,
    repeat: -1,
    yoyo: true
  });

  this.add
    .sprite(this.sys.game.config.width / 2, 290, 'keys')
    .setScale(0.9)
    .setOrigin(0.5);

  this.add
    .text(this.sys.game.config.width / 2, 450, 'START', 
    { font: "50px Arial", fill: "#ffdd67", stroke: "#eba352", strokeThickness: 10 })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.scene.start('Game'));

  this.add.text(this.sys.game.config.width - 100, this.sys.game.config.height - 40, 'v.1.0.0',
    { font: "20px Arial", fill: "#000000", backgroundColor: 'rgba(255,255,255,1)' });
}