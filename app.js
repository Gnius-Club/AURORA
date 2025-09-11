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
    },
    passwordValidation: {
        regex: /^AURORA.M.I.S.I.O.N.2$/
    }
};

let currentPhase = 'boot';
let selectedMission = null;

// Enhanced audio simulator
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
            console.log('Audio initialized successfully');
        } catch (e) {
            console.log('Audio not available');
        }
    }

    playSound(freq, duration, type = 'sine', volume = 0.1) {
        if (!this.enabled) return;
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = freq;
            osc.type = type;
            gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            osc.start();
            osc.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Silent fail
        }
    }

    playTyping() {
        this.playSound(800 + Math.random() * 200, 0.1, 'square', 0.05);
    }

    playAlarm() {
        this.playSound(440, 2.5, 'sawtooth', 0.15);
    }

    playUIHover() {
        this.playSound(1000, 0.15, 'sine', 0.08);
    }

    playUIClick() {
        this.playSound(1200, 0.2, 'sine', 0.1);
    }

    playUnlock() {
        // Success chord
        this.playSound(440, 0.5, 'sine', 0.1);
        setTimeout(() => this.playSound(554, 0.5, 'sine', 0.1), 100);
        setTimeout(() => this.playSound(659, 0.8, 'sine', 0.15), 200);
    }

    playError() {
        // Error buzz
        this.playSound(200, 0.3, 'sawtooth', 0.12);
        setTimeout(() => this.playSound(180, 0.3, 'sawtooth', 0.12), 100);
    }

    playVaultOpen() {
        // Mechanical opening sound
        this.playSound(300, 1.5, 'square', 0.08);
        setTimeout(() => this.playSound(350, 1.2, 'triangle', 0.06), 200);
        setTimeout(() => this.playSound(400, 1.0, 'sine', 0.1), 800);
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

// Mobile detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Password validation
function validateMission2Password(password) {
    return appData.passwordValidation.regex.test(password);
}

// Vault animation
function openVaultAnimation() {
    const vaultDoor = document.getElementById('vaultDoor');
    const vaultInterior = document.getElementById('vaultInterior');
    
    if (vaultDoor && vaultInterior) {
        // Play vault opening sound
        audio.playVaultOpen();
        
        // Start door opening animation
        vaultDoor.classList.add('opening');
        
        // Show interior after delay
        setTimeout(() => {
            vaultInterior.classList.remove('hidden');
            vaultInterior.classList.add('visible');
        }, 1000);
        
        return appData.timing.vaultAnimationDuration;
    }
    return 0;
}

// Global function to handle ready button click
window.proceedToMissionHub = function() {
    console.log('proceedToMissionHub called - starting mission hub');
    audio.playUIClick();
    startMissionHub();
};

// Phase functions (keeping existing ones intact)
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
        
        // Use both onclick and addEventListener for maximum compatibility
        button.onclick = function(e) {
            console.log('Ready button onclick fired');
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            window.proceedToMissionHub();
            return false;
        };
        
        button.addEventListener('click', function(e) {
            console.log('Ready button addEventListener fired');
            e.preventDefault();
            e.stopPropagation();
            window.proceedToMissionHub();
        });
        
        // Make sure button is focusable and clickable
        button.setAttribute('tabindex', '0');
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
        
        console.log('Ready button is now active and clickable');
    }
}

function startMissionHub() {
    console.log('Phase 4: Mission hub starting');
    showPhase('missionHub');
    
    // Setup Protocol 1 (Mission 1)
    const protocol1 = document.getElementById('protocol1');
    if (protocol1) {
        protocol1.addEventListener('mouseenter', () => audio.playUIHover());
        protocol1.onclick = function(e) {
            console.log('Protocol 1 clicked!');
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            audio.playUIClick();
            selectedMission = 1;
            showMissionModal();
            return false;
        };
    }
    
    // Setup Protocol 2 (Mission 2 - requires password)
    const protocol2 = document.getElementById('protocol2');
    if (protocol2) {
        protocol2.addEventListener('mouseenter', () => audio.playUIHover());
        protocol2.onclick = function(e) {
            console.log('Protocol 2 clicked!');
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            audio.playUIClick();
            selectedMission = 2;
            showPasswordModal();
            return false;
        };
    }
    
    console.log('Mission hub is now active');
}

function showMissionModal() {
    console.log('Modal: Showing level selection for mission', selectedMission);
    const modal = document.getElementById('levelModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Setup level buttons
        const buttons = document.querySelectorAll('.level-button');
        buttons.forEach(button => {
            const level = button.getAttribute('data-level');
            
            button.addEventListener('mouseenter', () => audio.playUIHover());
            button.onclick = function(e) {
                console.log('Level button clicked!', level);
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                audio.playUIClick();
                redirectToMission(selectedMission, level);
                return false;
            };
        });
        
        // Setup close button
        const closeButton = document.getElementById('closeModal');
        if (closeButton) {
            closeButton.onclick = function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                audio.playUIClick();
                modal.classList.add('hidden');
                return false;
            };
        }
        
        // Modal background close
        modal.onclick = function(e) {
            if (e.target === modal) {
                audio.playUIClick();
                modal.classList.add('hidden');
            }
        };
    }
}

