export default class LogInScene extends Phaser.Scene {
    constructor() {
        super("LogInScene");

        this.tryLogin = false;
    }

    create() {

        const { width, height } = this.scale;

        // ---------------- PANEL UI
        this.panel = this.add.rectangle(
            width / 2,
            height / 2,
            420,
            280,
            0x111111,
            0.95
        );

        this.add.text(width / 2, height / 2 - 110, "LOGIN", {
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

        // ---------------- INPUT DOM USERNAME
        this.usernameInput = document.createElement("input");
        this.usernameInput.placeholder = "username";
        this.usernameInput.style.position = "absolute";
        this.usernameInput.style.left = "50%";
        this.usernameInput.style.top = "45%";
        this.usernameInput.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(this.usernameInput);

        // ---------------- INPUT DOM PASSWORD
        this.passwordInput = document.createElement("input");
        this.passwordInput.type = "password";
        this.passwordInput.placeholder = "password";
        this.passwordInput.style.position = "absolute";
        this.passwordInput.style.left = "50%";
        this.passwordInput.style.top = "52%";
        this.passwordInput.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(this.passwordInput);

        // ---------------- INFO TEXT
        this.add.text(width / 2, height / 2 + 110, "ENTER per login", {
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
            this.tryLogin = true;
        }

        if (this.tryLogin) {
            this.tryLogin = false;
            this.shutdown();

            const dati = {
                usernameInput: this.usernameInput.value,
                passwordInput: this.passwordInput.value
            };

            if (!dati.usernameInput || !dati.passwordInput) {
                console.log("Missing fields");
                return;
            }

            this.connettiAlServer(dati);
        }
    }

    async connettiAlServer(dati) {

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
                console.log("Login fallito:", data);
                this.shutdown();
                return;
            }

            // ---------------- SALVA TOKEN
            localStorage.setItem("token", data.token);

            // ---------------- SOCKET CONNECT
            this.socket = io("https://cyberpunch67.onrender.com", {
                auth: {
                    token: data.token
                }
            });
            window.socket = this.socket;
            this.socket.on("playerLoggato", (player) => {
                window.player = player;
                console.table(window.player);
            });

            this.socket.on("connect", () => {
                console.log("Socket connesso:", this.socket.id);

                window.socket.isLogged = true;



                // vai all'hub
                this.shutdown();
                this.scene.stop();
                this.scene.start("HubScene");
            });

        } catch (err) {
            console.error("Errore login:", err);
            this.shutdown();
        } finally {
            this.shutdown();
        }
    }

    shutdown() {
        // pulizia DOM
        if (this.usernameInput) this.usernameInput.remove();
        if (this.passwordInput) this.passwordInput.remove();
    }
}

