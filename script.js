/*
    I HAD TO LEARN BASIC GEOMETRY AGAIN JUST TO DO THIS SHIT FUCK FUCK FUCK FUCK FUCK aaaaaaAAAAAAAAAAAAAAAAAAAAAAAAA

    many sleepless nights for this barebone ass game i hate this shit but i learned a lot icl frfr
*/

class Champion {
  constructor() {
    this.canvas = document.getElementById("gameCanvas"); //main canvas ng game, kung saan dito nangyayari yung gameplay
    this.ctx = this.canvas.getContext("2d"); //set the context as 2d as our game is 2d
    this.scoreboard = document.getElementById("score"); //scoreboard of the game
    this.expBoard = document.getElementById("exp");
    this.lvlBoard = document.getElementById("lvl");

    this.currScore = 0; //current score ni user
    this.champSize = 30; //size ng champ / character
    this.champColor = "blue"; //color ng champ / character
    this.mousePos = { x: 0, y: 0 }; //default pos of the mouseX and mouseY
    this.shots = []; // array of shots. para madami lumabas at magamit
    this.enemy = []; // array of enemy, para madami din
    this.allowShot = true; //checks if pwede mag shoot or naw
    this.level = 1;
    this.levelExpReq = 100;
    this.currentExp = 0;
    this.timer = 2000;

    this.setupCanvas(); //sets the canvas properties
    this.setupListeners(); //sets the event listeners
    this.drawChamp(); //creates the champ / character
    this.animateShot(); //animates the shot
    this.collisionUpd();

    setInterval(() => {
      //this interval spawns 1 enemy every 500ms
      this.spawnEnemy();
    }, 500);

    setInterval(() => {
      if (this.enemy.length > 0) {
        this.enemy.shift(); // remove the first enemy in the arr
      }
    }, 1000);
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth; //changes the width of the canvas to the screens width
    this.canvas.height = window.innerHeight; //changes the height of the canvas to the screens height
    this.champ = {
      //this positions the champ to the center of the screen
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };
  }

  setupListeners() {
    document.addEventListener("mousemove", (event) => {
      //this is to check kung saang angle mag shoshoot yung shoot function
      this.mousePos.x = event.clientX;
      this.mousePos.y = event.clientY;
    });

    document.addEventListener("keydown", (event) => {
      //if true then let them shoot pag no then dont do shit
      if (event.key === "q" || event.key === "Q") {
        //checks if q is pressed
        if (!this.allowShot) {
        } else {
          this.shoot();
        }
      }
    });

    document.addEventListener("click", (event) => {
      //checks mouse click sir
      if (this.isAnimating) {
        this.cancelAnimation(); //if animating then cancel the animation agad
      }

      this.moveChamp(event.clientX, event.clientY); //gives the x and y of the mouse when the click was received
    });
  }

  moveChamp(targetX, targetY) {
    //movechamp moves the champ to the given x and y from the click listener
    const champX = this.champ.x; //takes the current x (or horizontal) of the champ
    const champY = this.champ.y; //takes the current y (or vertical) of the champ

    const deltaX = targetX - champX; //gano kalayo ang distance x kay champ x
    const deltaY = targetY - champY; //gano kalayo ang distance y kay champ y
    this.rotation = Math.atan2(deltaY, deltaX); //old code idek what this was for

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); //gano kalayo ang total distance ni champ sa target click
    const speed = 0.12; //speed ni champ
    const duration = distance / speed; //how long itll take for champ to go to distance
    let initTime; //initial time

    const updateMove = (currTime) => {
      if (!initTime) {
        initTime = currTime; //if walang value ang inittime then set it as the curr time
      }

      const time = currTime - initTime; //total time of the travel
      const progress = Math.min(time / duration, 1); // if 1 then its animating if no then its not
      const easeOut = (t) => 1 - --t * t * t * t; //para lang sa animation

      this.champ.x = champX + deltaX * easeOut(progress); //the new x of the champ
      this.champ.y = champY + deltaY * easeOut(progress); //the new y of the champ

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //clears the canvas for the animation
      this.drawChamp(); //draws the champion, para mag animate while being moved

      for (const shot of this.shots) {
        this.drawShot(shot); //animates all the shots na asa shots array
      }

      for (const enemy of this.enemy) {
        this.drawEnemy(enemy); //animates all the enemy isnide the enemy array
      }

      if (progress < 1) {
        //if less than 1 then move it
        this.currAnim = requestAnimationFrame(updateMove);
        requestAnimationFrame(this.animateShot);
      } else {
        this.isAnimating = false;
        this.collisionUpd();
      }
    };

