let gameInterval; // Declare this outside to keep its scope global
const gameArea = document.getElementById('gameArea');
const scoreBoard = document.getElementById('score');
let snake, direction, food, score;

// let model;
// async function loadModel() {
//     model = await tf.loadLayersModel('https://teachablemachine.withgoogle.com/models/_eMeJRrvb/');
//     console.log('Model loaded successfully');
// }

// Creating a new function to load the speech model
let recognizer;

document.addEventListener('DOMContentLoaded', async () => {
    await initVoiceModel(); //Loads the speech model
    initializeGame(); //Initializes game
});

function startListening() {
    setupRecognizer(); // Starts listening for voice commands
}

async function initializeGame() {
    //await initVoiceModel(); // Ensure the voice model is loaded
    gameArea.innerHTML = ''; // Clear the game area

    gameArea.innerHTML = ''; // Clear the game area
    snake = [{ x: 10, y: 10 }]; // Reset snake to starting position
    direction = { x: 0, y: 0 }; // Reset movement direction
    food = { x: 5, y: 5 }; // Place initial food
    score = 0; // Reset score
    scoreBoard.textContent = score; // Update score display

    // Remove any existing interval to prevent multiple loops
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        updateGame();
        drawGame();
    }, 1000); // Adjust the interval for game speed
    
    // Generate initial food and snake rendering
    drawGame();
}

async function initVoiceModel() {
    const URL = "https://teachablemachine.withgoogle.com/models/_eMeJRrvb/";
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    recognizer = speechCommands.create(
        "BROWSER_FFT", // Fourier transform type, not useful to change
        undefined, // Speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // Check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();
    console.log('Speech model loaded successfully');

    //Setup the recognizer to listen for voice commands
    setupRecognizer();
}

function setupRecognizer() {
    recognizer.listen(result => {
        const scores = result.scores; //probability of prediction for each class
        const commands = recognizer.wordLabels(); //get class labels
        const commandIndex = scores.indexOf(Math.max(...scores)); //get index of highest score
        const command = commands[commandIndex];

        switch (command) {
            case 'up':
                if (direction.y === 0) direction = { x: 0, y: -1 };
                break;
            case 'down':
                if (direction.y === 0) direction = { x: 0, y: 1 };
                break;
            case 'left':
                if (direction.x === 0) direction = { x: -1, y: 0 };
                break;
            case 'right':
                if (direction.x === 0) direction = { x: 1, y: 0};
                break;
        }
        console.log(command);
    

    }, {
        includeSpectrogram: false, //Set to false if you don't need the spectrogram
        probabilityThreshold: 0.6,
        invokeCallbackonNoiseAndUnknown: true,
        overlapFactor: 0.50 //Adjust as needed
    });
}

function drawGame() {
    gameArea.innerHTML = ''; // Clear the game area before redrawing

    // Draw the snake
    snake.forEach(segment => {
        const snakeElement = document.createElement('div');
        snakeElement.classList.add('snake');
        snakeElement.style.gridRowStart = segment.y;
        snakeElement.style.gridColumnStart = segment.x;
        gameArea.appendChild(snakeElement);
    });

    // Draw the food
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food');
    gameArea.appendChild(foodElement);
}

function updateGame() {
    // Move the snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreBoard.textContent = score;
        placeFood();
    } else {
        snake.pop(); // Remove the tail unless the snake has eaten
    }

    // Check for collision with the wall or itself
    if (head.x < 1 || head.x > 20 || head.y < 1 || head.y > 20 || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        clearInterval(gameInterval); // Stop the game loop
        alert("Game Over. Your score was: " + score + ". Press OK to restart.");
        initializeGame(); // Directly restart the game
    }
}

function placeFood() {
    let newFoodPosition;
    do {
        newFoodPosition = {
            x: Math.floor(Math.random() * 20) + 1,
            y: Math.floor(Math.random() * 20) + 1
        };
    } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
    
    food = newFoodPosition;
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) direction = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (direction.y === 0) direction = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (direction.x === 0) direction = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (direction.x === 0) direction = { x: 1, y: 0 }; break;
    }
});
