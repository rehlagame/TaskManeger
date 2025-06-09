const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // سنستخدم مكتبة path المدمجة للتعامل مع المسارات بشكل أفضل

// --- الكود الذكي لتحديد مسار قاعدة البيانات ---

// 1. تحقق مما إذا كنا نعمل على بيئة الإنتاج (خادم Fly.io)
const isProduction = process.env.FLY_APP_NAME;

// 2. حدد المجلد الذي يجب أن تُحفظ فيه قاعدة البيانات
//    - في بيئة الإنتاج، سيكون المجلد الدائم '/data'
//    - في البيئة المحلية، سيكون المجلد الحالي 'backend'
const dbFolder = isProduction ? '/data' : __dirname;

// 3. أنشئ المسار الكامل لملف قاعدة البيانات
const DB_SOURCE = path.join(dbFolder, 'tasks.db');

// ----------------------------------------------


const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error("Failed to connect to database:", err.message);
        throw err;
    } else {
        console.log(`Connected to the SQLite database at ${DB_SOURCE}`);

        db.serialize(() => {
            // جدول أعضاء الفريق
            db.run(`CREATE TABLE IF NOT EXISTS team_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("Error creating team_members table", err.message);
                }
            });

            // جدول سجل المهام
            db.run(`CREATE TABLE IF NOT EXISTS task_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                task_type TEXT NOT NULL,
                members TEXT NOT NULL,
                start_index INTEGER,
                previous_assignment_index INTEGER
            )`, (err) => {
                if (err) {
                    console.error("Error creating task_log table", err.message);
                }
            });
        });
    }
});

module.exports = db;
