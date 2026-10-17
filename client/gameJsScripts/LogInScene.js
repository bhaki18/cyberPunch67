export default class LogInScene extends Phaser.Scene {
    constructor() {
        super("LogInScene");

        this.isLoggingIn = false;
    }

    create() {
        this.sound.play("modal_open", { volume: 0.35 });
        // Create the Cyberpunk form container overlay
        this.overlay = document.createElement("div");
        this.overlay.className = "cyber-modal-overlay";
        this.overlay.innerHTML = `
            <button class="cyber-close-btn" id="cyber-close-btn" title="Close">&times;</button>
            <h2 class="cyber-title">System LogIn</h2>
            <div class="cyber-subtitle">cyber_punch_67 // credentials</div>
            <form class="cyber-form" id="cyber-login-form">
                <div class="cyber-input-group">
                    <input type="text" id="cyber-username" class="cyber-input" required placeholder=" " autocomplete="username">
                    <label for="cyber-username" class="cyber-label">Username</label>
                </div>
                <div class="cyber-input-group">
                    <input type="password" id="cyber-password" class="cyber-input" required placeholder=" " autocomplete="current-password">
                    <label for="cyber-password" class="cyber-label">Password</label>
                </div>
                <button type="submit" class="cyber-submit-btn" id="cyber-submit-btn">Intrude // Enter</button>
                <div class="cyber-loader" id="cyber-loader" style="display: none;">
                    <div class="cyber-spinner"></div>
                    <span>Establishing Link...</span>
                </div>
                <div class="cyber-footer">
                    <a class="cyber-switch-link" id="cyber-signup-link">
                        No account? <span>Establish credentials</span>
                    </a>
                </div>
                <div class="cyber-help-text">Authorized access only</div>
            </form>
        `;
        document.body.appendChild(this.overlay);

        // Keep references for compatibility/safety
        this.usernameInput = this.overlay.querySelector("#cyber-username");
        this.passwordInput = this.overlay.querySelector("#cyber-password");

        // Close button listener
        const closeBtn = this.overlay.querySelector("#cyber-close-btn");
        closeBtn.addEventListener("click", () => {
            this.sound.play("modal_close", { volume: 0.35 });
            this.shutdown();
            this.scene.stop();
            this.scene.wake("MainMenuScene");
        });

        // Sign up link listener
        const signupLink = this.overlay.querySelector("#cyber-signup-link");
        signupLink.addEventListener("click", () => {
            this.sound.play("btn_click", { volume: 0.45 });
            this.shutdown();
            this.scene.stop();
            this.scene.launch("SignUpScene");
        });

        // Form submit listener
        const form = this.overlay.querySelector("#cyber-login-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const usernameVal = this.usernameInput.value;
            const passwordVal = this.passwordInput.value;

            if (!usernameVal || !passwordVal) return;

            this.connettiAlServer({
                usernameInput: usernameVal,
                passwordInput: passwordVal
            });
        });
    }

    update() {
        // Logic handled through DOM events
    }

    async connettiAlServer(dati) {
        if (this.isLoggingIn) return;
        this.isLoggingIn = true;

        const loader = this.overlay?.querySelector("#cyber-loader");
        const submitBtn = this.overlay?.querySelector("#cyber-submit-btn");
        const inputs = this.overlay?.querySelectorAll(".cyber-input");
        const closeBtn = this.overlay?.querySelector("#cyber-close-btn");

        if (loader) loader.style.display = "flex";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Connecting...";
        }
        if (inputs) inputs.forEach(input => input.disabled = true);
        if (closeBtn) closeBtn.disabled = true;

        try {
            const res = await fetch("https://cyberpunch67.onrender.com/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: dati.usernameInput,
                    password: dati.passwordInput
                })
            });

            const data = await res.json();

            if (!data.token) {
                this.sound.play("access_denied", { volume: 0.45 });
                console.log("Login fallito:", data);
                this.isLoggingIn = false;

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Access Denied - Retry";
                }
                if (loader) loader.style.display = "none";
                if (inputs) inputs.forEach(input => input.disabled = false);
                if (closeBtn) closeBtn.disabled = false;
                return;
            }

            // ---------------- SALVA TOKEN
            localStorage.setItem("token", data.token);
            localStorage.setItem("playerLogged", "true");

            // ---------------- SOCKET CONNECT
            this.socket = io("https://cyberpunch67.onrender.com", {
                auth: {
                    token: data.token
                }
            });
            window.socket = this.socket;
            this.socket.on("playerLoggato", (player) => {
                window.player = player;
            });

            this.socket.on("connect", () => {
                this.sound.play("access_granted", { volume: 0.5 });
                window.socket.isLogged = true;

                // vai all'hub
                this.shutdown();
                this.scene.stop();
                this.scene.wake("MainMenuScene");
            });

        } catch (err) {
            this.sound.play("access_denied", { volume: 0.45 });
            console.error("Errore login:", err);
            this.isLoggingIn = false;

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Error - Retry";
            }
            if (loader) loader.style.display = "none";
            if (inputs) inputs.forEach(input => input.disabled = false);
            if (closeBtn) closeBtn.disabled = false;

            localStorage.setItem("playerLogged", "false");
        }
    }

    shutdown() {
        // Clean up DOM container
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        // Fallback cleanup
        if (this.usernameInput && this.usernameInput.parentNode) this.usernameInput.remove();
        if (this.passwordInput && this.passwordInput.parentNode) this.passwordInput.remove();
    }
}

