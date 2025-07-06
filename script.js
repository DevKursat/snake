document.addEventListener('DOMContentLoaded', () => {
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

    // Oyun Ayarları
    let gridSize = 20;
    let tileCountX, tileCountY;

    // Oyun Değişkenleri
    let snake, food, score, gameLoop, direction, newDirection, touchStartX, touchStartY, gameInProgress;
    let floatingTexts = [];
    let specialItems = []; // Özel öğeler (güçlendirmeler, bomba)
    let activePowerups = {}; // Aktif güçlendirmeler
    let gamesPlayed = 0;
    let adContinueUsed = false;
    let baseGameSpeed = 120; // Varsayılan oyun hızı (ms)
    let currentGameSpeed = baseGameSpeed;

    // Ses Efektleri
    let eatSound;
    let selfCollisionSound;
    let bombCollisionSound;
    let clickSound;
    let gameOverSound;

    // Varsayılan Oyuncu Verileri
    const defaultPlayerData = {
        coins: 20,
        highscore: 0,
        unlockedSkins: ['green'],
        unlockedAnimals: ['snake'],
        unlockedFoods: ['apple'],
        unlockedBackgrounds: ['dark'],
        unlockedPowerups: [], // Güçlendirmeler başlangıçta kilitli
        equippedSkin: 'green',
        equippedBackground: 'dark',
        activeFoods: ['apple'], // Aktif yemler
        activePowerups: [], // Aktif güçlendirmeler
        currentMission: {}, // Boş obje olarak başlat
        missionProgress: 0,
        totalMissionsCompleted: 0 // Yeni eklenen özellik
    };
    let playerData = {};

    // Veri Yapıları
    const shopItems = {
        skins: [
            { id: 'green', name: 'Yeşil', price: 0, value: '#4caf50' },
            { id: 'blue', name: 'Mavi', price: 50, value: '#2196F3' },
            { id: 'orange', name: 'Turuncu', price: 75, value: '#FF9800' },
            { id: 'red', name: 'Kırmızı', price: 100, value: '#F44336' },
            { id: 'purple', name: 'Mor', price: 120, value: '#9C27B0' },
            { id: 'yellow', name: 'Sarı', price: 150, value: '#FFEB3B' }
        ],
        animals: [
            { id: 'snake', name: 'Yılan', price: 0, value: '🐍' },
            { id: 'dragon', name: 'Ejderha', price: 200, value: '🐉' },
            { id: 'caterpillar', name: 'Tırtıl', price: 150, value: '🐛' },
            { id: 'worm', name: 'Solucan', price: 100, value: '🪱' },
            { id: 'lizard', name: 'Kertenkele', price: 250, value: '🦎' },
            { id: 'fish', name: 'Balık', price: 180, value: '🐠' }
        ],
        foods: [
            { id: 'apple', name: 'Elma', price: 0, value: '🍎' },
            { id: 'strawberry', name: 'Çilek', price: 25, value: '🍓' },
            { id: 'orange', name: 'Portakal', price: 25, value: '🍊' },
            { id: 'banana', name: 'Muz', price: 30, value: '🍌' },
            { id: 'grape', name: 'Üzüm', price: 35, value: '🍇' },
            { id: 'cherry', name: 'Kiraz', price: 40, value: '🍒' }
        ],
        backgrounds: [
            { id: 'dark', name: 'Karanlık', price: 0, value: '#111' },
            { id: 'light', name: 'Açık Gri', price: 150, value: '#555' },
            { id: 'blue_sky', name: 'Mavi Gökyüzü', price: 200, value: '#87CEEB' },
            { id: 'forest', name: 'Orman', price: 250, value: '#228B22' },
            { id: 'desert', name: 'Çöl', price: 300, value: '#FAD201' },
            { id: 'space', name: 'Uzay', price: 350, value: '#000033' }
        ],
        powerups: [
            { id: '2x', name: '2x Puan', price: 300, value: '✨', description: '15sn puanları ikiye katlar.' },
            { id: 'shield', name: 'Kalkan', price: 400, value: '🛡️', description: '15sn dokunulmazlık sağlar.' },
            { id: 'magnet', name: 'Mıknatıs', price: 500, value: '🧲', description: 'Yemleri kendine çeker.' },
            { id: 'speed', name: 'Hız', price: 250, value: '⚡', description: '10sn yılanı hızlandırır.' },
            { id: 'slow', name: 'Yavaşlat', price: 250, value: '🐢', description: '10sn yılanı yavaşlatır.' }
        ]
    };
    const missionTemplates = [
        { type: 'food', description: "{target} yem topla", baseTarget: 5, rewardMultiplier: 1, increment: 5 }, // Başlangıç yem hedefi düşürüldü
        { type: 'score', description: "{target} puana ulaş", baseTarget: 20, rewardMultiplier: 1.5, increment: 10 }, // Başlangıç skor hedefi düşürüldü
        { type: 'gamesPlayed', description: "{target} oyun oyna", baseTarget: 1, rewardMultiplier: 5, increment: 1 }
    ];
    let currentMission = {};

    function generateNewMission() {
        const availableMissionTemplates = missionTemplates; // Artık unlock görevleri yok

        if (availableMissionTemplates.length === 0) {
            currentMission = { id: 'none', description: "Tüm görevler tamamlandı!", target: 1, reward: 0, type: 'none' };
            return;
        }

        const template = availableMissionTemplates[Math.floor(Math.random() * availableMissionTemplates.length)];
        let target = 0;
        let reward = 0;

        // Zorluk seviyesini artırmak için mevcut görev sayısını kullan
        const difficulty = Math.floor(playerData.totalMissionsCompleted / 3) + 1; // Her 3 görevde bir zorluk artar
        target = template.baseTarget + (template.increment * difficulty);
        reward = Math.floor(target * template.rewardMultiplier / 5); // Ödülleri daha düşük tut

        currentMission = {
            id: Date.now(), // Benzersiz ID
            description: template.description.replace('{target}', target),
            target: target,
            reward: reward,
            type: template.type,
            category: template.category || null,
            itemToUnlock: null
        };
        playerData.currentMission = currentMission; // playerData'ya kaydet
    }

    // --- OYUN YÖNETİMİ ---
    function initGame() {
        console.log("initGame çağrıldı. playerData.equippedAnimal:", playerData.equippedAnimal, "playerData.equippedSkin:", playerData.equippedSkin);
        loadData(); // En güncel oyuncu verilerini yükle
        gameInProgress = true;
        adContinueUsed = false;
        score = 0;
        generateNewMission(); // Yeni görev oluştur
        direction = { x: 1, y: 0 };
        newDirection = { x: 1, y: 0 };
        snake = [{ x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }];
        floatingTexts = [];
        specialItems = [];
        activePowerups = {};
        currentGameSpeed = baseGameSpeed; // Oyunu başlatırken hızı sıfırla

        updateScoreUI();
        generateFood();
        updateMissionUI();
        if (gameLoop) clearTimeout(gameLoop); // setInterval yerine clearTimeout kullan
        gameLoop = setTimeout(mainLoop, currentGameSpeed); // İlk döngüyü başlat
        setInterval(spawnSpecialItem, 5000); // Her 5 saniyede bir özel öğe oluşturmayı dene

        startScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        adPromptScreen.classList.remove('active');
        gameContainer.classList.remove('shake');
    }

    function mainLoop() {
        if (!gameInProgress) return;
        update();
        draw();
        updatePowerupTimers();
        gameLoop = setTimeout(mainLoop, currentGameSpeed); // Bir sonraki döngüyü ayarla
    }

    function gameOver() {
        console.log("gameOver çağrıldı.");
        gameInProgress = false;
        clearInterval(gameLoop);
        gameContainer.classList.add('shake');
        if (score > playerData.highscore) playerData.highscore = score;
        playerData.coins += score;
        gamesPlayed++;
        checkMissionProgress('gamesPlayed', gamesPlayed); // Oyun oynama görevini kontrol et
        saveData();
        updateUI();
        finalScoreEl.textContent = score;
        earnedCoinsEl.textContent = score;
        rewardedAdBtn.style.display = adContinueUsed ? 'none' : 'inline-block';
        gameOverSound.triggerAttackRelease("8n"); // Oyun bitti sesi
        gameOverScreen.classList.add('active'); // Her zaman oyun bitti ekranını göster
        rewardedAdBtn.style.display = adContinueUsed ? 'none' : 'inline-block'; // Reklam düğmesini kontrol et
    }

    function continueGame() {
        console.log("continueGame çağrıldı.");
        showFakeAd(3, (success) => {
            if (success) {
                gameOverScreen.classList.remove('active');
                snake.splice(1, 3);
                activePowerups['shield'] = { startTime: Date.now(), duration: 3000, value: '🛡️' }; // 3 saniye kalkan
                gameInProgress = true;
                gameLoop = setInterval(mainLoop, 120);
            }
        });
    }

    // --- OYUN MEKANİKLERİ ---
    function update() {
        direction = newDirection;
        const head = { ...snake[0] };
        head.x += direction.x;
        head.y += direction.y;
        if (head.x >= tileCountX) head.x = 0;
        if (head.x < 0) head.x = tileCountX - 1;
        if (head.y >= tileCountY) head.y = 0;
        if (head.y < 0) head.y = tileCountY - 1;

        const isShieldActive = 'shield' in activePowerups;
        let selfCollision = false;

        // Check for self-collision
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                selfCollision = true;
                break;
            }
        }

        if (selfCollision) {
            if (isShieldActive) {
                delete activePowerups['shield']; // Remove shield
                floatingTexts.push({ text: 'Kalkan Kırıldı!', x: head.x, y: head.y, alpha: 1 });
                // Allow snake to pass through, so no gameOver() and continue with movement
            } else {
                selfCollisionSound.triggerAttackRelease("4n");
                return gameOver(); // Game over if no shield
            }
        }

        // Move snake forward
        snake.unshift(head);

        // Yem Yeme
        if (head.x === food.x && head.y === food.y) {
            let points = 1;
            if ('2x' in activePowerups) points = 2;
            score += points;
            playerData.coins += points;
            floatingTexts.push({ text: `+${points}`, x: head.x, y: head.y, alpha: 1 });
            checkMissionProgress('food', 1);
            checkMissionProgress('score', score);
            updateScoreUI();
            generateFood();
            eatSound.triggerAttackRelease("C4", "8n"); // Yem yeme sesi
        } else if (!('magnet' in activePowerups) || (Math.abs(head.x - food.x) + Math.abs(head.y - food.y)) > 1) { // Mıknatıs yoksa veya yem çok uzaktaysa yılan küçülür
            snake.pop();
        }

        // Özel Öğelerle Etkileşim
        // Özel Öğelerle Etkileşim
        specialItems.forEach((item, index) => {
            if (head.x === item.x && head.y === item.y) {
                if (item.type === 'bomb') {
                    bombCollisionSound.triggerAttackRelease("8n"); // Bomba çarpma sesi
                    if ('shield' in activePowerups) {
                        delete activePowerups['shield'];
                        floatingTexts.push({ text: 'Kalkan Kırıldı!', x: head.x, y: head.y, alpha: 1 });
                    } else {
                        return gameOver();
                    }
                } else { // Güçlendirme
                    activePowerups[item.type] = { startTime: Date.now(), duration: 15000, value: shopItems.powerups.find(p => p.id === item.type).value };
                    floatingTexts.push({ text: `${item.value} Aktif!`, x: head.x, y: head.y, alpha: 1 });
                }
                specialItems.splice(index, 1);
            }
        });

        // Mıknatıs etkisi
        if ('magnet' in activePowerups) {
            const dist = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
            if (dist < 10) { // Yem 10 birimden yakınsa çek
                // Yemi yılanın kafasına doğru çek
                if (head.x < food.x) food.x--;
                else if (head.x > food.x) food.x++;
                if (head.y < food.y) food.y--;
                else if (head.y > food.y) food.y++;

                // Yem yılanın kafasına çok yakınsa otomatik ye
                if (dist <= 1) {
                    let points = 1;
                    if ('2x' in activePowerups) points = 2;
                    score += points;
                    playerData.coins += points;
                    floatingTexts.push({ text: `+${points}`, x: head.x, y: head.y, alpha: 1 });
                    checkMissionProgress('food', 1);
                    checkMissionProgress('score', score);
                    updateScoreUI();
                    generateFood();
                    eatSound.triggerAttackRelease("C4", "8n"); // Yem yeme sesi
                }
            }
        }

        // Hız ve Yavaşlatma güçlendirmeleri
        if ('speed' in activePowerups) {
            currentGameSpeed = baseGameSpeed * 0.6; // %40 daha hızlı
        } else if ('slow' in activePowerups) {
            currentGameSpeed = baseGameSpeed * 1.5; // %50 daha yavaş
        } else {
            currentGameSpeed = baseGameSpeed; // Varsayılan hıza dön
        }
    }

    function draw() {
        try {
            console.log("draw() çağrıldı.");
            const bgColor = shopItems.backgrounds.find(b => b.id === playerData.equippedBackground).value;
            const snakeColor = shopItems.skins.find(s => s.id === playerData.equippedSkin).value;
            const snakeHead = shopItems.animals.find(a => a.id === playerData.equippedAnimal)?.value || shopItems.animals[0].value;
            const foodIcon = food.value;

            console.log("snakeColor:", snakeColor);
            console.log("snakeHead:", snakeHead);
            console.log("snake array:", snake);
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${gridSize * 0.9}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(foodIcon, food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2);
            snake.forEach((part, index) => {
                if (index === 0) {
                    ctx.fillText(snakeHead, part.x * gridSize + gridSize / 2, part.y * gridSize + gridSize / 2);
                } else {
                    ctx.fillStyle = snakeColor;
                    ctx.beginPath();
                    ctx.arc(part.x * gridSize + gridSize / 2, part.y * gridSize + gridSize / 2, gridSize / 2.5, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
            // Özel öğeleri çiz
            specialItems.forEach(item => {
                ctx.font = `${gridSize * 0.9}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = 1 - ((Date.now() - item.createdAt) / item.duration); // Süreye göre şeffaflık
                ctx.fillText(item.value, item.x * gridSize + gridSize / 2, item.y * gridSize + gridSize / 2);
                ctx.globalAlpha = 1.0;
            });
            floatingTexts.forEach((ft, index) => {
                ctx.fillStyle = `rgba(255, 255, 255, ${ft.alpha})`;
                ctx.font = `bold ${gridSize * 0.8}px Arial`;
                ctx.fillText(ft.text, ft.x * gridSize + gridSize / 2, ft.y * gridSize + gridSize / 2 - (1 - ft.alpha) * 20);
                ft.alpha -= 0.03;
                if (ft.alpha <= 0) floatingTexts.splice(index, 1);
            });
            // Aktif güçlendirme göstergeleri
            powerupContainerEl.innerHTML = '';
            for (const type in activePowerups) {
                const powerup = activePowerups[type];
                const remaining = 1 - ((Date.now() - powerup.startTime) / powerup.duration);
                powerupContainerEl.innerHTML += `
                    <div class="powerup-indicator">
                        <span>${powerup.value}</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${remaining * 100}%"></div>
                        </div>
                    </div>
                `;

                // Güçlendirme animasyonları
                if (type === 'shield') {
                    canvas.classList.add('shield-active');
                } else if (type === 'speed') {
                    canvas.classList.add('speed-active');
                } else if (type === 'magnet') {
                    canvas.classList.add('magnet-active');
                }
            }
            // Güçlendirme süresi bittiğinde animasyonları kaldır
            if (!('shield' in activePowerups)) canvas.classList.remove('shield-active');
            if (!('speed' in activePowerups)) canvas.classList.remove('speed-active');
            if (!('magnet' in activePowerups)) canvas.classList.remove('magnet-active');
        } catch (e) {
            console.error("Çizim hatası:", e);
        }
    }

    function generateFood() {
        const availableFoods = playerData.activeFoods.map(id => shopItems.foods.find(f => f.id === id));
        if (availableFoods.length === 0) { // Eğer aktif yem yoksa varsayılan elmayı kullan
            food = { x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY), value: '🍎' };
        } else {
            const randomFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
            food = { x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY), value: randomFood.value };
        }
        if (snake && snake.some(part => part.x === food.x && part.y === food.y)) generateFood();
    }

    function spawnSpecialItem() {
        const powerupSpawnChance = 0.1; // Daha nadir çıkması için düşürüldü
        const maxBombs = 3;

        const currentBombs = specialItems.filter(item => item.type === 'bomb').length;
        const hasActivePowerup = Object.keys(activePowerups).length > 0;

        let itemsToConsider = [];

        // Maksimum bomba sayısına ulaşılmadıysa bomba ekle
        if (currentBombs < maxBombs) {
            itemsToConsider.push({ id: 'bomb', value: '💣' });
        }

        // Aktif güçlendirme yoksa ve oyuncunun kilidi açık güçlendirmeleri varsa, güçlendirmeleri de değerlendir
        if (!hasActivePowerup) {
            playerData.activePowerups.forEach(pId => {
                const powerup = shopItems.powerups.find(item => item.id === pId);
                if (powerup && Math.random() < powerupSpawnChance) {
                    itemsToConsider.push({ id: powerup.id, value: powerup.value });
                }
            });
        }

        if (itemsToConsider.length === 0) return; // Oluşturulacak öğe yok

        const itemToSpawn = itemsToConsider[Math.floor(Math.random() * itemsToConsider.length)];

        const newItem = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY),
            type: itemToSpawn.id,
            value: itemToSpawn.value,
            createdAt: Date.now(),
            duration: 15000 // 15 saniye
        };

        // Yılanın veya başka bir öğenin üzerinde doğmasını engelle
        const isOccupied = snake.some(part => part.x === newItem.x && part.y === newItem.y) || 
                           specialItems.some(item => item.x === newItem.x && item.y === newItem.y) ||
                           (food.x === newItem.x && food.y === newItem.y);
        
        if (!isOccupied) {
            specialItems.push(newItem);
        }
    }

    function updatePowerupTimers() {
        const now = Date.now();
        let speedPowerupActive = false;
        let slowPowerupActive = false;

        for (const type in activePowerups) {
            const powerup = activePowerups[type];
            if (now - powerup.startTime > powerup.duration) {
                delete activePowerups[type];
            } else {
                if (type === 'speed') speedPowerupActive = true;
                if (type === 'slow') slowPowerupActive = true;
            }
        }

        if (!speedPowerupActive && !slowPowerupActive) {
            currentGameSpeed = baseGameSpeed;
        }

        // Süresi dolan özel öğeleri kaldır
        specialItems = specialItems.filter(item => now - item.createdAt < item.duration);
    }

    // --- UI, VERİ, GÖREV ---
    function updateScoreUI() { scoreEl.textContent = score; coinsEl.textContent = playerData.coins; }
    function updateUI() { coinsEl.textContent = playerData.coins; highscoreEl.textContent = playerData.highscore; shopCoinBalanceEl.textContent = `Coin: ${playerData.coins}`; }

    // Toast Bildirim Fonksiyonu
    function showToast(message, duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        // Toast'ı göster
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Toast'ı gizle ve kaldır
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }

    function saveData() { localStorage.setItem('snakeGameData_v12', JSON.stringify(playerData)); }
    function loadData() { 
        const saved = localStorage.getItem('snakeGameData_v12'); 
        try {
            playerData = saved ? { ...defaultPlayerData, ...JSON.parse(saved) } : { ...defaultPlayerData }; 
            // unlocked dizilerinin varlığını kontrol et ve yoksa boş dizi olarak başlat
            for (const key in defaultPlayerData) {
                if (key.startsWith('unlocked') && !playerData[key]) {
                    playerData[key] = [];
                }
            }
            // Varsayılan öğelerin kilidini aç
            playerData.unlockedSkins = Array.from(new Set([...playerData.unlockedSkins, 'green']));
            playerData.unlockedAnimals = Array.from(new Set([...playerData.unlockedAnimals, 'snake']));
            playerData.unlockedFoods = Array.from(new Set([...playerData.unlockedFoods, 'apple']));
            playerData.unlockedBackgrounds = Array.from(new Set([...playerData.unlockedBackgrounds, 'dark']));

            // Eğer yüklü veride yoksa veya boşsa varsayılanları ata
            if (!playerData.equippedSkin) playerData.equippedSkin = defaultPlayerData.equippedSkin;
            if (!playerData.equippedAnimal) playerData.equippedAnimal = defaultPlayerData.equippedAnimal;
            if (!playerData.equippedBackground) playerData.equippedBackground = defaultPlayerData.equippedBackground;
            if (!playerData.activeFoods || playerData.activeFoods.length === 0) playerData.activeFoods = [...defaultPlayerData.activeFoods];
            if (!playerData.activePowerups || playerData.activePowerups.length === 0) playerData.activePowerups = [...defaultPlayerData.activePowerups];

        } catch (e) {
            console.error("playerData yüklenirken hata oluştu:", e);
            playerData = { ...defaultPlayerData };
        }
    }
    
    function updateMissionUI() {
        const mission = playerData.currentMission;
        if (!mission || mission.id === 'none') {
            missionTextEl.textContent = "Tüm görevler tamamlandı!";
            missionProgressEl.style.width = '100%';
            return;
        }
        let progress = 0;
        let currentVal = playerData.missionProgress || 0;
        if (mission.type === 'unlock') {
            const unlockedKey = `unlocked${mission.category.charAt(0).toUpperCase() + mission.category.slice(1)}`;
            progress = playerData[unlockedKey]?.includes(mission.itemToUnlock) ? 100 : 0;
            currentVal = progress === 100 ? 1 : 0;
        } else if (mission.type === 'gamesPlayed') {
            progress = (gamesPlayed / mission.target) * 100;
            currentVal = gamesPlayed;
        } else {
            progress = (currentVal / mission.target) * 100;
        }
        missionTextEl.textContent = `${mission.description} (${currentVal}/${mission.target})`;
        missionProgressEl.style.width = `${Math.min(100, progress)}%`;
    }

    function checkMissionProgress(type, value) {
        const mission = playerData.currentMission;
        if (!mission || mission.id === 'none' || mission.type !== type) return;

        let missionCompleted = false;

        if (mission.type === 'food' || mission.type === 'score') {
            playerData.missionProgress += value;
            if (playerData.missionProgress >= mission.target) {
                missionCompleted = true;
            }
        } else if (mission.type === 'gamesPlayed') {
            // gamesPlayed zaten gameOver içinde artırılıyor, burada sadece kontrol et
            if (gamesPlayed >= mission.target) {
                missionCompleted = true;
            }
        } else if (mission.type === 'unlock' && type === 'unlock') {
            const unlockedKey = `unlocked${mission.category.charAt(0).toUpperCase() + mission.category.slice(1)}`;
            if (playerData[unlockedKey]?.includes(mission.itemToUnlock)) {
                missionCompleted = true;
            }
        }

        if (missionCompleted) {
            playerData.coins += mission.reward;
            floatingTexts.push({ text: `Görev Tamam!`, x: tileCountX / 2, y: tileCountY / 2, alpha: 1 });
            playerData.totalMissionsCompleted++;
            playerData.missionProgress = 0; // Görev ilerlemesini sıfırla
            generateNewMission(); // Yeni görev oluştur
        }
        saveData();
        updateMissionUI();
    }

    // --- MAĞAZA ---
    function openShop() {
        shopScreen.classList.add('active');
        updateShopUI(); 
    }
    function closeShop() { shopScreen.classList.remove('active'); }
    function updateShopUI() {
        updateUI();
        Object.keys(shopItems).forEach(category => {
            const container = document.getElementById(`tab-${category}`);
            if (!container) { console.warn(`Mağaza sekmesi bulunamadı: tab-${category}`); return; }
            container.innerHTML = '';
            shopItems[category].forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'shop-item';
                const unlockedKey = `unlocked${category.charAt(0).toUpperCase() + category.slice(1)}`;
                const equippedKey = `equipped${category.charAt(0).toUpperCase() + category.slice(1, -1)}`;
                
                if (!playerData[unlockedKey]) playerData[unlockedKey] = [];

                const isUnlocked = playerData[unlockedKey].includes(item.id);
                let btn;

                if (category === 'foods' || category === 'powerups') {
                    const activeKey = `active${category.charAt(0).toUpperCase() + category.slice(1)}`;
                    const isActive = playerData[activeKey].includes(item.id);
                    if (isActive) {
                        btn = `<button data-action="remove" data-category="${category}" data-itemid="${item.id}">Çıkar</button>`;
                    } else if (isUnlocked) {
                        btn = `<button data-action="add" data-category="${category}" data-itemid="${item.id}">Ekle</button>`;
                    } else if (playerData.coins >= item.price) {
                        btn = `<button data-action="buy" data-category="${category}" data-itemid="${item.id}">Al (${item.price})</button>`;
                    } else {
                        btn = `<button disabled>Al (${item.price})</button>`;
                    }
                } else { // skins, animals, backgrounds
                    const equippedKey = `equipped${category.charAt(0).toUpperCase() + category.slice(1, -1)}`;
                    const isEquipped = playerData[equippedKey] === item.id;
                    if (isEquipped) {
                        btn = `<button class="equipped" disabled>Kullanımda</button>`;
                    } else if (isUnlocked) {
                        btn = `<button data-action="equip" data-category="${category}" data-itemid="${item.id}">Seç</button>`;
                    } else if (playerData.coins >= item.price) {
                        btn = `<button data-action="buy" data-category="${category}" data-itemid="${item.id}">Al (${item.price})</button>`;
                    } else {
                        btn = `<button disabled>Al (${item.price})</button>`;
                    }
                }
                
                let previewContent = '';
                let previewStyle = '';

                if (category === 'skins' || category === 'backgrounds') {
                    previewStyle = `background-color: ${item.value}; border: 1px solid #555;`;
                    previewContent = ''; // Remove text from color previews
                } else {
                    previewContent = item.value; // Show emoji for animals, foods, powerups
                    previewStyle = `background-color: #2c2c2c;`; // Default background for emojis
                }

                itemEl.innerHTML = `<div class="item-preview" style="${previewStyle}">${previewContent}</div><p>${item.name}</p>${btn}`;
                container.appendChild(itemEl);
            });
        });
    }
    function handleShopAction(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const { action, category, itemid } = button.dataset;
        const item = shopItems[category].find(i => i.id === itemid);
        if (!item) return;
        const unlockedKey = `unlocked${category.charAt(0).toUpperCase() + category.slice(1)}`;
        const equippedKey = `equipped${category.charAt(0).toUpperCase() + category.slice(1, -1)}`;
        if (action === 'buy') {
            if (playerData.coins >= item.price) {
                playerData.coins -= item.price;
                if (!playerData[unlockedKey]) playerData[unlockedKey] = []; 
                playerData[unlockedKey].push(item.id);
                if (category === 'skins' || category === 'animals' || category === 'backgrounds') { 
                    playerData[equippedKey] = item.id; 
                } else if (category === 'foods') {
                    playerData.activeFoods.push(item.id);
                } else if (category === 'powerups') {
                    playerData.activePowerups.push(item.id);
                }
                checkMissionProgress('unlock', itemid);
                showToast(`${item.name} satın alındı!`, 2000);
            } else {
                showToast("Yetersiz bakiye!", 2000);
            }
        } else if (action === 'equip') {
            playerData[equippedKey] = item.id;
            showToast(`${item.name} seçildi!`, 2000);
        } else if (action === 'add') {
            if (category === 'foods') {
                playerData.activeFoods.push(item.id);
                showToast(`${item.name} eklendi!`, 2000);
            } else if (category === 'powerups') {
                playerData.activePowerups.push(item.id);
                showToast(`${item.name} eklendi!`, 2000);
            }
        } else if (action === 'remove') {
            if (category === 'foods') {
                playerData.activeFoods = playerData.activeFoods.filter(id => id !== item.id);
                showToast(`${item.name} çıkarıldı!`, 2000);
            } else if (category === 'powerups') {
                playerData.activePowerups = playerData.activePowerups.filter(id => id !== item.id);
                showToast(`${item.name} çıkarıldı!`, 2000);
            }
        }
        saveData();
        updateShopUI();
        console.log("handleShopAction sonrası playerData:", playerData);
    }

    // --- PAYLAŞIM VE REKLAM ---
    function shareScore() {
        const text = `Yılan oyununda ${score} puan aldım! Sen de oyna!`;
        if (navigator.share) {
            navigator.share({ title: 'Yılan Oyunu Skorum', text: text, url: window.location.href }).catch(console.error);
        }
    }
    function showFakeAd(duration, callback) {
        const adOverlay = document.createElement('div');
        adOverlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); color:white; display:flex; justify-content:center; align-items:center; font-size:1.5em; z-index:200; flex-direction:column; text-align:center;';
        let countdown = duration;
        adOverlay.innerHTML = `<div>Reklam</div><div style="font-size:0.8em; margin-top:10px;">Ödülünüz ${countdown} saniye sonra...</div>`;
        gameContainer.appendChild(adOverlay);
        const adInterval = setInterval(() => {
            countdown--;
            adOverlay.innerHTML = `<div>Reklam</div><div style="font-size:0.8em; margin-top:10px;">Ödülünüz ${countdown} saniye sonra...</div>`;
            if (countdown <= 0) {
                clearInterval(adInterval);
                gameContainer.removeChild(adOverlay);
                callback(true);
            }
        }, 1000);
    }

    // --- BAŞLANGIÇ VE OLAY DİNLEYİCİLERİ ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        tileCountX = Math.floor(canvas.width / gridSize);
        tileCountY = Math.floor(canvas.height / gridSize);
    }
    function initialize() {
        loadData();
        resizeCanvas();
        updateUI();
        updateMissionUI();
        startScreen.classList.add('active');

        // Ses efektlerini burada başlat
        eatSound = new Tone.MembraneSynth().toDestination();
        selfCollisionSound = new Tone.NoiseSynth().toDestination();
        bombCollisionSound = new Tone.MetalSynth().toDestination();
        clickSound = new Tone.Synth({"oscillator": {"type": "sine"}, "envelope": {"attack": 0.001, "decay": 0.05, "sustain": 0.0, "release": 0.05}}).toDestination();
        gameOverSound = new Tone.NoiseSynth().toDestination();

        // Kontroller
        document.addEventListener('keydown', e => {
            const key = e.key;
            if ((key === 'ArrowUp' || key.toLowerCase() === 'w') && direction.y === 0) newDirection = { x: 0, y: -1 };
            else if ((key === 'ArrowDown' || key.toLowerCase() === 's') && direction.y === 0) newDirection = { x: 0, y: 1 };
            else if ((key === 'ArrowLeft' || key.toLowerCase() === 'a') && direction.x === 0) newDirection = { x: -1, y: 0 };
            else if ((key === 'ArrowRight' || key.toLowerCase() === 'd') && direction.x === 0) newDirection = { x: 1, y: 0 };
        });
        canvas.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
        canvas.addEventListener('touchmove', e => {
            if (!touchStartX || !touchStartY) return;
            const diffX = e.touches[0].clientX - touchStartX, diffY = e.touches[0].clientY - touchStartY;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0 && direction.x === 0) newDirection = { x: 1, y: 0 }; else if (diffX < 0 && direction.x === 0) newDirection = { x: -1, y: 0 };
            } else {
                if (diffY > 0 && direction.y === 0) newDirection = { x: 0, y: 1 }; else if (diffY < 0 && direction.y === 0) newDirection = { x: 0, y: -1 };
            }
            touchStartX = null; touchStartY = null;
        }, { passive: true });
        // Butonlar
        startGameBtn.addEventListener('click', () => { Tone.start(); clickSound.triggerAttackRelease("C5", "64n"); initGame(); });
        restartGameBtn.addEventListener('click', () => { clickSound.triggerAttackRelease("C5", "64n"); initGame(); });
        mainShopBtn.addEventListener('click', () => { clickSound.triggerAttackRelease("C5", "64n"); openShop(); });
        gameOverShopBtn.addEventListener('click', () => { clickSound.triggerAttackRelease("C5", "64n"); openShop(); });
        closeShopBtn.addEventListener('click', () => { clickSound.triggerAttackRelease("C5", "64n"); closeShop(); });
        shopScreen.addEventListener('click', (e) => { clickSound.triggerAttackRelease("C5", "64n"); handleShopAction(e); });
        shareScoreBtn.addEventListener('click', () => { clickSound.triggerAttackRelease("C5", "64n"); shareScore(); });
        rewardedAdBtn.addEventListener('click', () => { clickSound.triggerAttackRelease("C5", "64n"); adContinueUsed = true; continueGame(); });
        watchAdForCoinsBtn.addEventListener('click', () => {
            clickSound.triggerAttackRelease("C5", "64n");
            adPromptScreen.classList.remove('active');
            showFakeAd(3, (success) => {
                if (success) { playerData.coins += 50; saveData(); updateUI(); }
                gameOverScreen.classList.add('active');
            });
        });
        skipAdBtn.addEventListener('click', () => {
            clickSound.triggerAttackRelease("C5", "64n");
            adPromptScreen.classList.remove('active');
            gameOverScreen.classList.add('active');
        });
        shopTabs.forEach(tab => tab.addEventListener('click', (e) => {
            clickSound.triggerAttackRelease("C4", "128n"); // Daha kısa ve düşük frekanslı tıklama sesi
            shopTabs.forEach(t => t.classList.remove('active'));
            shopTabContents.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab).classList.add('active');
        }));
        window.addEventListener('resize', resizeCanvas);
    }

    initialize();
});