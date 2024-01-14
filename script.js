/*
    I HAD TO LEARN BASIC GEOMETRY AGAIN JUST TO DO THIS SHIT FUCK FUCK FUCK FUCK FUCK aaaaaaAAAAAAAAAAAAAAAAAAAAAAAAA

    many sleepless nights for this barebone ass game i hate this shit but i learned a lot icl frfr
*/

//clear rect always before animating

// THIS GAME ALWAYS SCALE, ITLL KEEP SCALING AS LONG AS THE GAME PROGRESS

/* TODO:
          - maybe balancing? idk man this shit too hard in the long run cuz of the scaling
          - I STILL DONT KNOW MANE
          - wat */

function togglePopup() {
  document.getElementById("popup1").classList.toggle("active");
} //presents our game description/instructions to the user

class Champion {
  constructor() {
    this.canvas = document.getElementById("gameCanvas"); //main canvas ng game, kung saan dito nangyayari yung gameplay
    this.ctx = this.canvas.getContext("2d"); //set the context as 2d as our game is 2d
    this.scoreboard = document.getElementById("score"); //scoreboard of the game
    this.expBoard = document.getElementById("exp");
    this.lvlBoard = document.getElementById("lvl");
    this.events = document.getElementById("gameEvent");
    this.timeDiv = document.getElementById("time");
    this.frenzyDiv = document.getElementById("frenzycount");

    this.currScore = 0; //current score ni user
    this.champSize = 30; //size ng champ / character
    this.enemySpeed = 1.5;
    this.bigEnemySpeed = 3;
    this.shotSpeed = 10;
    this.champRad = 200;
    this.champColor = "#08B2E3"; //color ng champ / character
    this.oldX = 0;
    this.oldY = 0;
    this.mousePos = { x: 0, y: 0 }; //default pos of the mouseX and mouseY
    this.shots = []; // array of shots. para madami lumabas at magamit
    this.turrets = [];
    this.turretShots = [];
    this.enemy = []; // array of enemy, para madami din
    this.miniboss = [];
    this.crates = [];
    this.luckHit = false;
    this.luck = 10;
    this.allowShot = true; //checks if pwede mag shoot or naw
    this.allowFrenzy = true;
    this.spawnBoss = false;
    this.frenzyCount = 0;
    this.level = 1;
    this.levelExpReq = 100;
    this.currentExp = 0;
    this.timerShot = 800;
    this.timerEnemy = 1000;
    this.timerTurret = 5000;
    this.timerBoss = 8000;
    this.shotCount = 2;
    this.oldShotCount = 2;
    this.gameover = false;
    this.startTime = Date.now();

    this.setupCanvas(); //sets the canvas properties
    this.setupListeners(); //sets the event listeners
    this.drawChamp(); //creates the champ / character
    this.animateShot(); //animates the shot
    this.animateTurretShot();
    this.collisionUpd();
    this.timers(); //for intervals and timeouts
    this.gameTime();
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

      if (event.key === "w" || event.key === "W") {
        if (this.allowFrenzy) {
          this.attackFrenzy();
        } else {
          return;
        }
      }
    });

    document.addEventListener("click", (event) => {
      //checks mouse click sir
      if (this.isAnimating) {
        this.cancelAnimation(); //if animating then cancel the animation agad
      }

      if (this.oldX !== event.clientX && this.oldY !== event.clientY) {
        this.moveChamp(event.clientX, event.clientY); //gives the x and y of the mouse when the click was received
      } else {
        return;
      }
    });

    window.addEventListener("resize", (event) => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }

  moveChamp(targetX, targetY) {
    if (targetX !== this.oldX && targetY !== this.oldY) {
      cancelAnimationFrame(this.currAnim);
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
        this.render();
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
    } else {
      return;
    }
    this.oldX = this.champ.x;
    this.oldY = this.champ.y;
  }

  shoot() {
    if (!this.allowShot) {
      //return nothing if di pwede mag shoot
      return;
    }

    for (let i = 0; i < this.shotCount; i++) {
      //loop sa shotCount, shotCount basically tells how many shot we need to shoot
      setTimeout(() => {
        const skillShot = {
          //properties ng skillshot / shot
          x: this.champ.x, //starts sa current x ng champ
          y: this.champ.y, //starts the current y ng champ
          size: 5,
          color: "white",
          speed: 20,
          animation: null,
        };

        const deltaX = this.mousePos.x - this.champ.x; // same sa delta x ni champ
        const deltaY = this.mousePos.y - this.champ.y; //same sa delta y ni champ
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); //same lang din sa distance ng champ
        skillShot.speedX = (deltaX / distance) * skillShot.speed; //the speed na need ng skillshot for x
        skillShot.speedY = (deltaY / distance) * skillShot.speed;

        this.shots.push(skillShot); //lagay ang shots sa shots array

        if (i === this.shotCount - 1) {
          // if last shot na, lagay na natin yung delay on each shot
          setTimeout(() => {
            this.allowShot = true;
          }, this.timerShot); //i timeout natin para may 2sec delay ang shots
        }
      }, i * 100); // and 100 delay on each shot
    }
    this.allowShot = false;
  }

  animateShot() {
    try {
      const updShot = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //clear the canvas
        this.drawChamp(); //draw the champ

        for (let i = this.shots.length - 1; i >= 0; i--) {
          //loop thru the shots array
          const shot = this.shots[i]; //take the curr index
          shot.x += shot.speedX; //set the curr index x and y to the speedX and speedY
          shot.y += shot.speedY;
          this.drawShot(shot); //draw the shot para smooch

          for (let j = this.enemy.length - 1; j >= 0; j--) {
            //loop thru the enemy array
            const enemy = this.enemy[j]; //take the curr enemy index
            const distance = Math.sqrt(
              //how far the curr enemy is to the curr shot
              (shot.x - enemy.x) ** 2 + (shot.y - enemy.y) ** 2
            );
            if (distance < shot.size + enemy.size) {
              //if mas konti ang distance kaisa sa size ng shot and enemy added up, nagka collision
              this.shots.splice(i, 1); //remove 1 from the shot
              enemy.health -= 20;
              if (enemy.health <= 0) {
                this.enemy.splice(j, 1); //remove 1 from the enemy
                if (enemy.type === "boss") {
                  this.currScore += 100; // +100 sa score
                  this.currentExp += 80; // +80 sa exp
                } else {
                  this.currScore += 50; // +50 sa score
                  this.currentExp += 20; // +20 sa exp
                }
                this.scoreboard.innerHTML = "Score: " + this.currScore;
                this.userLevel();
                break;
              }
              break;
            }
          }

          for (let j = this.turrets.length - 1; j >= 0; j--) {
            const turret = this.turrets[j]; //loop thru the turrets array and take the curr turret
            const distance = Math.sqrt(
              (shot.x - turret.x) ** 2 + (shot.y - turret.y) ** 2 //take the distance of the shsot and the turret
            );
            if (distance < shot.size + turret.size) {
              //same logic sa enemy lang naman to so fuck you very much
              turret.alive = false;
              this.shots.splice(i, 1);
              this.turrets.splice(j, 1);
              this.currScore += 100;
              this.currentExp += 50;
              this.scoreboard.innerHTML = "Score: " + this.currScore;
              this.userLevel();
              break;
            }
          }

          for (let j = this.crates.length - 1; j >= 0; j--) {
            const crate = this.crates[j]; //loop thru the turrets array and take the curr turret
            const distance = Math.sqrt(
              (shot.x - crate.x) ** 2 + (shot.y - crate.y) ** 2 //take the distance of the shsot and the turret
            );
            if (distance < shot.size + crate.size) {
              //same logic sa enemy lang naman to so fuck you very much
              this.shots.splice(i, 1);
              this.crates.splice(j, 1);
              let rLuck = Math.random() * 100;
              if (rLuck <= this.luck) {
                if (this.allowFrenzy) {
                  this.shotCount++;
                }
                this.oldShotCount++;
                this.luckHit = true;
              } else {
                this.enemyHorde();
              }
              console.log(rLuck);
              break;
            }
          }
          if (
            shot.x < 0 ||
            shot.x > this.canvas.width ||
            shot.y < 0 ||
            shot.y > this.canvas.height
          ) {
            this.shots.splice(i, 1);
          }
        }

        requestAnimationFrame(() => updShot());
      };

      updShot();
    } catch (error) {
      //WAG NIYO TANGGALIN TONG HAYOP NA TO PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE
    }
  }

  spawnEnemy() {
    let pos = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
    };

    while (this.getDistance(pos, this.champ) < this.champRad) {
      pos = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
      };
    } //man idk what the fuck
    let Enemy = {};
    if (!this.spawnBoss) {
      Enemy = {
        //properties muna ni enemy
        x: pos.x,
        y: pos.y,
        size: 15,
        color: "#DA3E52",
        speed: this.enemySpeed,
        health: 20,
        isActive: true,
        type: "normal",
      };
    } else {
      Enemy = {
        x: pos.x,
        y: pos.y,
        size: 40,
        color: "#EDA2F2",
        speed: 4,
        health: 100,
        isActive: true,
        type: "boss",
      };
      this.spawnBoss = false;
    }

    const updateEnemy = () => {
      //nah lemme cook rq
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
      // Check for collision with turrets
      for (const turret of this.turrets) {
        const distTurret = Math.sqrt(
          (Enemy.x - turret.x) ** 2 + (Enemy.y - turret.y) ** 2
        );
        const min = Enemy.size + turret.size;

        if (distTurret < min) {
          const angle = Math.atan2(Enemy.y - turret.y, Enemy.x - turret.x);
          Enemy.x = turret.x + min * Math.cos(angle);
          Enemy.y = turret.y + min * Math.sin(angle);
        }
      }

      // Check for collision with crates
      for (const crate of this.crates) {
        const distCrate = Math.sqrt(
          (Enemy.x - crate.x) ** 2 + (Enemy.y - crate.y) ** 2
        );
        const min = Enemy.size + crate.size;

        if (distCrate < min) {
          const angle = Math.atan2(Enemy.y - crate.y, Enemy.x - crate.x);
          Enemy.x = crate.x + min * Math.cos(angle);
          Enemy.y = crate.y + min * Math.sin(angle);
        }
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawChamp();
      this.render();
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
      } else {
        const index = this.enemy.indexOf(Enemy);
        if (index > -1) {
          this.enemy.splice(index, 1);
        }
      }
    };

    this.enemy.push(Enemy); //add the enemy to the array sir

    updateEnemy(); //animate the shit out of it
  }

  spawnTurrets() {
    const turret = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: 30,
      color: "#F4D35E",
      speed: 15,
      alive: true,
      animation: null,
      shootingInterval: null,
    }; //properties ng turrets

    this.turrets.push(turret); //push sa turret array
    this.updateTurretAnimation(turret); //animation for shooting

    const shootInterval = 1600;

    const shoot = () => {
      if (turret.alive) {
        //if alive, let the turret shoot
        this.shootChamp(turret);
      } else {
        //else tanggalin na natin yung ability to shoot
        clearInterval(turret.shootingInterval);
        cancelAnimationFrame(turret.animation);
        this.turretShots = this.turretShots.filter(
          (shot) => shot.turret !== turret
        );
      }
    };

    turret.shootingInterval = setInterval(shoot, shootInterval);
  }

  updateTurretAnimation(turret) {
    if (!turret.alive) {
      return;
    }
    const updateTurret = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawChamp();
      this.render();
      requestAnimationFrame(updateTurret);
    };

    turret.animation = requestAnimationFrame(updateTurret);
  }
  shootChamp(turret) {
    //sets the array
    const turretShot = {
      x: turret.x,
      y: turret.y,
      size: 4,
      color: "yellow",
      speed: this.shotSpeed,
      animation: null,
    }; //shots ng turret properties

    //the rest nito is parang sa shoot and animateshot
    const deltaX = this.champ.x - turret.x;
    const deltaY = this.champ.y - turret.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    turretShot.speedX = (deltaX / distance) * turretShot.speed;
    turretShot.speedY = (deltaY / distance) * turretShot.speed;

    this.turretShots.push(turretShot); //push sa turretShot array
  }
  animateTurretShot() {
    //animates the shots
    const updateTurretShot = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawChamp();
      this.render();

      for (let i = 0; i < this.turretShots.length; i++) {
        const shot = this.turretShots[i];
        shot.x += shot.speedX;
        shot.y += shot.speedY;
        this.drawShot(shot);

        const distanceToChamp = Math.sqrt(
          (shot.x - this.champ.x) ** 2 + (shot.y - this.champ.y) ** 2
        );

        if (distanceToChamp < shot.size + this.champSize / 2) {
          alert("GG noob, turret hit you, git gud actually");
          this.resetGame();
          this.userLevel();
          return;
        }

        if (
          shot.x < 0 ||
          shot.x > this.canvas.width ||
          shot.y < 0 ||
          shot.y > this.canvas.height
        ) {
          this.turretShots.splice(i, 1);
          i--;
        }
      }
      requestAnimationFrame(() => updateTurretShot());
    };
    updateTurretShot();
  }
  spawnCrates() {
    const crates = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: 50,
    };

    this.crates.push(crates);
  }

  drawCrates(crates) {
    this.ctx.beginPath();
    this.ctx.rect(crates.x, crates.y, crates.size, crates.size);
    this.ctx.fillStyle = "rgb(0,0,0)";
    this.ctx.fill();
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    this.ctx.closePath();
  }
  drawTurret(turret) {
    const triangleSize = turret.size;
    const halfSize = triangleSize / 2;

    const angle = Math.atan2(this.champ.y - turret.y, this.champ.x - turret.x);

    const x1 = turret.x - halfSize * Math.cos(angle);
    const y1 = turret.y - halfSize * Math.sin(angle);

    const x2 = turret.x + halfSize * Math.cos(angle);
    const y2 = turret.y + halfSize * Math.sin(angle);

    const x3 = turret.x + halfSize * Math.cos(angle + Math.PI / 1.5);
    const y3 = turret.y + halfSize * Math.sin(angle + Math.PI / 1.5);

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);

    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fill();

    this.ctx.strokeStyle = turret.color;
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawEnemy(circle) {
    //creates the circle (red) for enemy
    this.ctx.beginPath();
    this.ctx.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
    this.ctx.strokeStyle = circle.color;
    this.ctx.lineWidth = 3;

    this.ctx.stroke();
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
        this.gameover = true;
        this.resetGame();
        this.userLevel();
        return;
      }
    }
  }
  enemyHorde() {
    console.log("spawning horde");
    this.timerEnemy = 10; //how long it takes for da enemy to spawn
    this.timerTurret = 20; //how long it takes for the turret to spawn

    // enemy interval, spawn every 40ms
    const spawnEnemyInterval = setInterval(() => {
      this.spawnEnemy();
    }, this.timerEnemy);

    // turret interval, spawn every 50ms
    const spawnTurretInterval = setInterval(() => {
      this.spawnTurrets();
    }, this.timerTurret);

    // reset after 100 sec
    setTimeout(() => {
      clearInterval(spawnEnemyInterval);
      clearInterval(spawnTurretInterval);
      this.timerEnemy = 1000; // reset
      this.timerTurret = 5000; // reset
      console.log("horde stops");
    }, 100); // reset after 100ms, should spawn around a few enemy and few turrets
  }
  resetGame() {
    //resets everything to start over
    this.currScore = 0;
    this.levelExpReq = 100;
    this.level = 1;
    this.currentExp = 0;
    this.scoreboard.innerHTML = "Score: " + this.currScore;
    this.shots = [];
    this.enemy = [];
    this.turrets = [];
    this.turretShots = [];
    location.reload();
  }

  userLevel() {
    if (this.currentExp >= this.levelExpReq) {
      let remainingExp = this.currentExp - 100;
      this.frenzyCount += 1;
      this.level += 1;
      this.levelExpReq += 50;
      this.currentExp = remainingExp;
    }

    this.expBoard.innerHTML =
      "Exp: " + this.currentExp + "/" + this.levelExpReq;
    this.lvlBoard.innerHTML = "Lvl: " + this.level;
    this.frenzyDiv.innerHTML = "Frenzy Count: " + this.frenzyCount;
  }
  attackFrenzy() {
    if (this.frenzyCount > 0) {
      if (this.allowFrenzy) {
        this.allowFrenzy = false;
        this.frenzyCount -= 1;
        this.allowShot = true;
        this.timerShot = 0;
        this.shotCount = 1;

        const oldShotCount2 = this.oldShotCount;
        setTimeout(() => {
          this.timerShot = 1000;
          this.allowFrenzy = true;
          if (this.luckHit) {
            this.shotCount = oldShotCount2 + 1;
          } else {
            this.shotCount = oldShotCount2;
          }
          this.luckHit = false;
        }, 5000);
      } else {
        return;
      }
    }
    this.frenzyDiv.innerHTML = "Frenzy Count: " + this.frenzyCount;
  }
  render() {
    //renders all the fucking shit
    for (const shot of this.shots) {
      this.drawShot(shot); //animates all the shots na asa shots array
    }

    for (const enemy of this.enemy) {
      this.drawEnemy(enemy); //animates all the enemy isnide the enemy array
    }

    for (const turret of this.turrets) {
      this.drawTurret(turret);
    }
    for (const turretShots of this.turretShots) {
      this.drawShot(turretShots); //animates the shots
    }
    for (const crate of this.crates) {
      this.drawCrates(crate);
    }
  }
  timers() {
    if (this.crates.length !== 0) {
      setInterval(() => {
        this.crates.shift();
      }, 10000);
    }
    setInterval(() => {
      //this interval spawns 1 enemy every 500ms
      this.spawnEnemy();
    }, this.timerEnemy);
    setInterval(() => {
      this.spawnBoss = true;
    }, this.timerBoss);
    setInterval(() => {
      this.spawnTurrets();
    }, this.timerTurret);

    setInterval(() => {
      this.spawnCrates();
    }, 30000);
    setInterval(() => {
      this.events.innerHTML = "";
      this.events.style.visibility = "visible";
      this.events.innerHTML += "\nEnemies will move faster now.";
      for (const enemies of this.enemy) {
        enemies.speed += 0.5;
      }
      this.enemySpeed += 0.5;
      setTimeout(() => {
        this.events.style.visibility = "hidden";
      }, 4000);
    }, 30000);

    setInterval(() => {
      this.events.style.visibility = "visible";
      this.events.innerHTML +=
        "\nTurrets will spawn faster now, they will also shoot faster now.";
      this.timerTurret -= 500;
      for (const shots of this.turretShots) {
        shots.speed += 1;
      }
      this.shotSpeed += 1;
      setTimeout(() => {
        this.events.style.visibility = "hidden";
      }, 4000);
    }, 40000);
  }

  gameTime() {
    setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.startTime;
      const minutes = Math.floor(elapsedTime / 60000); // convert milliseconds to minutes
      const seconds = ((elapsedTime % 60000) / 1000).toFixed(0); // convert remaining milliseconds to seconds

      this.timeDiv.innerHTML = `Game Time: ${minutes}m ${seconds}s`;
    }, 500); // update every second
  }
  getDistance(point1, point2) {
    let dx = point2.x - point1.x;
    let dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let scoreboard = document.getElementById("score"); //scoreboard of the game
  let expBoard = document.getElementById("exp");
  let lvlBoard = document.getElementById("lvl");
  let desc = document.getElementById("btnTogglePopup");
  let play = document.getElementById("play");
  let time = document.getElementById("time");
  let frenzy = document.getElementById("frenzycount");
  let gameTitle = document.getElementById("Title");
  let ingame = false;

  scoreboard.style.visibility = "hidden";
  expBoard.style.visibility = "hidden";
  lvlBoard.style.visibility = "hidden";
  time.style.visibility = "hidden";
  frenzy.style.visibility = "hidden";

  play.addEventListener("click", () => {
    gameTitle.classList.add("hide");
    desc.style.visibility = "hidden";
    scoreboard.style.visibility = "visible";
    expBoard.style.visibility = "visible";
    lvlBoard.style.visibility = "visible";
    time.style.visibility = "visible";
    play.style.visibility = "hidden";
    frenzy.style.visibility = "visible";

    if (!ingame) {
      const champion = new Champion();
      ingame = true;
    } else {
      return;
    }
  });
  gameTitle.addEventListener("transitionend", () => {
    if (gameTitle.classList.contains("hide")) {
      gameTitle.remove();
    }
  });
});