    this.isAnimating = true;
    this.currAnim = requestAnimationFrame(updateMove);
  }

  shoot() {
    if (!this.allowShot) {
      //return nothing if di pwede mag shoot
      return;
    }

    const skillShot = {
      //properties ng skillshot / shot
      x: this.champ.x, //starts sa current x ng champ
      y: this.champ.y, //starts the current y ng champ
      size: 10,
      color: "purple",
      speed: 20,
      animation: null, //no animation yet
    };

    const deltaX = this.mousePos.x - this.champ.x; // same sa delta x ni champ
    const deltaY = this.mousePos.y - this.champ.y; //same sa delta y ni champ
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); //same lang din sa distance ng champ
    skillShot.speedX = (deltaX / distance) * skillShot.speed; //the speed na need ng skillshot for x
    skillShot.speedY = (deltaY / distance) * skillShot.speed; //the speed na need ng skillshot for y

    this.shots.push(skillShot); //add the skillshot to the shots array
    this.allowShot = false; //set the allowshot to false para di maka shoot

    setTimeout(() => {
      this.allowShot = true;
    }, this.timer); //every time na mag shoot si champ, add a 2s cooldown para balanced
  }

  animateShot() {
    try {
      const updShot = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //clears the canvas
        this.drawChamp(); //draws the champion para ma animate yung shots

        for (let i = 0; i < this.shots.length; i++) {
          //iterates thru the shots array
          const shot = this.shots[i]; //takes the current shot
          shot.x += shot.speedX; //sets the x to the speed for x
          shot.y += shot.speedY; //sets the y to the speed for y
          this.drawShot(shot); //draws the shot

          for (let j = 0; j < this.enemy.length; j++) {
            //collision block, iterates thru the enemy array
            const enemy = this.enemy[j]; //takes the current enemy
            const distance = Math.sqrt(
              (shot.x - enemy.x) ** 2 + (shot.y - enemy.y) ** 2
            ); //how far the shot and the enemy is
            if (distance < shot.size + enemy.size) {
              //if mas konti ang size ni shot and enemy added then it means nagkaroon ng collision
              this.shots.splice(i, 1); //remove the current shot and 1 element
              this.enemy.splice(j, 1); //remove the current enemy and 1 element
              i--; // -1 to the shot
              j--; // -1 to the enemy
              this.currScore += 50; //weehoo +50 sa score baby
              this.scoreboard.innerHTML = "Score: " + this.currScore; //set the current html text ng score
              this.userLevel();
              break;
            }
          }

          if (
            shot.x < 0 ||
            shot.x > this.canvas.width ||
            shot.y < 0 ||
            shot.y > this.canvas.height
          ) {
            this.shots.splice(i, 1); //if out of bounds na sa canvas then just remove it to lessen the render
            i--; // -1  sa shot
          }
        }
        requestAnimationFrame(() => updShot());
      };

      updShot();
    } catch (error) {} // wag tanggalin. masisira ang buhay mo.
  }

  spawnEnemy() {
    const Enemy = {
      //properties muna ni enemy
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: 15,
      color: "red",
      speed: 2,
      isActive: true,
    };

    const updateEnemy = () => {
      const deltaX = this.champ.x - Enemy.x; //distX
      const deltaY = this.champ.y - Enemy.y; //distY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); //distance or gano kalayo yung enemy sa champ
      Enemy.speedX = (deltaX / distance) * Enemy.speed; //speedX and speedY is the next distance of the enemy
      Enemy.speedY = (deltaY / distance) * Enemy.speed;

      Enemy.x += Enemy.speedX;
      Enemy.y += Enemy.speedY;

      for (const nextEnemy of this.enemy) {
        //now we do collision, the unfun part
        if (nextEnemy !== Enemy && nextEnemy.isActive) {
          const distEnemy = Math.sqrt(
            (Enemy.x - nextEnemy.x) ** 2 + (Enemy.y - nextEnemy.y) ** 2
          );
          const min = Enemy.size + nextEnemy.size;

          if (distEnemy < min) {
            const angle = Math.atan2(
              //get the tan / the next angle of the current enemy and the new enemy
              Enemy.y - nextEnemy.y,
              Enemy.x - nextEnemy.x
            );
            Enemy.x = nextEnemy.x + min * Math.cos(angle); //these two to avoid overlapping
            Enemy.y = nextEnemy.y + min * Math.sin(angle); //these two to avoid overlapping
          }
        }
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawChamp();

      //itong dalawang for loop is just to render every of the element
      for (const enemy of this.enemy) {
        this.drawEnemy(enemy);
      }

      for (const shot of this.shots) {
        this.drawShot(shot);
      }

      this.collisionUpd();

      if (
        Enemy.x < 0 ||
        Enemy.x > this.canvas.width ||
        Enemy.y < 0 ||
        Enemy.y > this.canvas.height
      ) {
        Enemy.isActive = false; //if out of bouynds na sa canvas yung current x and y ni enemy, despawn it / di na active
      }

      if (Enemy.isActive) {
        Enemy.animation = requestAnimationFrame(updateEnemy);
      }
    };

    this.enemy.push(Enemy); //add the enemy to the array sir

    updateEnemy(); //animate the shit out of it
  }
  drawEnemy(circle) {
    //creates the circle (red) for enemy
    this.ctx.beginPath();
    this.ctx.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
    this.ctx.fillStyle = circle.color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawShot(shot) {
    //creates the shots
    this.ctx.beginPath();
    this.ctx.arc(shot.x, shot.y, shot.size, 0, 2 * Math.PI);
    this.ctx.fillStyle = shot.color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawChamp() {
    //creates the champ
    this.ctx.beginPath();
    this.ctx.arc(
      this.champ.x,
      this.champ.y,
      this.champSize / 2,
      0,
      2 * Math.PI
    );
    this.ctx.fillStyle = this.champColor;
    this.ctx.fill();
    this.ctx.closePath();
  }

  cancelAnimation() {
    //aww no more animation FUCK YOU VERY MUCH.
    cancelAnimationFrame(this.currAnim);
    this.isAnimating = false;
  }

  collisionUpd() {
    //checks for collision sa enemy to champ
    for (let j = 0; j < this.enemy.length; j++) {
      const enemy = this.enemy[j];
      const distance = Math.sqrt(
        (this.champ.x - enemy.x) ** 2 + (this.champ.y - enemy.y) ** 2
      );

      if (distance < this.champSize / 2 + enemy.size) {
        alert("GG noob u got the cheese touche");
        this.resetGame();
        this.userLevel();
        return;
      }
    }
  }

  resetGame() {
    //resets everything to start over
    this.currScore = 0;
    this.scoreboard.innerHTML = "Score: " + this.currScore;
    this.shots = [];
    this.enemy = [];
    this.levelExpReq = 100;
    this.level = 1;
    this.currentExp = 0;
  }

  userLevel() {
    //adds level to the game
    this.currentExp += 20;
    if (this.currentExp >= this.levelExpReq) {
      this.attackFrenzy();
      this.level += 1;
      this.levelExpReq += 100;
      this.currentExp = 0;
    }

    this.expBoard.innerHTML =
      "Exp: " + this.currentExp + "/" + this.levelExpReq;
    this.lvlBoard.innerHTML = "Lvl: " + this.level;
  }

  attackFrenzy() {
    this.allowShot = true;
    this.timer = 0;
    setTimeout(() => {
      this.timer = 2000;
    }, 5000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const champion = new Champion(); //annddd instance of the class to start this shit
});
