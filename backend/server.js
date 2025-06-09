// backend/server.js

const express = require('express');
const cors = require('cors');
const db = require('./database.js');

const app = express();
const PORT = 3000; // يمكن تغيير المنفذ إذا لزم الأمر

// Middleware
app.use(cors()); // للسماح بالطلبات من أي مصدر (مهم للتطوير المحلي)
app.use(express.json()); // لتحليل البيانات القادمة بصيغة JSON

// --- API Endpoints ---

// 1. جلب كل أعضاء الفريق
app.get('/api/team', (req, res) => {
    db.all("SELECT * FROM team_members ORDER BY name", [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// 2. إضافة عضو جديد للفريق
app.post('/api/team', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ "error": "Name is required" });
    }
    const sql = 'INSERT INTO team_members (name) VALUES (?)';
    db.run(sql, [name], function(err) {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        // إرجاع العضو الجديد مع الـ ID الذي تم إنشاؤه
        res.status(201).json({ id: this.lastID, name: name });
    });
});

// 3. تعديل اسم عضو
app.put('/api/team/:id', (req, res) => {
    const { name } = req.body;
    const sql = 'UPDATE team_members SET name = ? WHERE id = ?';
    db.run(sql, [name, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({ message: "Updated successfully", changes: this.changes });
    });
});

// 4. حذف عضو
app.delete('/api/team/:id', (req, res) => {
    const sql = 'DELETE FROM team_members WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({ message: "Deleted successfully", changes: this.changes });
    });
});

// 5. جلب كل سجلات المهام (الأحدث أولاً)
app.get('/api/log', (req, res) => {
    db.all("SELECT * FROM task_log ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// 6. إضافة سجل مهمة جديد
app.post('/api/log', (req, res) => {
    const { task_type, members, start_index, previous_assignment_index } = req.body;
    const timestamp = new Date().toISOString(); // استخدام صيغة موحدة للوقت
    const sql = `INSERT INTO task_log (timestamp, task_type, members, start_index, previous_assignment_index)
                 VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [timestamp, task_type, members, start_index, previous_assignment_index], function(err) {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});

// 7. حذف آخر سجل مهمة (لخاصية التراجع)
app.delete('/api/log/latest', (req, res) => {
    // نحذف السجل الذي يملك أكبر ID (وهو آخر سجل تم إضافته)
    const sql = 'DELETE FROM task_log WHERE id = (SELECT MAX(id) FROM task_log)';
    db.run(sql, [], function(err) {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ "message": "No task to undo." });
        }
        res.json({ message: "Last task undone successfully" });
    });
});

// تشغيل الخادم
// استمع على كل الواجهات (0.0.0.0) وهو ما يتطلبه Fly.io
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
