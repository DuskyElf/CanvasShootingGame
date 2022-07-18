// JavaScript for a cool 2d shooting Game
// Followed Html Canvas Tutorial - https://www.youtube.com/watch?v=eI9idPTT0c4
// By DuskyElf

// Canvas Initilazation
const canvas = document.getElementById("MainCanvas")
const ctx = canvas.getContext("2d")
const scoreEl = document.getElementById("score")
const restartMenu = document.getElementById("restartMenu")
const endScore = document.getElementById("endScore")
const restartBtn = document.getElementsByClassName("btn")
canvas.width = innerWidth
canvas.height = innerHeight
restartMenu.style.display = 'none'

// --------------- Classes ----------------

// Player Model
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

// Projectile Model
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// Enemy Model
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.98
// Particle Model
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.02
    }
}

// ----------- Game Initializations -------------

// Center points
const x = canvas.width / 2
const y = canvas.height / 2

// Global Objects
let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let score = 0

// --------------- Main Functions ---------------

// Creating Enemies
function spawnEnemies() {
    setInterval(()=>{
        // Calculating Enemy properties
        const radius = Math.random() * (30 - 7) + 7

        let x
        let y

        if (Math.random() < 0.5){
            x = Math.random()<0.5 ? 0-radius : canvas.width+radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random()<0.5 ? 0-radius : canvas.height+radius
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x
        )
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

// Main Loop
let animationID
function animate() {
    // Canvas Animation Ready state
    animationID = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Updating Player
    player.draw()

    // Updating Particles
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0){
            particles.splice(index, 1)
        }
        else {
            particle.update()
        }
    })

    // Updating Projectiles
    projectiles.forEach((projectile, index) => {
        projectile.update()

        // Despawning non reachable Particles
        // Performance Enhancing
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
            ){
            
            // Updating Score
            if (score - 200 > 0){
                score -= 200
                scoreEl.innerText = score
            } else{
                score = 0
                scoreEl.innerText = score
            }
            setTimeout(() => {
                projectiles.splice(index, 1)}, 0)
        }
    })

    // Updating Enemies
    enemies.forEach((enemy, index) => {
        enemy.update()

        // Checking if Player got hit by enemy
        const dist = Math.hypot(player.x - enemy.x,
            player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 1){
            restartMenu.style.display = ''
            endScore.innerText = score
            
            cancelAnimationFrame(animationID)
        }

        // Checking if Enemy got hit
        projectiles.forEach((projectile, pro_index) => {
            const dist = Math.hypot(projectile.x - enemy.x,
                projectile.y - enemy.y)
            
            if (dist - enemy.radius - projectile.radius < 1){
                // Creating Particles
                for (let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x, 
                        projectile.y, 
                        Math.random() * 2, 
                        enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 8),
                        y: (Math.random() - 0.5) * (Math.random() * 8)
                    }))
                }

                // Despawning Enemies and Projectiles
                if (enemy.radius - 10 > 7) {
                    // Updating Score
                    score += 100
                    scoreEl.innerText = score
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(pro_index, 1)}, 0)
                } else {
                    // Updating Score
                    score += 250
                    scoreEl.innerText = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(pro_index, 1)}, 0)
                }
            }
        })
    })
}

function restart(){
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    restartMenu.style.display = 'none'
    scoreEl.innerText = score
    animate()
}

// Event Listener
addEventListener('click', (event)=> {
    // Calculating Projectile Velocity
    const angle = Math.atan2(
        event.clientY - y,
        event.clientX - x
    )
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    // Creating Projectile
    projectiles.push(new Projectile(
        x, y, 5, 'white', velocity
    ))
})

animate()
spawnEnemies()
