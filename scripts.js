// Setting up the scene, camera, and renderer
const scene = new THREE.Scene();

// Load the nebula texture for the background
const loader = new THREE.TextureLoader();
const nebulaTex = loader.load('path/to/nebula.jpg', texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5); // Repeat the texture to cover the background
});
scene.background = nebulaTex;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('3d-scene').appendChild(renderer.domElement);

// Adding ambient and point lights for better visual effects
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00ff00, 1.5);
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff00ff, 1.5);
pointLight2.position.set(-10, -10, -10);
scene.add(pointLight2);

// Custom Shader Material for Pulsating Effect
const pulsatingShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x00ff00) },
        emissive: { value: new THREE.Color(0x001100) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec3 pos = position;
            pos.y += sin(time + position.x * 2.0) * 0.1; // Pulsating effect
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        uniform vec3 emissive;
        varying vec2 vUv;
        void main() {
            gl_FragColor = vec4(color, 1.0) * vUv.y + vec4(emissive, 1.0) * 0.5;
        }
    `
});

// Creating rotating 3D cubes with neon edges and wireframe effect
const geometry = new THREE.BoxGeometry();
const cubes = [];

for (let i = 0; i < 10; i++) {
    const cube = new THREE.Mesh(geometry, pulsatingShaderMaterial);
    cube.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    );
    cube.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );

    // Add wireframe effect to the cubes
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 }));
    cube.add(line);

    cubes.push(cube);
    scene.add(cube);
}

// Adding multiple floating spheres with neon outlines and wireframe effect
const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const spheres = [];

for (let i = 0; i < 10; i++) {
    const sphere = new THREE.Mesh(sphereGeometry, pulsatingShaderMaterial);
    sphere.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    );

    // Add wireframe effect to the spheres
    const sphereEdges = new THREE.EdgesGeometry(sphereGeometry);
    const sphereLine = new THREE.LineSegments(sphereEdges, new THREE.LineBasicMaterial({ color: 0x00ffcc, linewidth: 1.5 }));
    sphere.add(sphereLine);

    spheres.push(sphere);
    scene.add(sphere);
}

// Particle system for hyperspace animation
const particleCount = 1000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const color = new THREE.Color();

for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 100; // Start particles behind the camera
    
    color.setHSL(i / particleCount, 1.0, 0.5);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Animating the scene
function animate() {
    requestAnimationFrame(animate);

    // Update shader uniform time
    pulsatingShaderMaterial.uniforms.time.value += 0.05;

    // Rotate the cubes
    cubes.forEach(cube => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        // Apply glitch effect to the cubes
        cube.position.x += (Math.random() - 0.5) * 0.1;
        cube.position.y += (Math.random() - 0.5) * 0.1;
    });

    // Float the spheres with a smooth gaming vibe
    spheres.forEach(sphere => {
        sphere.position.y += Math.sin(Date.now() * 0.001 + sphere.position.x) * 0.01;
        sphere.position.x += Math.cos(Date.now() * 0.001 + sphere.position.y) * 0.01;
        
        // Rotate the spheres for added effect
        sphere.rotation.y += 0.01;
        
        // Apply glitch effect to the spheres
        sphere.position.x += (Math.random() - 0.5) * 0.1;
        sphere.position.y += (Math.random() - 0.5) * 0.1;
    });

    // Update particle positions for hyperspace animation
    const particlePositions = particles.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3 + 2] += 0.5; // Move particles forward
        if (particlePositions[i * 3 + 2] > 100) particlePositions[i * 3 + 2] = -100; // Reset position
    }
    particles.attributes.position.needsUpdate = true;

    // Animate the nebula background
    nebulaTex.offset.x += 0.001; // Move the background texture to create a dynamic effect
    nebulaTex.offset.y += 0.001;

    renderer.render(scene, camera);
}

animate();

// Responsive resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Adding interaction to the cubes (color changes to vibrant neon when clicked)
cubes.forEach(cube => {
    cube.userData = { isInteractive: true };
});

window.addEventListener('click', event => {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubes);
    
    intersects.forEach(intersect => {
        if (intersect.object.userData.isInteractive) {
            // Change to random neon colors
            intersect.object.material.uniforms.color.value.set(Math.random() * 0xffffff);
            intersect.object.material.uniforms.emissive.value.set(Math.random() * 0x00ff00);
        }
    });
});

const aboutSection = document.querySelector('.about-section');
const gifImage = document.querySelector('.gif-image');

aboutSection.addEventListener('mouseenter', () => {
  // Play the GIF animation
  gifImage.style.animationPlayState = 'running';

  // Set a timeout to pause the GIF after it plays once
  setTimeout(() => {
    gifImage.style.animationPlayState = 'paused'; // Pause the GIF
  }, 1000); // Adjust this duration to match the duration of your GIF
});