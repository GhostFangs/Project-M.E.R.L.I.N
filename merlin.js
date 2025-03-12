const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');

// Update file paths to the new location
const dbFile = './memory/users/seen_users.json';
const excludeFile = './memory/users/exclude_users.json';

// Load existing contacts and exclusion list
let seenUsers = fs.existsSync(dbFile) ? fs.readJsonSync(dbFile) : {};
let excludeUsers = fs.existsSync(excludeFile) ? fs.readJsonSync(excludeFile) : [];

// Dynamic J.A.R.V.I.S.-style responses
const responses = [
    "At your service, sir.",
    "I'm all ears, sir.",
    "Certainly.",
    "Right away.",
    "As you wish.",
    "Understood.",
    "Absolutely.",
    "I'm here to assist.",
    "Is there anything else I can help you with?",
    "Of course.",
    "Consider it done."
];

// Initialize the WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate QR code for first-time authentication
client.on('qr', qr => {
    console.log('Scan this QR code to log in:');
    qrcode.generate(qr, { small: true });
});

// Confirm when Merlin is ready
client.on('ready', () => {
    console.log('Merlin is online and ready to assist!');
});

// Handle incoming messages
client.on('message', async msg => {
    let contact = await msg.getContact();
    let name = contact.pushname || contact.name || "there";
    let chatId = msg.from;

    // Exclude users handling
    if (msg.body.toLowerCase().startsWith('exclude')) {
        let phoneNumber = msg.body.split(' ')[1];
        if (!excludeUsers.includes(phoneNumber)) {
            excludeUsers.push(phoneNumber);
            fs.writeJsonSync(excludeFile, excludeUsers);
            msg.reply(`The contact ${phoneNumber} has been excluded from the introduction.`);
        } else {
            msg.reply(`The contact ${phoneNumber} is already excluded.`);
        }
        return;
    }

    if (msg.body.toLowerCase().startsWith('remove exclude')) {
        let phoneNumber = msg.body.split(' ')[2];
        const index = excludeUsers.indexOf(phoneNumber);
        if (index !== -1) {
            excludeUsers.splice(index, 1);
            fs.writeJsonSync(excludeFile, excludeUsers);
            msg.reply(`The contact ${phoneNumber} has been removed from the exclusion list.`);
        } else {
            msg.reply(`The contact ${phoneNumber} is not in the exclusion list.`);
        }
        return;
    }

    // Skip introduction if contact is in the exclusion list
    if (!excludeUsers.includes(chatId)) {
        if (!seenUsers[chatId]) {
            seenUsers[chatId] = true;
            fs.writeJsonSync(dbFile, seenUsers);
            msg.reply(`Hello, ${name}! I'm Merlin—Multifunctional and Enhanced Real-time Logic for Intelligence Network. How can I assist you today?`);
        }
    }

    // Dynamic J.A.R.V.I.S. response
    if (msg.body.toLowerCase().startsWith('hello merlin')) {
        let randomResponse = responses[Math.floor(Math.random() * responses.length)];
        msg.reply(`Hello ${name}, ${randomResponse}`);
    }

    if (msg.body.toLowerCase() === 'who am i?') {
        msg.reply(`You are ${name}, as per my records.`);
    }
});

// Start the client
client.initialize();
