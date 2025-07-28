document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    // HTML Elementleri
    const gameContainer = document.getElementById('game-container');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const coinsEl = document.getElementById('coins');
    const highscoreEl = document.getElementById('highscore');
    const finalScoreEl = document.getElementById('final-score');
    const earnedCoinsEl = document.getElementById('earned-coins');
    const missionTextEl = document.getElementById('mission-text');
    const missionProgressEl = document.getElementById('mission-progress');
    const powerupContainerEl = document.getElementById('powerup-container');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const shopScreen = document.getElementById('shop-screen');
    const adPromptScreen = document.getElementById('ad-prompt-screen');
    const startGameBtn = document.getElementById('start-game-btn');
    const restartGameBtn = document.getElementById('restart-game-btn');
    const shareScoreBtn = document.getElementById('share-score-btn');
    const mainShopBtn = document.getElementById('shop-btn-main');
    const gameOverShopBtn = document.getElementById('shop-btn-gameover');
    const closeShopBtn = document.getElementById('close-shop-btn');
    const rewardedAdBtn = document.getElementById('rewarded-ad-btn');
    const watchAdForCoinsBtn = document.getElementById('watch-ad-for-coins-btn');
    const skipAdBtn = document.getElementById('skip-ad-btn');
    const shopCoinBalanceEl = document.getElementById('shop-coin-balance');
    const shopTabs = document.querySelectorAll('.tab-link');
    const shopTabContents = document.querySelectorAll('.tab-content');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsBtnGameOver = document.getElementById('settings-btn-gameover');
    const settingsScreen = document.getElementById('settings-screen');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const snakeSizeSelect = document.getElementById('snake-size');
    const classicOpponentToggle = document.getElementById('classic-opponent');
    const masterVolumeSlider = document.getElementById('master-volume');
    const uiVolumeSlider = document.getElementById('ui-volume');
    const effectsVolumeSlider = document.getElementById('effects-volume');
    const levelsBtn = document.getElementById('levels-btn');
    const levelSelectionScreen = document.getElementById('level-selection-screen');
    const levelListContainer = document.getElementById('level-list-container');
    const closeLevelsBtn = document.getElementById('close-levels-btn');
    const livesContainer = document.getElementById('lives-container');
    const livesEl = document.getElementById('lives');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const backToLevelsBtn = document.getElementById('back-to-levels-btn');
    const classicChallengesBtn = document.getElementById('classic-challenges-btn');
    const classicChallengesScreen = document.getElementById('classic-challenges-screen');
    const classicChallengesList = document.getElementById('classic-challenges-list');
    const closeClassicChallengesBtn = document.getElementById('close-classic-challenges-btn');

    // Oyun Ayarları
    const fixedTileCountX = 20;
    let gridSize, tileCountX, tileCountY, snakeSegmentDrawScale;

    // Oyun Değişkenleri
    let snake, food, score, direction, newDirection, touchStartX, touchStartY, gameInProgress, foodEatenCount, currentLevel, obstacles, opponentSnake, foodMoveInterval, levelTimer;
    let floatingTexts = [];
    let specialItems = [];
    let activePowerups = {};
    let gamesPlayed = 0;
    let adContinueUsed = false;
    let baseGameSpeed = 120;
    let currentGameSpeed = baseGameSpeed;
    let specialItemInterval;
    let rotatingBomb;

    // Animasyon Değişkenleri
    let animationFrameId;
    let lastTime = 0;
    let accumulator = 0;
    let lastSnakeForRender = [];

    // Ses Efektleri
    let eatSound, selfCollisionSound, bombCollisionSound, clickSound, gameOverSound, previewSound;
    let uiChannel, effectsChannel;

    // Varsayılan Oyuncu Verileri
    const classicChallenges = [
        { id: 'gurme_10', name: 'Acemi Gurme', type: 'food', target: 10, reward: 10, description: 'Tek oyunda 10 yem topla.' },
        { id: 'gurme_20', name: 'Deneyimli Gurme', type: 'food', target: 20, reward: 20, description: 'Tek oyunda 20 yem topla.' },
        { id: 'gurme_50', name: 'Usta Gurme', type: 'food', target: 50, reward: 50, description: 'Tek oyunda 50 yem topla.' },
        { id: 'bagimli_1', name: 'Yeni Bağımlı', type: 'games', target: 1, reward: 10, description: '1 oyun oyna.' },
        { id: 'bagimli_5', name: 'Deneyimli Bağımlı', type: 'games', target: 5, reward: 20, description: '5 oyun oyna.' },
        { id: 'bagimli_10', name: 'Usta Bağımlı', type: 'games', target: 10, reward: 50, description: '10 oyun oyna.' },
    ];

    const defaultPlayerData = {
        coins: 20,
        highscore: 0,
        lives: 5,
        lastLifeRegenTime: Date.now(),
        classicOpponent: false,
        completedClassicChallenges: [], // Tamamlanan klasik görevlerin ID'leri
        totalFoodEatenSession: 0, // Mevcut oyun oturumunda yenen yem sayısı
        totalGamesPlayed: 0, // Toplam oynanan oyun sayısı
        unlockedRenk: ['green'],
        unlockedHayvan: 'snake', // Düzeltildi: Artık bir dizi değil, bir dize
        unlockedYem: ['apple'],
        unlockedArkaplan: ['dark'],
        unlockedOzelyem: [],
        equippedRenk: 'green',
        equippedArkaplan: 'dark',
        equippedSnakeSize: 'medium',
        activeFoods: ['apple'],
        activePowerups: [],
        unlockedLevels: [1],
    };
    var playerData = {}; // Düzeltildi: let yerine var kullanıldı

    // Veri Yapıları
    const levels = [
        { id: 0, name: 'Klasik Mod', mission: 'En yüksek skoru yap!', config: {} }, // Classic mode handled separately
        { id: 1, name: 'Yeşil Çayır', mission: '10 yem topla', config: { target: 10, progressType: 'food' } },
        { id: 2, name: 'Hız Patikası', mission: 'Duvarlara çarpmadan 15 yem topla', config: { wallsAreBombs: true, target: 15, progressType: 'food' } },
        { id: 3, name: 'Haylaz Yem', mission: 'Yem kaçmadan 10 kere yakala', config: { foodMoves: true, foodMoveInterval: 5000, target: 10, progressType: 'food' } },
        { id: 4, name: 'Mayınlı Bölge', mission: '150 puana ulaş', config: { bombCount: 5, target: 150, progressType: 'score' } },
        { id: 5, name: 'Yılan Düellosu', mission: 'Rakibinden daha uzun ol', config: { opponent: true, target: null, progressType: 'length' } }, // Special case for length
        { id: 6, name: 'Dönen Tuzak', mission: 'Yemin etrafındaki bombaya çarpma', config: { rotatingBomb: true, target: null, progressType: 'survival' } }, // No explicit progress bar
        { id: 7, name: 'Adrenalin', mission: 'Hızlı modda 200 puana ulaş', config: { speedMultiplier: 1.5, target: 200, progressType: 'score' } },
        { id: 8, name: 'Görünmez Labirent', mission: 'Görünmez duvarlara çarpmadan 10 yem topla', config: { invisibleWalls: true, target: 10, progressType: 'food' } },
        { id: 9, name: 'Kontrolsüz Alan', mission: 'Ters kontrollerle 5 yem topla', config: { reversedControls: true, target: 5, progressType: 'food' } },
        { id: 10, name: 'Kıyamet Günü', mission: '60 saniye hayatta kal!', config: { wallsAreBombs: true, bombCount: 3, opponent: true, foodMoves: true, foodMoveInterval: 3000, timer: 60, target: 60, progressType: 'timer' } },
    ];

    const shopItems = {
        renk: [
            { id: 'green', name: 'Yeşil', price: 0, value: '#4caf50' },
            { id: 'blue', name: 'Mavi', price: 50, value: '#2196F3' },
            { id: 'orange', name: 'Turuncu', price: 75, value: '#FF9800' },
            { id: 'red', name: 'Kırmızı', price: 100, value: '#F44336' },
            { id: 'purple', name: 'Mor', price: 120, value: '#9C27B0' },
            { id: 'yellow', name: 'Sarı', price: 150, value: '#FFEB3B' }
        ],
        hayvan: [
            { id: 'snake', name: 'Yılan', price: 0, value: '🐍' },
            { id: 'dragon', name: 'Ejderha', price: 200, value: '🐉' },
            { id: 'caterpillar', name: 'Tırtıl', price: 150, value: '🐛' },
            { id: 'worm', name: 'Solucan', price: 100, value: '🪱' },
            { id: 'lizard', name: 'Kertenkele', price: 250, value: '🦎' },
            { id: 'fish', name: 'Balık', price: 180, value: '🐠' }
        ],
        yem: [
            { id: 'apple', name: 'Elma', price: 0, value: '🍎' },
            { id: 'strawberry', name: 'Çilek', price: 25, value: '🍓' },
            { id: 'orange', name: 'Portakal', price: 25, value: '🍊' },
            { id: 'banana', name: 'Muz', price: 30, value: '🍌' },
            { id: 'grape', name: 'Üzüm', price: 35, value: '🍇' },
            { id: 'cherry', name: 'Kiraz', price: 40, value: '🍒' }
        ],
        arkaplan: [
            { id: 'dark', name: 'Karanlık', price: 0, value: '#111' },
            { id: 'light', name: 'Açık Gri', price: 150, value: '#555' },
            { id: 'blue_sky', name: 'Mavi Gökyüzü', price: 200, value: '#87CEEB' },
            { id: 'forest', name: 'Orman', price: 250, value: '#228B22' },
            { id: 'desert', name: 'Çöl', price: 300, value: '#FAD201' },
            { id: 'space', name: 'Uzay', price: 350, value: '#000033' }
        ],
        ozelyem: [
            { id: '2x', name: '2x Puan', price: 300, value: '✨', description: '15sn puanları ikiye katlar.' },
            { id: 'shield', name: 'Kalkan', price: 400, value: '🛡️', description: '15sn dokunulmazlık sağlar.' },
            { id: 'magnet', name: 'Mıknatıs', price: 500, value: '🧲', description: 'Yemleri kendine çeker.' },
            { id: 'speed', name: 'Hız', price: 250, value: '⚡', description: '10sn yılanı hızlandırır.' },
            { id: 'slow', name: 'Yavaşlat', price: 250, value: '🐢', description: '10sn yılanı yavaşlatır.' },
            { id: 'grow', name: 'Büyü', price: 350, value: '🔼', description: 'Yılanı 2 birim büyütür.' },
            { id: 'shrink', price: 350, value: '🔽', description: 'Yılanı 2 birim küçültür.' }
        ]
    };
    let currentMission = {};

    function initGame(levelId) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        loadData();
        currentLevel = levelId;
        let levelConfig = { ...(levels.find(l => l.id === currentLevel)?.config || {}) };

        if (currentLevel === 0) {
            levelConfig.opponent = playerData.classicOpponent;
            currentMission = {};
            foodEatenCount = 0;
            playerData.totalFoodEatenSession = 0;
            livesContainer.style.display = 'none';
        } else {
            const level = levels.find(l => l.id === currentLevel);
            levelConfig = { ...level.config };
            currentMission = {
                id: currentLevel,
                description: level.mission,
                target: level.config.target || level.config.timer || null,
                reward: 50 * currentLevel,
                type: 'level',
                progressType: level.config.progressType || (level.config.timer ? 'timer' : 'none'),
                startTime: level.config.timer ? Date.now() : null
            };
            foodEatenCount = 0;
            score = 0;
            livesContainer.style.display = 'block';
        }

        updateUI();
        updateMissionUI();

        gameInProgress = true;
        adContinueUsed = false;
        score = 0;
        foodEatenCount = 0;
        baseGameSpeed = 120 / (levelConfig.speedMultiplier || 1);
        currentGameSpeed = baseGameSpeed;
        direction = { x: 1, y: 0 };
        newDirection = { x: 1, y: 0 };

        const startPosition = { x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) };
        snake = [startPosition];
        const size = playerData.equippedSnakeSize || 'medium';
        
        snakeSegmentDrawScale = 1;
        if (size === 'small') snakeSegmentDrawScale = 0.8;
        else if (size === 'large') snakeSegmentDrawScale = 1.2;

        let initialLength = 3;
        for (let i = 1; i < initialLength; i++) {
            snake.push({ x: startPosition.x - i, y: startPosition.y });
        }
        lastSnakeForRender = JSON.parse(JSON.stringify(snake));
        console.log("Initial snake:", snake);
        console.log("gridSize:", gridSize);
        console.log("tileCountX:", tileCountX, "tileCountY:", tileCountY);

        floatingTexts = [];
        specialItems = [];
        activePowerups = {};
        obstacles = [];
        rotatingBomb = null;
        opponentSnake = null;

        if (levelConfig.bombCount) {
            for (let i = 0; i < levelConfig.bombCount; i++) {
                spawnObstacle('bomb');
            }
        }

        if (levelConfig.opponent) {
            opponentSnake = {
                body: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
                direction: { x: 1, y: 0 },
                color: '#E74C3C'
            };
        }

        if (foodMoveInterval) clearInterval(foodMoveInterval);
        if (levelConfig.foodMoves) {
            foodMoveInterval = setInterval(generateFood, levelConfig.foodMoveInterval || 5000);
        }

        if (levelTimer) clearInterval(levelTimer);
        if (currentLevel !== 0 && levels.find(l => l.id === currentLevel)?.config.timer) {
            levelTimer = setInterval(() => {
                updateMissionUI();
                const elapsed = (Date.now() - currentMission.startTime) / 1000;
                if (elapsed >= currentMission.target) {
                    gameOver("Süre Doldu");
                }
            }, 1000);
        }

        generateFood();
        if (levelConfig.rotatingBomb && food) {
            rotatingBomb = { angle: 0, radius: 3, speed: 0.05 };
        }

        updateScoreUI();

        if (specialItemInterval) clearInterval(specialItemInterval);
        specialItemInterval = setInterval(spawnSpecialItem, 5000);

        showModal(null);
        gameContainer.classList.remove('shake');

        lastTime = 0; // Reset lastTime for a new game
        accumulator = 0; // Reset accumulator for a new game
        requestAnimationFrame(gameLoop); // Start the animation loop correctly
    }

    function gameLoop(currentTime) {
        if (!gameInProgress) {
            return;
        }
        animationFrameId = requestAnimationFrame(gameLoop);

        // Handle the very first call where lastTime is 0
        if (lastTime === 0) {
            lastTime = currentTime;
        }

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Prevent large jumps if tab was inactive
        if (deltaTime > 1000) {
            // If a large jump occurs, reset accumulator and lastTime to prevent NaN propagation
            accumulator = 0;
            // We might want to re-render the snake at its current position without interpolation
            // or just let the next frame handle it. For now, let's just prevent NaN.
            draw(1.0); // Draw at current position without interpolation
            return;
        }

        accumulator += deltaTime;

        while (accumulator >= currentGameSpeed) {
            lastSnakeForRender = JSON.parse(JSON.stringify(snake));
            update();
            updatePowerupTimers();
            accumulator -= currentGameSpeed;
        }

        const alpha = accumulator / currentGameSpeed;
        draw(alpha);
    }

    function gameOver(reason = "Kendine Çarptın") {
        gameInProgress = false;
        cancelAnimationFrame(animationFrameId);
        clearInterval(specialItemInterval);
        clearInterval(foodMoveInterval);
        clearInterval(levelTimer);
        gameContainer.classList.add('shake');
        if (score > playerData.highscore) playerData.highscore = score;

        if (currentLevel !== 0) {
            const missionAccomplished = checkLevelCompletion(reason);
            if (missionAccomplished) {
                playerData.coins += currentMission.reward;
                showToast(`Bölüm ${currentLevel} Tamamlandı! +${currentMission.reward} coin`);
                if (currentLevel < levels.length - 1 && !playerData.unlockedLevels.includes(currentLevel + 1)) {
                    playerData.unlockedLevels.push(currentLevel + 1);
                }
                saveData();
                showModal(levelCompleteScreen);
                return;
            } else {
                playerData.lives--;
                showToast(`Görev Başarısız: ${reason}`);
            }
        } else {
            saveData();
        }

        playerData.coins += score;
        playerData.totalGamesPlayed++;

        saveData();
        updateUI();
        finalScoreEl.textContent = score;
        earnedCoinsEl.textContent = score;

        classicChallenges.forEach(challenge => {
            if (challenge.type === 'games' && !playerData.completedClassicChallenges.includes(challenge.id) && playerData.totalGamesPlayed >= challenge.target) {
                playerData.coins += challenge.reward;
                playerData.completedClassicChallenges.push(challenge.id);
                showToast(`Klasik Görev Tamamlandı: ${challenge.name}! +${challenge.reward} coin`);
                saveData();
                updateClassicChallengesUI();
            }
        });

        if (playerData.lives === 0) {
            rewardedAdBtn.style.display = 'inline-block';
            rewardedAdBtn.textContent = '2 Can Kazan (Reklam İzle)';
        } else {
            rewardedAdBtn.style.display = !adContinueUsed ? 'inline-block' : 'none';
            rewardedAdBtn.textContent = 'Devam Et (Reklam İzle)';
        }

        gameOverSound.triggerAttackRelease("8n");
        showModal(gameOverScreen);
        showDeathAnimation();
    }

    function checkLevelCompletion(reason) {
        if (currentLevel === 0) return false;

        const level = levels.find(l => l.id === currentLevel);
        if (!level) return false;

        if (level.config.timer) {
            return reason === "Süre Doldu";
        }

        switch (level.config.progressType) {
            case 'food': return foodEatenCount >= level.config.target;
            case 'score': return score >= level.config.target;
            case 'length': return opponentSnake && snake.length > opponentSnake.body.length;
            case 'timer': return reason === "Süre Doldu";
            default: return true;
        }
    }

    const allModals = [startScreen, gameOverScreen, shopScreen, adPromptScreen, settingsScreen, levelSelectionScreen, levelCompleteScreen, classicChallengesScreen];

    function showModal(modalToShow, fromModal = null) {
        allModals.forEach(modal => {
            if (modal !== modalToShow) {
                modal.classList.remove('active');
            }
        });
        if (modalToShow) {
            modalToShow.classList.add('active');
            if (fromModal) {
                modalToShow.dataset.from = fromModal.id;
            }
        }
    }

    function openShop(fromModal) {
        updateShopUI();
        showModal(shopScreen, fromModal);
    }

    function closeShop() {
        const fromScreenId = shopScreen.dataset.from;
        const fromScreen = fromScreenId ? document.getElementById(fromScreenId) : startScreen;
        showModal(fromScreen);
    }

    function showDeathAnimation() {
        const head = snake[0];
        const animation = currentLevel === 0 ? '💀' : '💔';
        floatingTexts.push({ text: animation, x: head.x, y: head.y, alpha: 1, duration: 1500, fontSize: 2 });
    }

    function continueGame() {
        showFakeAd(3, (success) => {
            if (success) {
                if (playerData.lives === 0) {
                    playerData.lives += 2;
                    playerData.lastLifeRegenTime = Date.now();
                    showToast("2 can kazandın!");
                } else {
                    adContinueUsed = true;
                    snake.splice(1, Math.min(3, snake.length - 1));
                    activePowerups['shield'] = { startTime: Date.now(), duration: 3000, value: '🛡️' };
                    showToast("Oyuna devam ediliyor!");
                }
                saveData();
                updateUI();
                showModal(null);
                gameInProgress = true;
                
                lastTime = 0;
                accumulator = 0;
                lastSnakeForRender = JSON.parse(JSON.stringify(snake));
                requestAnimationFrame(gameLoop);

                if (specialItemInterval) clearInterval(specialItemInterval);
                specialItemInterval = setInterval(spawnSpecialItem, 5000);
            }
        });
    }

    function update() {
        const levelConfig = levels.find(l => l.id === currentLevel)?.config || {};

        direction = newDirection;
        const head = { ...snake[0] };
        head.x += direction.x;
        head.y += direction.y;

        if (levelConfig.wallsAreBombs || levelConfig.invisibleWalls) {
            if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
                return gameOver("Duvara Çarptın");
            }
        } else {
            if (head.x < 0) head.x = tileCountX - 1;
            else if (head.x >= tileCountX) head.x = 0;
            if (head.y < 0) head.y = tileCountY - 1;
            else if (head.y >= tileCountY) { 
                head.y = 0; 
            }
        }

        const isShieldActive = 'shield' in activePowerups;
        let selfCollision = false;
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                selfCollision = true;
                break;
            }
        }

        if (selfCollision) {
            if (isShieldActive) {
                delete activePowerups['shield'];
                floatingTexts.push({ text: 'Kalkan Kırıldı!', x: head.x, y: head.y, alpha: 1 });
            } else {
                selfCollisionSound.triggerAttackRelease("4n");
                return gameOver("Kendine Çarptın");
            }
        }

        for (const obstacle of obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                if (isShieldActive) {
                    delete activePowerups['shield'];
                } else {
                    return gameOver("Bombaya Çarptın");
                }
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            let points = '2x' in activePowerups ? 2 : 1;
            score += points;
            foodEatenCount++;
            floatingTexts.push({ text: `+${points}`, x: head.x, y: head.y, alpha: 1 });
            updateScoreUI();
            updateMissionUI();
            generateFood();
            eatSound.triggerAttackRelease("C4", "8n");

            if (foodEatenCount > 0 && foodEatenCount % 9 === 0) {
                baseGameSpeed = Math.max(50, baseGameSpeed * 0.95);
                floatingTexts.push({ text: '⚡', x: head.x, y: head.y, alpha: 1 });
            }

            if (currentLevel === 0) {
                playerData.totalFoodEatenSession++;
                saveData();
                classicChallenges.forEach(challenge => {
                    if (challenge.type === 'food' && !playerData.completedClassicChallenges.includes(challenge.id) && playerData.totalFoodEatenSession >= challenge.target) {
                        playerData.coins += challenge.reward;
                        playerData.completedClassicChallenges.push(challenge.id);
                        showToast(`Klasik Görev Tamamlandı: ${challenge.name}! +${challenge.reward} coin`);
                        saveData();
                        updateClassicChallengesUI();
                    }
                });
            }
        } else {
            snake.pop();
        }

        specialItems.forEach((item, index) => {
            if (head.x === item.x && head.y === item.y) {
                if (item.type === 'bomb') {
                    bombCollisionSound.triggerAttackRelease("8n");
                    if (isShieldActive) {
                        delete activePowerups['shield'];
                        floatingTexts.push({ text: 'Kalkan Kırıldı!', x: head.x, y: head.y, alpha: 1 });
                    } else {
                        return gameOver("Bombaya Çarptın");
                    }
                } else if (item.type === 'grow') {
                    const tail = snake[snake.length - 1];
                    snake.push({ ...tail }, { ...tail });
                    floatingTexts.push({ text: `🔼 Büyüdün!`, x: head.x, y: head.y, alpha: 1 });
                } else {
                    activePowerups[item.type] = { startTime: Date.now(), duration: 15000, value: shopItems.ozelyem.find(p => p.id === item.type).value };
                    floatingTexts.push({ text: `${item.value} Aktif!`, x: head.x, y: head.y, alpha: 1 });
                }
                specialItems.splice(index, 1);
            }
        });

        if ('magnet' in activePowerups) {
            const dist = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
            if (dist < 5) {
                if (head.x < food.x) food.x--;
                else if (head.x > food.x) food.x++;
                if (head.y < food.y) food.y--;
                else if (head.y > food.y) food.y++;
            }
        }

        if ('speed' in activePowerups) currentGameSpeed = baseGameSpeed * 0.6;
        else if ('slow' in activePowerups) currentGameSpeed = baseGameSpeed * 1.5;
        else currentGameSpeed = baseGameSpeed;

        if (levelConfig.opponent && opponentSnake) {
            updateOpponentSnake();
        }

        if (levelConfig.rotatingBomb && rotatingBomb && food) {
            rotatingBomb.angle += rotatingBomb.speed;
            const bombX = Math.floor(food.x + rotatingBomb.radius * Math.cos(rotatingBomb.angle));
            const bombY = Math.floor(food.y + rotatingBomb.radius * Math.sin(rotatingBomb.angle));
            rotatingBomb.x = bombX;
            rotatingBomb.y = bombY;

            if (head.x === bombX && head.y === bombY) {
                if (isShieldActive) {
                    delete activePowerups['shield'];
                    rotatingBomb = null;
                } else {
                    return gameOver("Dönen Bombaya Çarptın");
                }
            }
        }
    }

    function updateOpponentSnake() {
        const head = { ...opponentSnake.body[0] };
        const playerHead = snake[0];
        const possibleMoves = [
            { x: 0, y: -1, name: 'up' },
            { x: 0, y: 1, name: 'down' },
            { x: -1, y: 0, name: 'left' },
            { x: 1, y: 0, name: 'right' }
        ];

        let bestMove = opponentSnake.direction;
        let bestScore = -Infinity;

        for (const move of possibleMoves) {
            if (move.x === -opponentSnake.direction.x && move.y === -opponentSnake.direction.y) {
                continue;
            }

            const nextPos = { x: head.x + move.x, y: head.y + move.y };
            let moveScore = 0;

            if (nextPos.x < 0 || nextPos.x >= tileCountX || nextPos.y < 0 || nextPos.y >= tileCountY) {
                moveScore -= 1000;
            }
            for (const part of opponentSnake.body) {
                if (nextPos.x === part.x && nextPos.y === part.y) {
                    moveScore -= 1000;
                    break;
                }
            }

            const distToFood = Math.abs(nextPos.x - food.x) + Math.abs(nextPos.y - food.y);
            moveScore += 100 - distToFood * 10;

            const distPlayerToFood = Math.abs(playerHead.x - food.x) + Math.abs(playerHead.y - food.y);
            if (distPlayerToFood < distToFood) {
                const distToPlayerHead = Math.abs(nextPos.x - playerHead.x) + Math.abs(nextPos.y - playerHead.y);
                moveScore += 50 - distToPlayerHead * 5;
            }

            if (moveScore > bestScore) {
                bestScore = moveScore;
                bestMove = move;
            }
        }

        opponentSnake.direction = bestMove;
        head.x += opponentSnake.direction.x;
        head.y += opponentSnake.direction.y;

        if (head.x < 0) head.x = tileCountX - 1;
        else if (head.x >= tileCountX) head.x = 0;
        if (head.y < 0) head.y = tileCountY - 1;
        else if (head.y >= tileCountY) head.y = 0;

        opponentSnake.body.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            generateFood();
        } else {
            opponentSnake.body.pop();
        }
    }

    function draw(alpha = 1.0) {
        const levelConfig = levels.find(l => l.id === currentLevel)?.config || {};
        const bgColor = shopItems.arkaplan.find(b => b.id === playerData.equippedArkaplan).value;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (levelConfig.invisibleWalls) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.lineWidth = 5;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }

        obstacles.forEach(obstacle => {
            ctx.fillText('💣', obstacle.x * gridSize + gridSize / 2, obstacle.y * gridSize + gridSize / 2);
        });

        if (levelConfig.rotatingBomb && rotatingBomb && rotatingBomb.x !== undefined) {
            ctx.fillText('💣', rotatingBomb.x * gridSize + gridSize / 2, rotatingBomb.y * gridSize + gridSize / 2);
        }

        ctx.font = `${gridSize * 0.9 * snakeSegmentDrawScale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (food) {
            ctx.fillText(food.value, food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2);
        }

        if (levelConfig.opponent && opponentSnake) {
            const oppHeadColor = opponentSnake.color;
            const oppBodyColor = shadeColor(oppHeadColor, -25);
            opponentSnake.body.forEach((part, index) => {
                drawSnakePart(part, index === 0 ? oppHeadColor : oppBodyColor, index === 0, opponentSnake.direction);
            });
        }

        const snakeHeadColor = shopItems.renk.find(s => s.id === playerData.equippedRenk).value;
        const snakeBodyColor = shadeColor(snakeHeadColor, -25);
        
        // Debugging logs
        console.log("playerData.equippedHayvan:", playerData.equippedHayvan);
        console.log("shopItems.hayvan:", shopItems.hayvan);
        const foundAnimal = shopItems.hayvan.find(h => h.id === playerData.equippedHayvan);
        console.log("foundAnimal:", foundAnimal);

        const equippedAnimal = foundAnimal ? foundAnimal.value : '🐍'; // Add a fallback

        snake.forEach((part, index) => {
            const oldPart = lastSnakeForRender[index] || part; // Fallback to current part

            const renderX = oldPart.x * (1 - alpha) + part.x * alpha;
            const renderY = oldPart.y * (1 - alpha) + part.y * alpha;
            
            console.log(`Drawing part ${index}: renderX=${renderX}, renderY=${renderY}, alpha=${alpha}, oldPart=(${oldPart.x},${oldPart.y}), part=(${part.x},${part.y})`);

            if (playerData.equippedHayvan !== 'snake') { // If a custom animal is equipped, draw emoji for all parts
                ctx.font = `${gridSize * 0.9 * snakeSegmentDrawScale}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(equippedAnimal, renderX * gridSize + gridSize / 2, renderY * gridSize + gridSize / 2);
            } else { // If default 'snake' is equipped, draw rounded rectangles and eyes for head
                const isHead = index === 0;
                const color = isHead ? snakeHeadColor : snakeBodyColor;
                drawSnakePart({ x: renderX, y: renderY }, color, isHead, direction);
            }
        });

        specialItems.forEach(item => {
            ctx.globalAlpha = 1 - ((Date.now() - item.createdAt) / item.duration);
            ctx.fillText(item.value, item.x * gridSize + gridSize / 2, item.y * gridSize + gridSize / 2);
            ctx.globalAlpha = 1.0;
        });

        floatingTexts.forEach((ft, index) => {
            ctx.fillStyle = `rgba(255, 255, 255, ${ft.alpha})`;
            ctx.font = `bold ${gridSize * 0.8 * snakeSegmentDrawScale}px Arial`;
            ctx.fillText(ft.text, ft.x * gridSize + gridSize / 2, ft.y * gridSize + gridSize / 2 - (1 - ft.alpha) * 20);
            ft.alpha -= 0.03;
            if (ft.alpha <= 0) floatingTexts.splice(index, 1);
        });

        powerupContainerEl.innerHTML = '';
        for (const type in activePowerups) {
            const powerup = activePowerups[type];
            const remaining = 1 - ((Date.now() - powerup.startTime) / powerup.duration);
            powerupContainerEl.innerHTML += `
                <div class="powerup-indicator">
                    <span>${powerup.value}</span>
                    <div class="progress-bar-container"><div class="progress-bar" style="width: ${remaining * 100}%"></div></div>
                </div>`;
        }
    }

    function drawSnakePart(part, color, isHead, currentDirection) {
        const segmentSize = gridSize * snakeSegmentDrawScale;
        const offset = (gridSize - segmentSize) / 2;
        const x = part.x * gridSize + offset;
        const y = part.y * gridSize + offset;
        const cornerRadius = 8 * snakeSegmentDrawScale; // Increased for more prominent rounding

        ctx.fillStyle = color;
        ctx.strokeStyle = shadeColor(color, -40);
        ctx.lineWidth = 2 * snakeSegmentDrawScale;

        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + segmentSize - cornerRadius, y);
        ctx.quadraticCurveTo(x + segmentSize, y, x + segmentSize, y + cornerRadius);
        ctx.lineTo(x + segmentSize, y + segmentSize - cornerRadius);
        ctx.quadraticCurveTo(x + segmentSize, y + segmentSize, x + segmentSize - cornerRadius, y + segmentSize);
        ctx.lineTo(x + cornerRadius, y + segmentSize);
        ctx.quadraticCurveTo(x, y + segmentSize, x, y + segmentSize - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eyes are only drawn for the default snake head, not when an animal emoji is used
        if (isHead && playerData.equippedHayvan === 'snake') { // Only draw eyes for the default 'snake' animal
            ctx.fillStyle = '#fff';
            const eyeSize = segmentSize / 7;
            let eye1_x, eye1_y, eye2_x, eye2_y;

            if (currentDirection.x === 1) { // Right
                eye1_x = x + segmentSize * 0.7; eye1_y = y + segmentSize * 0.25;
                eye2_x = x + segmentSize * 0.7; eye2_y = y + segmentSize * 0.75;
            } else if (currentDirection.x === -1) { // Left
                eye1_x = x + segmentSize * 0.3; eye1_y = y + segmentSize * 0.25;
                eye2_x = x + segmentSize * 0.3; eye2_y = y + segmentSize * 0.75;
            } else if (currentDirection.y === 1) { // Down
                eye1_x = x + segmentSize * 0.25; eye1_y = y + segmentSize * 0.7;
                eye2_x = x + segmentSize * 0.75; eye2_y = y + segmentSize * 0.7;
            } else { // Up
                eye1_x = x + segmentSize * 0.25; eye1_y = y + segmentSize * 0.3;
                eye2_x = x + segmentSize * 0.75; eye2_y = y + segmentSize * 0.3;
            }

            ctx.beginPath();
            ctx.arc(eye1_x, eye1_y, eyeSize, 0, 2 * Math.PI);
            ctx.arc(eye2_x, eye2_y, eyeSize, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    function generateFood() {
        const availableFoods = playerData.activeFoods.map(id => shopItems.yem.find(f => f.id === id));

        let attempts = 0;
        while (attempts < 200) {
            const x = Math.floor(Math.random() * tileCountX);
            const y = Math.floor(Math.random() * tileCountY);

            const onSnake = snake.some(part => part.x === x && part.y === y);
            const onObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
            const onOpponentSnake = opponentSnake && opponentSnake.body.some(part => part.x === x && part.y === y);

            if (!onSnake && !onObstacle && !onOpponentSnake) {
                food = {
                    x, y,
                    value: availableFoods.length > 0 ? availableFoods[Math.floor(Math.random() * availableFoods.length)].value : '🍎'
                };
                return;
            }
            attempts++;
        }
        console.warn("Could not find a valid position for food after 200 attempts.");
    }

    function spawnObstacle(type) {
        let attempts = 0;
        while (attempts < 100) {
            const x = Math.floor(Math.random() * tileCountX);
            const y = Math.floor(Math.random() * tileCountY);

            const onSnake = snake.some(part => part.x === x && part.y === y);
            const onFood = food && food.x === x && food.y === y;
            const onOtherItem = specialItems.some(item => item.x === x && item.y === y);
            const onObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
            const onOpponentSnake = opponentSnake && opponentSnake.body.some(part => part.x === x && part.y === y);

            if (!onSnake && !onFood && !onOtherItem && !onObstacle && !onOpponentSnake) {
                obstacles.push({ x, y, type });
                return;
            }
            attempts++;
        }
    }

    function spawnSpecialItem() {
        if (Math.random() > 0.15) return;

        let attempts = 0;
        while (attempts < 100) {
            const x = Math.floor(Math.random() * tileCountX);
            const y = Math.floor(Math.random() * tileCountY);

            const onSnake = snake.some(part => part.x === x && part.y === y);
            const onFood = food && food.x === x && food.y === y;
            const onOtherItem = specialItems.some(item => item.x === x && item.y === y);

            if (!onSnake && !onFood && !onOtherItem) {
                const itemType = Math.random() < 0.3 ? 'bomb' : 'powerup';
                let itemDetails;
                if (itemType === 'bomb') {
                    itemDetails = { id: 'bomb', value: '💣' };
                } else {
                    const availablePowerups = shopItems.ozelyem.filter(p => playerData.unlockedOzelyem.includes(p.id));
                    if (availablePowerups.length === 0) continue;
                    itemDetails = availablePowerups[Math.floor(Math.random() * availablePowerups.length)];
                }

                specialItems.push({
                    x, y,
                    type: itemDetails.id,
                    value: itemDetails.value,
                    createdAt: Date.now(),
                    duration: 10000
                });
                return;
            }
            attempts++;
        }
    }

    function updatePowerupTimers() {
        const now = Date.now();
        for (const type in activePowerups) {
            if (now - activePowerups[type].startTime > activePowerups[type].duration) {
                delete activePowerups[type];
            }
        }
        specialItems = specialItems.filter(item => now - item.createdAt < item.duration);
    }

    function updateScoreUI() {
        scoreEl.textContent = score;
        coinsEl.textContent = playerData.coins;
    }

    function updateUI() {
        coinsEl.textContent = playerData.coins;
        highscoreEl.textContent = playerData.highscore;
        livesEl.textContent = playerData.lives;
        shopCoinBalanceEl.textContent = `Coin: ${playerData.coins}`;
    }

    function showToast(message, duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }

    function saveData() {
        localStorage.setItem('snakeGameData_v18', JSON.stringify(playerData));
    }

    function loadData() {
        const saved = localStorage.getItem('snakeGameData_v18');
        console.log("Loading data. Initial playerData.equippedHayvan:", playerData.equippedHayvan);
        playerData = saved ? { ...defaultPlayerData, ...JSON.parse(saved) } : { ...defaultPlayerData };
        console.log("playerData after loading/defaulting:", playerData.equippedHayvan);

        // Ensure equippedHayvan is valid
        const validAnimals = shopItems.hayvan.map(item => item.id);
        console.log("Valid animals:", validAnimals);
        if (!validAnimals.includes(playerData.equippedHayvan)) {
            console.warn(`Invalid equippedHayvan '${playerData.equippedHayvan}' found. Resetting to 'snake'.`);
            playerData.equippedHayvan = 'snake'; // Default to 'snake' if current equipped is invalid
        }
        console.log("playerData.equippedHayvan after validation:", playerData.equippedHayvan);

        playerData.totalFoodEatenSession = playerData.totalFoodEatenSession || 0;
        playerData.totalGamesPlayed = playerData.totalGamesPlayed || 0;
        
        if (playerData.lastLifeRegenTime) {
            const now = Date.now();
            const timeElapsed = now - playerData.lastLifeRegenTime;
            const minutesElapsed = timeElapsed / (1000 * 60);
            const livesToRegen = Math.floor(minutesElapsed / 6);
            if (livesToRegen > 0) {
                playerData.lives = Math.min(defaultPlayerData.lives, playerData.lives + livesToRegen);
                playerData.lastLifeRegenTime = now;
            }
        } else {
            playerData.lastLifeRegenTime = Date.now();
        }

        snakeSizeSelect.value = playerData.equippedSnakeSize || 'medium';
        classicOpponentToggle.checked = playerData.classicOpponent || false;
        const audioSettings = playerData.audioSettings || { master: -10, ui: -10, effects: -10 };
        masterVolumeSlider.value = audioSettings.master;
        uiVolumeSlider.value = audioSettings.ui;
        effectsVolumeSlider.value = audioSettings.effects;
        Tone.Master.volume.value = audioSettings.master;
        uiChannel.volume.value = audioSettings.ui;
        effectsChannel.volume.value = audioSettings.effects;
    }

    function updateMissionUI() {
        const mission = currentMission;
        if (currentLevel === 0 || !gameInProgress || !mission || !mission.id) {
            missionTextEl.textContent = "";
            missionProgressEl.style.width = `0%`;
            missionProgressEl.parentElement.style.display = 'none';
            return;
        }

        missionProgressEl.parentElement.style.display = 'block';

        let currentProgress = 0;
        let targetValue = mission.target;
        let missionDescription = mission.description;

        if (mission.progressType === 'food') {
            currentProgress = foodEatenCount;
            missionDescription = `${mission.description} (${currentProgress}/${targetValue} yem)`;
        } else if (mission.progressType === 'score') {
            currentProgress = score;
            missionDescription = `${mission.description} (${currentProgress}/${targetValue} puan)`;
        } else if (mission.progressType === 'timer') {
            const elapsed = (Date.now() - mission.startTime) / 1000;
            const remaining = Math.max(0, targetValue - elapsed);
            currentProgress = elapsed;
            missionDescription = `${mission.description} (${remaining.toFixed(0)}s)`;
        } else if (mission.progressType === 'length') {
            currentProgress = snake.length;
            missionDescription = `${mission.description} (Uzunluk: ${currentProgress})`;
            targetValue = opponentSnake ? opponentSnake.body.length + 1 : 10;
        } else {
            missionProgressEl.parentElement.style.display = 'none';
        }

        missionTextEl.textContent = missionDescription;
        if (targetValue && targetValue > 0) {
            const progress = (currentProgress / targetValue) * 100;
            missionProgressEl.style.width = `${Math.min(100, progress)}%`;
        } else {
            missionProgressEl.style.width = `0%`;
            if (mission.progressType !== 'survival') {
                missionProgressEl.parentElement.style.display = 'none';
            }
        }
    }

    function updateShopUI() {
        updateUI();
        Object.keys(shopItems).forEach(category => {
            const container = document.getElementById(`tab-${category}`);
            if (!container) return;
            container.innerHTML = '';
            shopItems[category].forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'shop-item';
                const unlockedKey = `unlocked${category.charAt(0).toUpperCase() + category.slice(1)}`;
                const isUnlocked = playerData[unlockedKey].includes(item.id);
                let btn;

                if (category === 'yem' || category === 'ozelyem') {
                    const activeKey = category === 'yem' ? 'activeFoods' : 'activePowerups';
                    const isActive = playerData[activeKey].includes(item.id);
                    if (isActive) {
                        btn = `<button data-action="remove" data-category="${category}" data-itemid="${item.id}">Çıkar</button>`;
                    } else if (isUnlocked) {
                        btn = `<button data-action="add" data-category="${category}" data-itemid="${item.id}">Ekle</button>`;
                    } else {
                        btn = `<button data-action="buy" data-category="${category}" data-itemid="${item.id}">Al (${item.price})</button>`;
                    }
                } else {
                    const equippedKey = `equipped${category.charAt(0).toUpperCase() + category.slice(1)}`;
                    const isEquipped = playerData[equippedKey] === item.id;
                    if (isEquipped) {
                        btn = `<button class="equipped" disabled>Kullanımda</button>`;
                    } else if (isUnlocked) {
                        btn = `<button data-action="equip" data-category="${category}" data-itemid="${item.id}">Seç</button>`;
                    } else {
                        btn = `<button data-action="buy" data-category="${category}" data-itemid="${item.id}">Al (${item.price})</button>`;
                    }
                }

                itemEl.innerHTML = `<div class="item-preview" style="background-color:${item.value};">${category === 'renk' || category === 'arkaplan' ? '' : item.value}</div><p>${item.name}</p>${btn}`;
                container.appendChild(itemEl);
            });
        });
    }

    function handleShopAction(e) {
        const button = e.target.closest('button[data-action]');
        if (!button || button.disabled) return;
        const { action, category, itemid } = button.dataset;
        const item = shopItems[category].find(i => i.id === itemid);
        if (!item) return;

        const unlockedKey = `unlocked${category.charAt(0).toUpperCase() + category.slice(1)}`;
        const equippedKey = `equipped${category.charAt(0).toUpperCase() + category.slice(1)}`;

        if (action === 'buy') {
            if (playerData.coins >= item.price) {
                playerData.coins -= item.price;
                playerData[unlockedKey].push(item.id);
                showToast(`${item.name} satın alındı!`);
            } else {
                showToast("Yetersiz bakiye!");
            }
        } else if (action === 'equip') {
            playerData[equippedKey] = item.id;
            console.log(`Equipped ${item.name}. playerData.equippedHayvan is now: ${playerData.equippedHayvan}`);
        } else if (action === 'add') {
            const activeKey = category === 'yem' ? 'activeFoods' : 'activePowerups';
            playerData[activeKey].push(item.id);
        } else if (action === 'remove') {
            const activeKey = category === 'yem' ? 'activeFoods' : 'activePowerups';
            playerData[activeKey] = playerData[activeKey].filter(id => id !== item.id);
        }
        saveData();
        updateShopUI();
    }

    function shareScore() {
        if (navigator.share) {
            navigator.share({ title: 'Yılan Oyunu Skorum', text: `Yılan oyununda ${score} puan aldım! Sen de oyna!`, url: window.location.href });
        }
    }

    function showFakeAd(duration, callback) {
        const adOverlay = document.createElement('div');
        adOverlay.className = 'ad-overlay';
        let countdown = duration;
        adOverlay.innerHTML = `<div>Reklam</div><div id="ad-countdown">${countdown}</div>`;
        gameContainer.appendChild(adOverlay);
        const adInterval = setInterval(() => {
            countdown--;
            document.getElementById('ad-countdown').textContent = countdown;
            if (countdown <= 0) {
                clearInterval(adInterval);
                gameContainer.removeChild(adOverlay);
                callback(true);
            }
        }, 1000);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gridSize = Math.ceil(canvas.width / fixedTileCountX);
        tileCountX = fixedTileCountX;
        tileCountY = Math.floor(canvas.height / gridSize);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // Add console logs here
        console.log("resizeCanvas - canvas.width:", canvas.width, "canvas.height:", canvas.height);
        console.log("resizeCanvas - gridSize:", gridSize, "tileCountX:", tileCountX, "tileCountY:", tileCountY);
        if (gameInProgress) draw();
    }

    function populateLevelList() {
        levelListContainer.innerHTML = '';
        levels.filter(l => l.id !== 0).forEach(level => {
            const isUnlocked = playerData.unlockedLevels.includes(level.id);
            const levelEl = document.createElement('div');
            levelEl.className = `level-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            levelEl.innerHTML = `
                <h3>Bölüm ${level.id}</h3>
                <p>${level.name}</p>
                <button data-levelid="${level.id}" ${!isUnlocked || playerData.lives <= 0 ? 'disabled' : ''}>Oyna</button>
            `;
            levelListContainer.appendChild(levelEl);
        });
        if (playerData.lives <= 0) {
            const info = document.createElement('p');
            info.textContent = "Bölüm canın kalmadı! Daha sonra tekrar dene.";
            levelListContainer.appendChild(info);
        }
    }

    function initialize() {
        uiChannel = new Tone.Channel();
        effectsChannel = new Tone.Channel();
        eatSound = new Tone.MembraneSynth();
        selfCollisionSound = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.15 } });
        bombCollisionSound = new Tone.MetalSynth({ harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 });
        gameOverSound = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.2 } });
        clickSound = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.05, release: 0.05 } });
        previewSound = new Tone.Synth();
        
        loadData();
        resizeCanvas();
        updateUI();
        showModal(startScreen);

        // Resume AudioContext on first user interaction
        document.body.addEventListener('click', () => {
            if (Tone.context.state !== 'running') {
                Tone.start().then(() => {
                    console.log("AudioContext resumed!");
                    // Connect audio nodes after context is resumed
                    uiChannel.toDestination();
                    effectsChannel.toDestination();
                    eatSound.connect(effectsChannel);
                    selfCollisionSound.connect(effectsChannel);
                    bombCollisionSound.connect(effectsChannel);
                    gameOverSound.connect(effectsChannel);
                    clickSound.connect(uiChannel);
                    previewSound.toDestination();

                    // Set initial volumes after context is resumed
                    const audioSettings = playerData.audioSettings || { master: -10, ui: -10, effects: -10 };
                    masterVolumeSlider.value = audioSettings.master;
                    uiVolumeSlider.value = audioSettings.ui;
                    effectsVolumeSlider.value = audioSettings.effects;
                    Tone.Master.volume.value = audioSettings.master;
                    uiChannel.volume.value = audioSettings.ui;
                    effectsChannel.volume.value = audioSettings.effects;
                }).catch(e => console.error("Error resuming AudioContext:", e));
            }
        }, { once: true });

        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowUp' && direction.y === 0) newDirection = { x: 0, y: -1 };
            else if (e.key === 'ArrowDown' && direction.y === 0) newDirection = { x: 0, y: 1 };
            else if (e.key === 'ArrowLeft' && direction.x === 0) newDirection = { x: -1, y: 0 };
            else if (e.key === 'ArrowRight' && direction.x === 0) newDirection = { x: 1, y: 0 };
        });
        canvas.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
        canvas.addEventListener('touchmove', e => {
            if (!touchStartX || !touchStartY) return;
            const diffX = e.touches[0].clientX - touchStartX;
            const diffY = e.touches[0].clientY - touchStartY;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0 && direction.x === 0) newDirection = { x: 1, y: 0 };
                else if (diffX < 0 && direction.x === 0) newDirection = { x: -1, y: 0 };
            } else {
                if (diffY > 0 && direction.y === 0) newDirection = { x: 0, y: 1 };
                else if (diffY < 0 && direction.y === 0) newDirection = { x: 0, y: -1 };
            }
            touchStartX = null; touchStartY = null;
        }, { passive: true });

        startGameBtn.addEventListener('click', () => initGame(0));
        
        levelsBtn.addEventListener('click', () => {
            populateLevelList();
            showModal(levelSelectionScreen, startScreen);
        });
        restartGameBtn.addEventListener('click', () => initGame(currentLevel));
        
        mainShopBtn.addEventListener('click', () => openShop(startScreen));
        gameOverShopBtn.addEventListener('click', () => openShop(gameOverScreen));
        closeShopBtn.addEventListener('click', () => closeShop());
        
        shopScreen.addEventListener('click', handleShopAction);
        shareScoreBtn.addEventListener('click', shareScore);
        rewardedAdBtn.addEventListener('click', continueGame);
        
        watchAdForCoinsBtn.addEventListener('click', () => {
            showFakeAd(5, (success) => {
                if (success) {
                    playerData.coins += 50;
                    saveData();
                    updateUI();
                    showToast("+50 coin kazandın!");
                }
                showModal(gameOverScreen);
            });
        });
        skipAdBtn.addEventListener('click', () => showModal(gameOverScreen));
        
        shopTabs.forEach(tab => tab.addEventListener('click', (e) => {
            shopTabs.forEach(t => t.classList.remove('active'));
            shopTabContents.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab).classList.add('active');
        }));
        
        const openSettings = (from) => {
            const fromModal = from === 'gameover' ? gameOverScreen : startScreen;
            showModal(settingsScreen, fromModal);
        }
        settingsBtn.addEventListener('click', () => openSettings('start'));
        settingsBtnGameOver.addEventListener('click', () => openSettings('gameover'));
        closeSettingsBtn.addEventListener('click', () => {
            const fromScreenId = settingsScreen.dataset.from;
            showModal(document.getElementById(fromScreenId) || startScreen);
        });

        snakeSizeSelect.addEventListener('change', (e) => {
            playerData.equippedSnakeSize = e.target.value;
            saveData();
        });
        classicOpponentToggle.addEventListener('change', (e) => {
            playerData.classicOpponent = e.target.checked;
            saveData();
        });

        const saveAudioSettings = () => {
            playerData.audioSettings = {
                master: masterVolumeSlider.value,
                ui: uiVolumeSlider.value,
                effects: effectsVolumeSlider.value
            };
            saveData();
        }
        masterVolumeSlider.addEventListener('input', () => { Tone.Master.volume.value = masterVolumeSlider.value; previewSound.triggerAttackRelease("C4", "32n"); saveAudioSettings(); });
        uiVolumeSlider.addEventListener('input', () => { uiChannel.volume.value = uiVolumeSlider.value; previewSound.triggerAttackRelease("C4", "32n"); saveAudioSettings(); });
        effectsVolumeSlider.addEventListener('input', () => { effectsChannel.volume.value = effectsVolumeSlider.value; previewSound.triggerAttackRelease("C4", "32n"); saveAudioSettings(); });

        closeLevelsBtn.addEventListener('click', () => showModal(startScreen));

        classicChallengesBtn.addEventListener('click', () => {
            updateClassicChallengesUI();
            showModal(classicChallengesScreen, startScreen);
        });
        closeClassicChallengesBtn.addEventListener('click', () => showModal(startScreen));

        levelListContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-levelid]');
            if (button && !button.disabled) {
                const levelId = parseInt(button.dataset.levelid, 10);
                if (playerData.unlockedLevels.includes(levelId)) {
                    initGame(levelId);
                }
            }
        });

        nextLevelBtn.addEventListener('click', () => {
            const nextLevelId = currentLevel + 1;
            if (nextLevelId <= levels.length - 1) {
                initGame(nextLevelId);
            } else {
                showToast("Tüm bölümleri tamamladın!");
                showModal(startScreen);
            }
        });

        backToLevelsBtn.addEventListener('click', () => {
            showModal(levelSelectionScreen);
            populateLevelList();
        });

        window.addEventListener('resize', resizeCanvas);

        // Removed global event.preventDefault() for touchmove
    }

    function shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }

    function updateClassicChallengesUI() {
        classicChallengesList.innerHTML = '';
        classicChallenges.forEach(challenge => {
            const challengeEl = document.createElement('div');
            challengeEl.className = 'classic-challenge-item';
            const isCompleted = playerData.completedClassicChallenges.includes(challenge.id);
            challengeEl.innerHTML = `
                <h3>${challenge.name}</h3>
                <p>${challenge.description}</p>
                <p>Ödül: ${challenge.reward} Coin</p>
                <span class="status">${isCompleted ? 'Tamamlandı 🏆' : 'Devam Ediyor'}</span>
            `;
            if (isCompleted) {
                challengeEl.classList.add('completed');
            }
            classicChallengesList.appendChild(challengeEl);
        });
    }

    initialize();
});