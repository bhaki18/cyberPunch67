export default class SignUpScene extends Phaser.Scene {

    constructor() {
        super("SignUpScene");

        this.isSigningUp = false;
    }

    create() {
        // Create the Cyberpunk form container overlay
        this.overlay = document.createElement("div");
        this.overlay.className = "cyber-modal-overlay";
        this.overlay.innerHTML = `
            <button class="cyber-close-btn" id="cyber-close-btn" title="Close">&times;</button>
            <h2 class="cyber-title">System SignUp</h2>
            <div class="cyber-subtitle">cyber_punch_67 // create identity</div>
            <form class="cyber-form" id="cyber-signup-form">
                <div class="cyber-input-group">
                    <input type="text" id="cyber-username" class="cyber-input" required placeholder=" " autocomplete="username">
                    <label for="cyber-username" class="cyber-label">Choose Username</label>
                </div>
                <div class="cyber-input-group">
                    <input type="password" id="cyber-password" class="cyber-input" required placeholder=" " autocomplete="new-password">
                    <label for="cyber-password" class="cyber-label">Choose Password</label>
                </div>
                <button type="submit" class="cyber-submit-btn" id="cyber-submit-btn">Establish // Register</button>
                <div class="cyber-loader" id="cyber-loader" style="display: none;">
                    <div class="cyber-spinner"></div>
                    <span>Uploading credentials...</span>
                </div>
                <div class="cyber-footer">
                    <a class="cyber-switch-link" id="cyber-login-link">
                        Already registered? <span>Intrude / LogIn</span>
                    </a>
                </div>
                <div class="cyber-help-text">Creation of new neural interface profile</div>
            </form>
        `;
        document.body.appendChild(this.overlay);

        // Keep references for compatibility/safety
        this.usernameInput = this.overlay.querySelector("#cyber-username");
        this.passwordInput = this.overlay.querySelector("#cyber-password");

        // Close button listener
        const closeBtn = this.overlay.querySelector("#cyber-close-btn");
        closeBtn.addEventListener("click", () => {
            this.shutdown();
            this.scene.stop();
            this.scene.wake("MainMenuScene");
        });

        // Log in link listener
        const loginLink = this.overlay.querySelector("#cyber-login-link");
        loginLink.addEventListener("click", () => {
            this.shutdown();
            this.scene.stop();
            this.scene.launch("LogInScene");
        });

        // Form submit listener
        const form = this.overlay.querySelector("#cyber-signup-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const usernameVal = this.usernameInput.value;
            const passwordVal = this.passwordInput.value;
            
            if (!usernameVal || !passwordVal) return;
            
            this.sendSignup({
                username: usernameVal,
                password: passwordVal
            });
        });
    }

    update() {
        // Logic handled through DOM events
    }

    async sendSignup(dati) {
        if (this.isSigningUp) return;
        this.isSigningUp = true;

        const loader = this.overlay?.querySelector("#cyber-loader");
        const submitBtn = this.overlay?.querySelector("#cyber-submit-btn");
        const inputs = this.overlay?.querySelectorAll(".cyber-input");
        const closeBtn = this.overlay?.querySelector("#cyber-close-btn");

        if (loader) loader.style.display = "flex";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Registering...";
        }
        if (inputs) inputs.forEach(input => input.disabled = true);
        if (closeBtn) closeBtn.disabled = true;

        try {
            const res = await fetch("https://cyberpunch67.onrender.com/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dati)
            });

            const data = await res.json();

            if (data.error) {
                console.log("Signup error:", data.error);
                this.isSigningUp = false;
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Error - Try Another";
                }
                if (loader) loader.style.display = "none";
                if (inputs) inputs.forEach(input => input.disabled = false);
                if (closeBtn) closeBtn.disabled = false;
                return;
            }

            console.log("Signup ok");

            this.shutdown();
            this.scene.stop();
            this.scene.launch("LogInScene");

        } catch (err) {
            console.error("Errore signup:", err);
            this.isSigningUp = false;
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Network Error - Retry";
            }
            if (loader) loader.style.display = "none";
            if (inputs) inputs.forEach(input => input.disabled = false);
            if (closeBtn) closeBtn.disabled = false;
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