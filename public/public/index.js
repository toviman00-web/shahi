const path = require('path');
const express = require('express');

const app = express();

// Цей рядок говорить серверу віддавати файли з папки public:
app.use(express.static(path.join(__dirname, 'public')));
