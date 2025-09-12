// Application data and state
const appData = {
    missions: {
        mission1: {
            primaria_baja: "https://gnius-club.github.io/AURORA_M1_PB",
            primaria_alta: "https://gnius-club.github.io/AURORA_M1_PA", 
            secundaria: "https://gnius-club.github.io/AURORA_M1_S",
            preparatoria: "https://gnius-club.github.io/AURORA_M1_H"
        },
        mission2: {
            primaria_baja: "https://gnius-club.github.io/AURORA_M2_PB",
            primaria_alta: "https://gnius-club.github.io/AURORA_M2_PA",
            secundaria: "https://gnius-club.github.io/AURORA_M2_S", 
            preparatoria: "https://gnius-club.github.io/AURORA_M2_H"
        }
    },
    narrative: {
        bootSequence: [
            "> INICIANDO PROTOCOLO DE ENLACE CUÁNTICO...",
            "> ESTABLECIENDO CONEXIÓN CON MARS DEEP SPACE NETWORK...",
            "> CONEXIÓN ESTABLECIDA.",
            "> CARGANDO INTERFAZ DE CONTROL DE MISIÓN A.U.R.O.R.A. v3.4...",
            "> BIENVENIDO, CADETE."
        ],
        briefingText: "CADETE, TENEMOS UNA SITUACIÓN CRÍTICA. EL SISTEMA A.U.R.O.R.A. (AUTOMATED UTILITY FOR RECONNAISSANCE AND ORBITAL RESEARCH ACTIVITIES) HA SUFRIDO DAÑOS SEVEROS TRAS UNA TORMENTA SOLAR INESPERADA. NUESTRAS MISIONES DE EXPLORACIÓN EN MARTE DEPENDEN DE ESTE SISTEMA. SIN A.U.R.O.R.A., PERDEMOS CONTACTO CON NUESTRAS BASES Y ROVERS EN EL PLANETA ROJO. NECESITAMOS QUE EJECUTES LOS PROTOCOLOS DE RECUPERACIÓN INMEDIATAMENTE. ¿ESTÁS PREPARADO/A PARA ESTA MISIÓN?"
    },
    timing: {
        typewriterSpeed: 30,
        bootSequenceDelay: 800,
        crisisPhaseDelay: 6000,
        alarmDuration: 2500,
        vaultAnimationDuration: 2000
    }
};

let currentPhase = 'boot';
let currentMission = 1;

// Simple audio simulator
class AudioSimulator {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
    }

    async initialize() {
        if (this.enabled) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
        } catch (e) {
            console.log('Audio not available');
        }
    }

    playSound(freq, duration, type = 'sine') {
        if (!this.enabled) return;
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = freq;
            osc.type = type;
            gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            osc.start();
            osc.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Silent fail
        }
    }

    playTyping() {
        this.playSound(800 + Math.random() * 200, 0.1, 'square');
    }

    playAlarm() {
        this.playSound(440, 2.5, 'sawtooth');
    }

    playUI() {
        this.playSound(1200, 0.2, 'sine');
    }

    playSuccess() {
        this.playSound(1600, 0.5, 'sine');
    }

    playError() {
        this.playSound(200, 0.8, 'sawtooth');
    }
}

const audio = new AudioSimulator();

// Utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showPhase(phaseId) {
    console.log(`Switching to phase: ${phaseId}`);
    document.querySelectorAll('.phase').forEach(p => p.classList.add('hidden'));
    const phase = document.getElementById(phaseId);
    if (phase) {
        phase.classList.remove('hidden');
        currentPhase = phaseId;
        
        // Update skip button visibility
        updateSkipButton();
    }
}

function updateSkipButton() {
    const skipButton = document.getElementById('skipButton');
    if (!skipButton) return;
    
    if (currentPhase === 'missionHub') {
        skipButton.classList.add('hidden');
    } else {
        skipButton.classList.remove('hidden');
    }
}

async function typeText(elementId, text, speed = appData.timing.typewriterSpeed) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        audio.playTyping();
        await sleep(speed);
    }
}

// Mission 2 password validation
function validateMission2Password(password) {
    // Regex pattern: AURORA + cualquier_char + M + cualquier_char + I + cualquier_char + S + cualquier_char + I + cualquier_char + O + cualquier_char + N + cualquier_char + 2
    const regex = /^AURORA.M.I.S.I.O.N.2$/;
    return regex.test(password);
}

// DIRECT MISSION HUB FUNCTION - No more phase complications
function startMissionHub() {
    console.log('=== JUMPING DIRECTLY TO MISSION HUB ===');
    currentPhase = 'missionHub';
    
    // Hide all phases
    document.querySelectorAll('.phase').forEach(p => p.classList.add('hidden'));
    
    // Show mission hub
    const missionHub = document.getElementById('missionHub');
    if (missionHub) {
        missionHub.classList.remove('hidden');
    }
    
    // Hide skip button
    const skipButton = document.getElementById('skipButton');
    if (skipButton) {
        skipButton.classList.add('hidden');
    }
    
    // Setup protocols immediately
    setTimeout(() => {
        setupProtocolButtons();
    }, 100);
}

