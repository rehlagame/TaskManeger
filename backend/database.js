const sqlite3 = require('sqlite3').verbose();
// تحقق مما إذا كنا نعمل على Fly.io (الذي يوفر هذا المتغير) أم محلياً
const isProduction = process.env.FLY_APP_NAME;

// اختر مسار قاعدة البيانات بناءً على البيئة
const DB_SOURCE = isProduction ? "/data/tasks.db" : "tasks.db";

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');

        db.serialize(() => {
            // جدول أعضاء الفريق
            db.run(`CREATE TABLE IF NOT EXISTS team_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    // هذا الخطأ لن يحدث عادة إلا في حالات نادرة مثل عدم وجود صلاحيات للكتابة
                    console.error("Error creating team_members table", err.message);
                }
            });

            // جدول سجل المهام (بدون التعليق الخاطئ)
            db.run(`CREATE TABLE IF NOT EXISTS task_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                task_type TEXT NOT NULL,
                members TEXT NOT NULL,
                start_index INTEGER,
                previous_assignment_index INTEGER
            )`, (err) => {
                if (err) {
                    // هذا هو المكان الذي ظهر فيه الخطأ عندك
                    console.error("Error creating task_log table", err.message);
                }
            });
        });
    }
});

module.exports = db;
