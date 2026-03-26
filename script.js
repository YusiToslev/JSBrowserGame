const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = true;
let score = 0;
let health = 3;

class Player {
    constructor() {

        this.width = 40;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 80;
        this.speed = 5;
        this.color = '#00ff00';
    }

    update(keys) {
        
        
        if (keys['ArrowLeft'] || keys['a']) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.x += this.speed;
        }

        
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
    }

    shoot() {
        
        const bullet = new Bullet(
            this.x + this.width / 2 - 2,
            this.y
        );
        bullets.push(bullet);
    }

    draw() {
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); 
        ctx.lineTo(this.x, this.y + this.height); 
        ctx.lineTo(this.x + this.width, this.y + this.height); 
        ctx.closePath();
        ctx.fill();
    }
}




class Bullet {

    constructor(x, y) {

        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 12;
        this.speed = 8;
        this.color = '#ffff00';
    }

    update() {

        this.y -= this.speed;
    }

    draw() {

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {

        return this.y < 0;
    }
}


class Enemy {

    constructor(x, y, type = 'straight') {

        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 2;
        this.color = '#ff0000';
        this.time = 0;
        this.type = type;

        this.originalX = x;
        this.patternOffset = 0;
    }

    update() {

        this.time++;

        switch (this.type) {
            case 'straight':

                this.y += this.speed;
                break;

            case 'sine':
                
                this.y += this.speed;
                this.x = this.originalX + Math.sin(this.time * 0.05) * 60;
                break;

            case 'zigzag':
                
                this.y += this.speed;

                if (Math.floor(this.time / 30) % 2 === 0) {

                    this.x += 1.5;

                } else {

                    this.x -= 1.5;
                }

                break;

            case 'chase':
                
                this.y += this.speed;
                
                const playerCenterX = player.x + player.width / 2;
                const enemyCenterX = this.x + this.width / 2;
                
                if (enemyCenterX < playerCenterX) {

                    this.x += 1.5; 
                } else if (enemyCenterX > playerCenterX) {

                    this.x -= 1.5; 
                }
                
                break;
        }



        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) {

            this.x = canvas.width - this.width;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        
        return this.y > canvas.height;
    }
}


function checkCollision(rect1, rect2) {

    return (

        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}


const player = new Player();
let bullets = [];
let enemies = [];
let spawnCounter = 0;
let spawnRate = 60; 

const keys = {};


window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.code === 'Space') {

        player.shoot();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});


function spawnEnemy() {
    
    const types = ['straight', 'sine', 'zigzag', 'chase'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomX = Math.random() * (canvas.width - 40);

    enemies.push(new Enemy(randomX, -40, randomType));
}


function update() {

    if (!gameRunning) return;

    player.update(keys);

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();

        
        if (bullets[i].isOffScreen()) {

            bullets.splice(i, 1);

            continue;
        }

        for (let j = enemies.length - 1; j >= 0; j--) {

            if (checkCollision(bullets[i], enemies[j])) {

                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;

                break;

            }
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();

        
        if (checkCollision(player, enemies[i])) {
            enemies.splice(i, 1);
            health--;

            if (health <= 0) {
                endGame();
            }
            continue;
        }



        if (enemies[i].isOffScreen()) {
            enemies.splice(i, 1);
            health--;

            if (health <= 0) {
                endGame();
            }
        }
    }

    
    spawnCounter++;
    if (spawnCounter >= spawnRate) {
        spawnEnemy();
        spawnCounter = 0;
        
        if (spawnRate > 30) {
            spawnRate -= 0.5;
        }
    }

    
    if (score >= 100) {
        endGame(true);
    }

    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('health').textContent = health;
    document.getElementById('enemyCount').textContent = enemies.length;
}


function draw() {
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game objects
    player.draw();

    bullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
}


function endGame(won = false) {
    gameRunning = false;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = score;

    if (won) {
        document.getElementById('winMessage').textContent = 'YOU WON!';
    } else {
        document.getElementById('winMessage').textContent = 'You were defeated!';
    }
}


function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