function showPasswordModal() {
    console.log('Modal: Showing password input for Mission 2');
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Reset vault state
        const vaultDoor = document.getElementById('vaultDoor');
        const vaultInterior = document.getElementById('vaultInterior');
        const passwordError = document.getElementById('passwordError');
        const passwordInput = document.getElementById('passwordInput');
        
        if (vaultDoor) vaultDoor.classList.remove('opening');
        if (vaultInterior) {
            vaultInterior.classList.add('hidden');
            vaultInterior.classList.remove('visible');
        }
        if (passwordError) passwordError.classList.add('hidden');
        if (passwordInput) {
            passwordInput.value = '';
            // Focus with delay to ensure modal is visible
            setTimeout(() => passwordInput.focus(), 100);
        }
        
        // Setup validation button
        const validateButton = document.getElementById('validatePassword');
        if (validateButton) {
            validateButton.addEventListener('mouseenter', () => audio.playUIHover());
            validateButton.onclick = function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                audio.playUIClick();
                validatePassword();
                return false;
            };
        }
        
        // Setup password input
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    validatePassword();
                }
            });
            
            // Mobile compatibility - ensure keyboard appears
            if (isMobileDevice()) {
                passwordInput.setAttribute('inputmode', 'text');
                passwordInput.setAttribute('autocomplete', 'off');
                passwordInput.setAttribute('autocorrect', 'off');
                passwordInput.setAttribute('spellcheck', 'false');
            }
        }
        
        // Setup close button
        const closeButton = document.getElementById('closePasswordModal');
        if (closeButton) {
            closeButton.onclick = function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                audio.playUIClick();
                modal.classList.add('hidden');
                return false;
            };
        }
        
        // Modal background close
        modal.onclick = function(e) {
            if (e.target === modal) {
                audio.playUIClick();
                modal.classList.add('hidden');
            }
        };
    }
}

async function validatePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const validateButton = document.getElementById('validatePassword');
    
    if (!passwordInput || !passwordError || !validateButton) return;
    
    const password = passwordInput.value.trim();
    
    if (!password) {
        showPasswordError('Por favor ingrese un código de acceso');
        return;
    }
    
    // Disable button during validation
    validateButton.disabled = true;
    validateButton.textContent = 'VALIDANDO...';
    
    await sleep(800); // Dramatic pause
    
    if (validateMission2Password(password)) {
        console.log('Password valid! Opening vault...');
        passwordError.classList.add('hidden');
        audio.playUnlock();
        
        // Start vault opening animation
        const animationDuration = openVaultAnimation();
        
        await sleep(animationDuration);
        
        // Hide password modal and show mission selection
        document.getElementById('passwordModal').classList.add('hidden');
        showMissionModal();
        
    } else {
        console.log('Password invalid');
        showPasswordError('❌ CÓDIGO INVÁLIDO - FORMATO REQUERIDO: AURORAxMxIxSxIxOxNx2');
        audio.playError();
    }
    
    // Re-enable button
    validateButton.disabled = false;
    validateButton.textContent = 'VALIDAR CÓDIGO';
}

function showPasswordError(message) {
    const passwordError = document.getElementById('passwordError');
    if (passwordError) {
        passwordError.textContent = message;
        passwordError.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            passwordError.classList.add('hidden');
        }, 5000);
    }
}

function redirectToMission(missionNumber, level) {
    const missionKey = `mission${missionNumber}`;
    const url = appData.missions[missionKey][level];
    
    if (url) {
        console.log(`Redirecting to: ${url}`);
        
        // Show success message
        const missionName = missionNumber === 1 ? 'PROTOCOLO 1' : 'PROTOCOLO 2';
        const levelNames = {
            primaria_baja: 'CADETE JUNIOR',
            primaria_alta: 'CADETE',
            secundaria: 'ESPECIALISTA',
            preparatoria: 'INGENIERO/A DE CAMPO'
        };
        
        alert(`¡MISIÓN ASIGNADA!\n\n${missionName} - ${levelNames[level]}\n\nSerás redirigido/a a la plataforma de misión externa.\n\n¡Buena suerte, cadete!`);
        
        // Open in new tab
        window.open(url, '_blank');
        
        // Hide modal
        document.getElementById('levelModal').classList.add('hidden');
    } else {
        console.error('URL not found for mission', missionNumber, 'level', level);
        alert('Error: Misión no disponible');
    }
}

// Atmospheric effects (keeping existing ones)
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
    console.log('=== AURORA TERMINAL INITIALIZING ===');
    console.log('Mission URLs loaded:', appData.missions);
    
    // Enable audio on first interaction
    document.addEventListener('click', () => audio.initialize(), { once: true });
    document.addEventListener('touchstart', () => audio.initialize(), { once: true });
    
    // Start atmospheric effects
    setTimeout(addEffects, 1000);
    
    // Start the application
    setTimeout(startBootSequence, 300);
}

// Debug shortcuts (keeping existing ones)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey) {
        switch(e.key) {
            case '1': startBootSequence(); break;
            case '2': startSystemPhase(); break;
            case '3': startBriefing(); break;
            case '4': startMissionHub(); break;
            case 'M': showMissionModal(); break;
            case 'P': showPasswordModal(); break;
        }
    }
});

// Start when page loads
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.auroraDebug = {
    showPhase,
    startBootSequence,
    startBriefing,
    startMissionHub,
    showMissionModal,
    showPasswordModal,
    validateMission2Password,
    openVaultAnimation,
    currentPhase,
    selectedMission,
    audio,
    appData
};