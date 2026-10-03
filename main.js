import * as THREE from 'three';

const CONFIG = {
    WIDTH: 800,
    HEIGHT: 800,
    DVD_ASPECT_RATIO: 1.5,
    INITIAL_SIZE: 150,
    MIN_SIZE: 5,
    SPEED: 5,
    COLORS: [0x00FF00, 0xFF0000, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF]
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.OrthographicCamera(
    -CONFIG.WIDTH / 2, 
    CONFIG.WIDTH / 2, 
    CONFIG.HEIGHT / 2, 
    -CONFIG.HEIGHT / 2, 
    1, 
    1000
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(CONFIG.WIDTH, CONFIG.HEIGHT);
document.body.appendChild(renderer.domElement);

const dvdState = {
    size: CONFIG.INITIAL_SIZE,
    color: CONFIG.COLORS[0],
    velocity: new THREE.Vector2(CONFIG.SPEED, CONFIG.SPEED),
    mesh: null
};

function createDvdTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DVD', canvas.width / 2, canvas.height / 2 - 20);

    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2 + 45, 90, 20, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('VIDEO', canvas.width / 2, canvas.height / 2 + 45);

    return new THREE.CanvasTexture(canvas);
}

function initObject() {
    const geometry = new THREE.PlaneGeometry(dvdState.size, dvdState.size / CONFIG.DVD_ASPECT_RATIO);
    const material = new THREE.MeshBasicMaterial({
        map: createDvdTexture(),
        color: dvdState.color,
        transparent: true,
        side: THREE.DoubleSide
    });

    dvdState.mesh = new THREE.Mesh(geometry, material);
    dvdState.mesh.position.set(0, 0, 0);
    scene.add(dvdState.mesh);
}

function update() {
    if (!dvdState.mesh) return;

    dvdState.mesh.position.x += dvdState.velocity.x;
    dvdState.mesh.position.y += dvdState.velocity.y;

    const halfWidth = dvdState.mesh.geometry.parameters.width / 2;
    const halfHeight = dvdState.mesh.geometry.parameters.height / 2;
    
    const leftBound = -CONFIG.WIDTH / 2 + halfWidth;
    const rightBound = CONFIG.WIDTH / 2 - halfWidth;
    const topBound = CONFIG.HEIGHT / 2 - halfHeight;
    const bottomBound = -CONFIG.HEIGHT / 2 + halfHeight;

    let hitWall = false;

    if (dvdState.mesh.position.x <= leftBound || dvdState.mesh.position.x >= rightBound) {
        dvdState.velocity.x *= -1;
        dvdState.mesh.position.x = Math.max(leftBound, Math.min(rightBound, dvdState.mesh.position.x));
        hitWall = true;
    }

    if (dvdState.mesh.position.y <= bottomBound || dvdState.mesh.position.y >= topBound) {
        dvdState.velocity.y *= -1;
        dvdState.mesh.position.y = Math.max(bottomBound, Math.min(topBound, dvdState.mesh.position.y));
        hitWall = true;
    }

    if (hitWall) {
        const nextColor = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
        dvdState.mesh.material.color.setHex(nextColor);

        dvdState.size *= 0.85;
        
        if (dvdState.size < 0.1) dvdState.size = 0.1;

        const newWidth = dvdState.size;
        const newHeight = dvdState.size / CONFIG.DVD_ASPECT_RATIO;
        dvdState.mesh.geometry.dispose();
        dvdState.mesh.geometry = new THREE.PlaneGeometry(newWidth, newHeight);

        if (dvdState.size < CONFIG.MIN_SIZE) {
            dvdState.mesh.visible = false;
            dvdState.velocity.set(0, 0); 
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

initObject();
animate();