function setupProtocolButtons() {
    console.log('Setting up protocol buttons...');
    
    // Protocol 1 - Mission 1
    const protocol1 = document.getElementById('protocol1');
    if (protocol1) {
        // Remove all existing event listeners by replacing the element
        const newProtocol1 = protocol1.cloneNode(true);
        protocol1.parentNode.replaceChild(newProtocol1, protocol1);
        
        // Add click handler
        newProtocol1.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('✓ Protocol 1 clicked - opening Mission 1 selection');
            audio.playUI();
            currentMission = 1;
            showMissionModal(1);
        });
        
        // Also add touch handler for mobile
        newProtocol1.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('✓ Protocol 1 touched - opening Mission 1 selection');
            audio.playUI();
            currentMission = 1;
            showMissionModal(1);
        });
        
        console.log('✓ Protocol 1 is now active and clickable');
    }
    
    // Protocol 2 - Mission 2 (FIXED: Now clickable and functional)
    const protocol2 = document.getElementById('protocol2');
    if (protocol2) {
        // Remove all existing event listeners by replacing the element
        const newProtocol2 = protocol2.cloneNode(true);
        protocol2.parentNode.replaceChild(newProtocol2, protocol2);
        
        // Add click handler
        newProtocol2.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('✓ Protocol 2 clicked - requesting password');
            audio.playUI();
            unlockMission2();
        });
        
        // Also add touch handler for mobile
        newProtocol2.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('✓ Protocol 2 touched - requesting password');
            audio.playUI();
            unlockMission2();
        });
        
        console.log('✓ Protocol 2 is now active and clickable');
    }
}

function unlockMission2() {
    console.log('Unlocking Mission 2...');
    
    // Use prompt for password input
    const password = prompt('INGRESE CÓDIGO DE ACCESO PARA PROTOCOLO 2:\n\nFormato: AURORAxMxIxSxIxOxNx2\n(donde x = cualquier carácter)');
    
    if (password === null) {
        // User cancelled
        console.log('Password entry cancelled');
        return;
    }
    
    if (validateMission2Password(password)) {
        console.log('✓ Password valid! Unlocking Mission 2...');
        audio.playSuccess();
        openVaultAnimation();
    } else {
        console.log('✗ Invalid password');
        audio.playError();
        alert('CÓDIGO DE ACCESO INVÁLIDO\n\nFormato requerido: AURORAxMxIxSxIxOxNx2\ndonde x = cualquier carácter\n\nEjemplos válidos:\n• AURORAyMfIVSrI-O5Nd2\n• AURORAFMgI#S3I5O8Nb2\n• AURORAvMeIaSxIx2O2Nx/2');
    }
}

function openVaultAnimation() {
    console.log('Opening vault animation...');
    const vaultModal = document.getElementById('vaultModal');
    if (vaultModal) {
        vaultModal.classList.remove('hidden');
        
        setTimeout(() => {
            vaultModal.classList.add('hidden');
            currentMission = 2;
            showMissionModal(2);
        }, appData.timing.vaultAnimationDuration);
    }
}

function showMissionModal(missionNumber) {
    console.log(`✓ Modal: Showing level selection for Mission ${missionNumber}`);
    const modal = document.getElementById('levelModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (modal && modalTitle) {
        // Update modal title
        modalTitle.textContent = `SELECCIONAR RANGO DE MISIÓN - PROTOCOLO ${missionNumber}`;
        
        modal.classList.remove('hidden');
        
        // Setup level buttons with correct URLs
        const buttons = document.querySelectorAll('.level-button');
        const missionData = missionNumber === 1 ? appData.missions.mission1 : appData.missions.mission2;
        
        buttons.forEach((button) => {
            const level = button.getAttribute('data-level');
            const url = missionData[level];
            
            // Create new button to ensure clean event handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                console.log(`✓ Level button clicked! Mission ${missionNumber}, Level: ${level}`);
                audio.playUI();
                redirectToMission(url, missionNumber, level);
            });
        });
        
        // Modal close handler - click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

