const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Cấu hình kết nối PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5433,
    options: '-c search_path=public'
});

// Trang đăng nhập (GET)
router.get('/', (req, res) => {
    res.render('login');
});

// Xử lý đăng nhập (POST)
router.post('/', async (req, res) => {
    const { tai_khoan, mat_khau } = req.body;

    try {
        // Lấy thông tin người dùng bao gồm tên
        const result = await pool.query(`
            SELECT nd.*, vt.ten_vaitro 
            FROM nguoi_dung nd 
            LEFT JOIN vai_tro vt ON nd.id_vaitro = vt.id_vaitro 
            WHERE nd.tai_khoan = $1
        `, [tai_khoan]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            if (user.mat_khau === mat_khau) {
                // Debug logging
                // LƯU Ý: Bảng nguoi_dung sử dụng cột id_user (không phải id_nguoidung)
                console.log('🔐 Đăng nhập thành công cho user:', {
                    id_user: user.id_user,
                    tai_khoan: user.tai_khoan,
                    ho_ten: user.ho_ten,
                    id_vaitro: user.id_vaitro,
                    ten_vaitro: user.ten_vaitro,
                    email: user.email,
                    so_dt: user.so_dt
                });

                // Lưu thông tin người dùng vào session (đảm bảo id_user được lưu)
                req.session.user = user;
                console.log('💾 Session đã lưu với id_user:', req.session.user.id_user);

                // Kiểm tra vai trò để chuyển hướng
                console.log('🔍 So sánh id_vaitro:', {
                    value: user.id_vaitro,
                    type: typeof user.id_vaitro,
                    comparison: user.id_vaitro == 1,
                    strictComparison: user.id_vaitro === 1
                });
                
                if (user.id_vaitro == 1) {
                    console.log('✅ User là admin, chuyển hướng đến /admin');
                    res.redirect('/admin');
                } else {
                    console.log('👤 User là người dùng thường, chuyển hướng đến /');
                    res.redirect('/');
                }
            } else {
                res.send('<script>alert("Sai mật khẩu!"); window.location="/login";</script>');
            }
        } else {
            res.send('<script>alert("Tài khoản không tồn tại!"); window.location="/login";</script>');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi kết nối cơ sở dữ liệu');
    }
});

// Route logout - Hiển thị trang để clear giỏ hàng trước khi logout
router.get('/logout', (req, res) => {
    res.render('logout');
});

// Route POST logout - Thực hiện đăng xuất thực sự
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Lỗi khi đăng xuất');
        }
        res.redirect('/login');
    });
});

module.exports = router;
