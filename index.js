app.post(`/bot${TOKEN}`, async (req, res) => {
    try {
        if (!req.body) {
            return res.sendStatus(400);
        }
        
        // Обробити запит через Telegram-бота
        await bot.processUpdate(req.body);
        
        // Обов'язково повідомляємо Telegram, що запит успішно опрацьовано
        res.sendStatus(200);
    } catch (error) {
        // Логуємо помилку у консоль для налагодження
        console.error("Помилка обробки запиту:", error.message);
        
        // Відправляємо статус 200, щоб Telegram не повторював запит, 
        // навіть якщо виникла внутрішня помилка
        res.sendStatus(200);
    }
});
