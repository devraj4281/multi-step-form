🎮 QuestPass
QuestPass is a gaming-inspired subscription portal that transforms the "boring" sign-up process into a sleek, 4-step journey. From choosing your "class" to grabbing "loot" (add-ons), it provides a seamless bridge between a polished UI and a secure payment backend.

🛠️ Tech Stack
Client: React (Vite), TailwindCSS, Lucide-React
Server: Node.js, Express.js
Payments: Razorpay API (Test Mode)

✨ Key Features
Multi-Step State Management
Secure Payment Handshake: Backend-first order generation to prevent client-side price manipulation.
Responsive UI: A "mobile-first" approach built with Tailwind utility classes.

🚀 Run Locally
1. Clone the project
Bash
git clone https://github.com/devraj4281/quest-pass
cd quest-pass
2. Setup Frontend
Bash
npm install
# Create a .env file in the root
# VITE_RAZORPAY_KEY_ID=your_test_key_here
npm run dev
3. Setup Backend
Bash
cd server
npm install
# Create a .env file in the /server folder
# RAZORPAY_KEY_ID=your_test_key_here
# RAZORPAY_KEY_SECRET=your_test_secret_here
node index.js