function redirectToMission(url, missionNumber, level) {
    console.log(`✓ Redirecting to Mission ${missionNumber}, Level: ${level}, URL: ${url}`);
    
    // Open in new tab
    window.open(url, '_blank');
    
    // Close modal
    const modal = document.getElementById('levelModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Phase functions (kept for story mode, but simplified)
async function startBootSequence() {
    console.log('Phase 1: Boot sequence starting');
    showPhase('bootSequence');
    
    const bootText = document.getElementById('bootText');
    if (!bootText) return;
    
    bootText.innerHTML = '';
    
    for (const line of appData.narrative.bootSequence) {
        const div = document.createElement('div');
        bootText.appendChild(div);
        
        for (let i = 0; i < line.length; i++) {
            div.textContent += line[i];
            audio.playTyping();
            await sleep(appData.timing.typewriterSpeed);
        }
        
        await sleep(appData.timing.bootSequenceDelay);
    }
    
    await sleep(2000);
    startSystemPhase();
}

async function startSystemPhase() {
    console.log('Phase 2: System interface starting');
    showPhase('systemInterface');
    
    await sleep(appData.timing.crisisPhaseDelay);
    await startCrisis();
}

async function startCrisis() {
    console.log('Crisis: Starting emergency sequence');
    
    const status = document.getElementById('systemStatus');
    const errors = document.getElementById('errorMessages');
    const interface = document.getElementById('systemInterface');
    
    if (status && errors && interface) {
        status.classList.add('critical');
        const statusText = status.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = '¡ALERTA! ¡SEÑAL CRÍTICA!';
        }
        
        audio.playAlarm();
        interface.classList.add('glitch-active');
        errors.classList.remove('hidden');
        
        await sleep(appData.timing.alarmDuration);
        
        for (let i = 0; i < 8; i++) {
            await sleep(150 + Math.random() * 200);
            interface.classList.toggle('glitch-active');
        }
    }
    
    await sleep(2000);
    startBriefing();
}

async function startBriefing() {
    console.log('Phase 3: Briefing starting');
    showPhase('briefingPhase');
    
    await typeText('briefingText', appData.narrative.briefingText, 25);
    
    const button = document.getElementById('readyButton');
    if (button) {
        button.classList.remove('hidden');
        
        // Create completely new button
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add multiple event types for maximum compatibility
        newButton.addEventListener('click', handleReadyClick);
        newButton.addEventListener('touchend', handleReadyClick);
        newButton.addEventListener('mouseup', handleReadyClick);
        
        console.log('✓ Ready button is now active and clickable');
    }
}

function handleReadyClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    console.log('✓ Ready button activated - advancing to mission hub');
    audio.playUI();
    startMissionHub();
}

// Skip intro functionality - GUARANTEED TO WORK
function setupSkipButton() {
    const skipButton = document.getElementById('skipButton');
    if (skipButton) {
        // Multiple event types for compatibility
        skipButton.addEventListener('click', handleSkipClick);
        skipButton.addEventListener('touchend', handleSkipClick);
        skipButton.addEventListener('mouseup', handleSkipClick);
        
        console.log('✓ Skip button is now active');
    }
}

function handleSkipClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    console.log('✓ Skip button clicked - jumping directly to mission hub');
    audio.playUI();
    startMissionHub();
}

// Atmospheric effects
function addEffects() {
    // Scanlines flicker
    setInterval(() => {
        if (Math.random() < 0.08) {
            const scanlines = document.querySelector('.scanlines');
            if (scanlines) {
                scanlines.style.opacity = '0.7';
                setTimeout(() => scanlines.style.opacity = '1', 80);
            }
        }
    }, 1500);
    
    // Screen flicker
    setInterval(() => {
        if (Math.random() < 0.03) {
            document.body.style.filter = 'brightness(1.15)';
            setTimeout(() => document.body.style.filter = 'brightness(1)', 40);
        }
    }, 800);
}

// Initialize everything
function init() {
    console.log('=== AURORA TERMINAL v3 INITIALIZING ===');
    
    // Enable audio on first interaction
    document.addEventListener('click', () => audio.initialize(), { once: true });
    
    // Setup skip button FIRST
    setupSkipButton();
    
    // Start atmospheric effects
    setTimeout(addEffects, 1000);
    
    // Start the application
    setTimeout(startBootSequence, 300);
}

// Debug shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey) {
        switch(e.key) {
            case '1': startBootSequence(); break;
            case '2': startSystemPhase(); break;
            case '3': startBriefing(); break;
            case '4': startMissionHub(); break;
            case 'M': showMissionModal(1); break;
            case 'N': showMissionModal(2); break;
            case 'T': 
                // Test Mission 2 password validation
                const testPasswords = [
                    "AURORAyMfIVSrI-O5Nd2",
                    "AURORAFMgI#S3I5O8Nb2", 
                    "AURORAvMeIaSxIx2O2Nx/2",
                    "AURORAxMtIRSxI2O7Nx&2",
                    "INVALID"
                ];
                testPasswords.forEach(pwd => {
                    console.log(`Password "${pwd}": ${validateMission2Password(pwd) ? 'VALID' : 'INVALID'}`);
                });
                break;
        }
    }
});

// Emergency skip - press H to go directly to hub
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        console.log('Emergency hub shortcut activated');
        startMissionHub();
    }
});

// Start when page loads
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.auroraDebug = {
    startMissionHub,
    showMissionModal,
    validateMission2Password,
    unlockMission2,
    setupProtocolButtons,
    currentPhase,
    currentMission,
    audio,
    appData
};
