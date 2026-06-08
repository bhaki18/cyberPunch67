export default class SignUpScene extends Phaser.Scene {

    constructor() {
        super("SignUpScene");

        this.trySignup = false;
    }

    create() {

        const { width, height } = this.scale;

        // ---------------- UI PANEL
        this.panel = this.add.rectangle(
            width / 2,
            height / 2,
            420,
            300,
            0x111111,
            0.95
        );

        this.add.text(width / 2, height / 2 - 110, "SIGN UP", {
            fontSize: "22px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // ---------------- CLOSE BUTTON
        this.closeBtn = this.add.rectangle(
            width / 2 + 190,
            height / 2 - 130,
            30,
            30,
            0xff0000
        ).setInteractive();

        this.add.text(this.closeBtn.x, this.closeBtn.y, "X", {
            fontSize: "18px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.closeBtn.on("pointerdown", () => {
            this.scene.stop();
            this.shutdown();

        });

        // ---------------- USERNAME INPUT
        this.usernameInput = document.createElement("input");
        this.usernameInput.placeholder = "username";
        this.usernameInput.style.position = "absolute";
        this.usernameInput.style.left = "50%";
        this.usernameInput.style.top = "45%";
        this.usernameInput.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(this.usernameInput);

        // ---------------- PASSWORD INPUT
        this.passwordInput = document.createElement("input");
        this.passwordInput.type = "password";
        this.passwordInput.placeholder = "password";
        this.passwordInput.style.position = "absolute";
        this.passwordInput.style.left = "50%";
        this.passwordInput.style.top = "52%";
        this.passwordInput.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(this.passwordInput);

        // ---------------- INFO TEXT
        this.add.text(width / 2, height / 2 + 110,
            "ENTER per registrarti", {
            fontSize: "14px",
            color: "#aaaaaa"
        }).setOrigin(0.5);

        // ---------------- ENTER KEY
        this.enterKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );
    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.trySignup = true;
        }

        if (this.trySignup) {
            this.trySignup = false;

            const dati = {
                username: this.usernameInput.value,
                password: this.passwordInput.value
            };

            if (!dati.username || !dati.password) {
                console.log("Missing fields");
                return;
            }

            this.sendSignup(dati);
            this.shutdown();
            this.scene.stop();
            this.scene.start("LogInScene");
        }
    }

    async sendSignup(dati) {

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
                return;
            }

            console.log("Signup ok");

            // torna login o menu
            this.scene.start("LogInScene");

        } catch (err) {
            console.error("Errore signup:", err);
        }
    }

    shutdown() {
        if (this.usernameInput) this.usernameInput.remove();
        if (this.passwordInput) this.passwordInput.remove();
    }
}