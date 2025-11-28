const express = require('express');
const app = express();
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
require('dotenv').config(); // Đọc file .env

// Cấu hình session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Import các route
const loginRoute = require('./routes/login');
const dataRoute = require('./routes/data');
const indexRoute = require('./routes/index');
const thuVienRoute = require('./routes/thu_vien');
const theLoaiRoute = require('./routes/the_loai');
const sachRoute = require('./routes/sach');
const adminRoute = require('./routes/admin');
const registerRoute = require('./routes/register');
const rateRoute = require('./routes/rate');
const muonSachRouter = require('./routes/muonSach');
const trangchinhRouter = require('./routes/trangchinh');
const shopRoute = require('./routes/shop');
const donHangRoute = require('./routes/donhang');


// Cấu hình EJS và thư mục views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware tĩnh và parse dữ liệu
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Parse dữ liệu form
app.use(express.json()); // Parse dữ liệu JSON

// Middleware kiểm tra đăng nhập (trừ các route không cần auth)
const requireAuth = (req, res, next) => {
    console.log(`🔐 Middleware requireAuth: ${req.method} ${req.path}`);
    
    // Các route không cần đăng nhập
    const publicRoutes = ['/login', '/register', '/data', '/images', '/api/rate', '/shop', '/pdfs'];
    
    // Cho phép các route bắt đầu bằng /shop và /pdfs
    const isPublicRoute = publicRoutes.includes(req.path) || 
                          req.path.startsWith('/shop') || 
                          req.path.startsWith('/pdfs');
    
    if (isPublicRoute) {
        console.log(`✅ Route công khai: ${req.path}`);
        return next();
    }
    
    // Kiểm tra session
    if (!req.session.user) {
        console.log(`❌ Không có session, chuyển hướng đến /login`);
        return res.redirect('/login');
    }
    
    console.log(`👤 User đã đăng nhập:`, {
        tai_khoan: req.session.user.tai_khoan,
        id_vaitro: req.session.user.id_vaitro
    });
    
    // Kiểm tra quyền admin cho các route admin
    if (req.path.startsWith('/admin')) {
        console.log(`🔐 Kiểm tra quyền admin cho: ${req.path}`);
        console.log(`🔍 So sánh id_vaitro:`, {
            value: req.session.user.id_vaitro,
            type: typeof req.session.user.id_vaitro,
            comparison: req.session.user.id_vaitro == 1,
            strictComparison: req.session.user.id_vaitro === 1
        });
        
        if (req.session.user.id_vaitro != 1) {
            console.log(`❌ User không có quyền admin, chuyển hướng đến /`);
            return res.redirect('/');
        }
        console.log(`✅ User có quyền admin`);
    }
    
    next();
};

// Áp dụng middleware kiểm tra đăng nhập
app.use(requireAuth);

// Admin routes cụ thể - mount trực tiếp (phải mount trước route gốc)
app.use('/admin/thu_vien', thuVienRoute);
app.use('/admin/the_loai', theLoaiRoute);
app.use('/admin/sach', sachRoute);
app.use('/admin/muon_sach', muonSachRouter);
app.use('/admin/don_hang', donHangRoute);

// Admin route chính - mount trực tiếp (phải mount trước route gốc)
console.log('🔧 Mounting admin route tại /admin');
app.use('/admin', adminRoute);
console.log('✅ Admin route đã được mount');

// Định nghĩa các route khác
app.use('/login', loginRoute);
app.use('/data', dataRoute);
app.use('/register', registerRoute);
app.use('/trangchinh', trangchinhRouter);
app.use('/shop', shopRoute);

// Route logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi khi đăng xuất' });
        }
        res.redirect('/login');
    });
});

// Route gốc phải mount cuối cùng để không chặn các route khác
console.log('🔧 Mounting index route tại /');
app.use('/', indexRoute);
console.log('✅ Index route đã được mount');

// Debug middleware để theo dõi tất cả admin routes - TẠM THỜI BỎ QUA
// app.use('/admin', (req, res, next) => {
//     console.log(`🔐 Admin route được gọi: ${req.method} ${req.path}`);
//     console.log(`🔍 Request URL: ${req.url}`);
//     console.log(`🔍 Request path: ${req.path}`);
//     console.log(`🔍 Session user:`, req.session.user);
//     console.log(`🔍 Router: adminRoute`);
//     console.log(`🔍 Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
//     next();
// });

// Debug middleware để theo dõi route
app.use((req, res, next) => {
    console.log(`🌐 Request: ${req.method} ${req.path}`);
    console.log(`🔍 Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log(`🔍 Session:`, req.session ? 'Có session' : 'Không có session');
    if (req.session && req.session.user) {
        console.log(`👤 User: ${req.session.user.tai_khoan} (id_vaitro: ${req.session.user.id_vaitro})`);
    }
    next();
});

// Xử lý lỗi 404 (trả về JSON cho API, HTML cho trang web)
app.use((req, res, next) => {
    // Kiểm tra xem có phải API request không
    const isApiRequest = req.path.startsWith('/api/') || 
                         req.path.startsWith('/shop/payment-qr') ||
                         req.path.startsWith('/shop/upload-payment-proof') ||
                         req.path.startsWith('/shop/cancel-order') ||
                         req.headers.accept?.includes('application/json');
    
    if (isApiRequest) {
        res.status(404).json({ success: false, message: 'Route not found' });
    } else {
        // Render error page cho HTML requests
        res.status(404).render('error', {
            title: '404 - Không tìm thấy trang',
            message: 'Trang bạn đang tìm kiếm không tồn tại.',
            error: `Route: ${req.method} ${req.originalUrl}`
        });
    }
});

// Xử lý lỗi server chung
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    console.error(`[ERROR] Stack:`, err.stack);
    
    // Kiểm tra xem request có phải là API request không (dựa vào Accept header hoặc path)
    const isApiRequest = req.path.startsWith('/api/') || 
                         req.path.startsWith('/shop/payment-qr') ||
                         req.path.startsWith('/shop/upload-payment-proof') ||
                         req.path.startsWith('/shop/cancel-order') ||
                         req.headers.accept?.includes('application/json') ||
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    } else {
        // Render error page cho HTML requests
        // Nếu render fail, fallback về HTML đơn giản
        try {
            res.status(500).render('error', { 
                message: 'Lỗi server', 
                error: err.message,
                title: 'Lỗi Server'
            });
        } catch (renderError) {
            console.error('[ERROR] Failed to render error page:', renderError);
            res.status(500).send(`
                <html>
                    <head><title>Lỗi Server</title></head>
                    <body style="font-family: Arial; padding: 50px; text-align: center;">
                        <h1>Lỗi Server</h1>
                        <p>${err.message}</p>
                        <a href="/admin">Về Trang Admin</a>
                    </body>
                </html>
            `);
        }
    }
});

// Thêm vào cuối file, trước app.listen
app.use('/api/rate-library', (req, res, next) => {
    console.log('🔍 API rate-library được gọi:', req.method, req.path);
    next();
});

app.use('/api/rate-library', indexRoute);

// Khởi động server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log('📋 Available routes:');
    console.log('  - /login - Đăng nhập');
    console.log('  - /admin - Admin Dashboard');
    console.log('  - /admin/thu_vien - Quản lý thư viện');
    console.log('  - /admin/the_loai - Quản lý thể loại');
    console.log('  - /admin/sach - Quản lý sách');
    console.log('  - /admin/muon_sach - Quản lý mượn sách');
    console.log('  - /admin/images - Quản lý ảnh');
    console.log('  - /admin/xem-anh - Xem Ảnh (Admin)');
    console.log('  - /admin/admin-map - Quản lý Bản đồ Thư viện');
    console.log('  - /admin/test-js - Test JavaScript');
    console.log('  - / - Trang chính');
    console.log('  - /xem-anh - Xem Ảnh (User)');
    console.log('  - /shop - Cửa hàng sách');
    console.log('🔧 Debug mode: ON');
    console.log('🔍 Test routes:');
    console.log('  - /admin/ping - Test JSON response');
    console.log('  - /admin/test-html - Test HTML response');
    console.log('🔍 Middleware order:');
    console.log('  1. requireAuth (kiểm tra đăng nhập)');
    console.log('  2. Admin routes (mount trước)');
    console.log('  3. Other routes');
    console.log('  4. Index route (mount cuối)');
    console.log('🔍 Troubleshooting:');
    console.log('  - Kiểm tra console logs khi truy cập /admin');
    console.log('  - Kiểm tra session và quyền admin');
    console.log('  - Kiểm tra thứ tự mount routes');
    console.log('🔍 Next steps:');
    console.log('  1. Khởi động server');
    console.log('  2. Đăng nhập với tài khoản admin');
    console.log('  3. Truy cập /admin');
    console.log('  4. Kiểm tra console logs');
    console.log('🔍 Common issues:');
    console.log('  - Session không được lưu đúng cách');
    console.log('  - id_vaitro không khớp với giá trị mong đợi');
    console.log('  - Route bị chặn bởi middleware khác');
    console.log('🔍 Debug info:');
    console.log('  - requireAuth middleware đã được áp dụng');
    console.log('  - Admin routes được mount trước index route');
    console.log('  - Session được kiểm tra cho tất cả protected routes');
    console.log('🔍 Ready to test! 🚀');
    console.log('🔍 If still having issues:');
    console.log('  - Check database for user.id_vaitro value');
    console.log('  - Verify session is being saved correctly');
    console.log('  - Check if any other middleware is interfering');
    console.log('🔍 Final check:');
    console.log('  - All routes are properly mounted');
    console.log('  - Middleware order is correct');
    console.log('  - Debug logging is enabled');
    console.log('  - Ready for testing! 🎯');
    console.log('🔍 Test sequence:');
    console.log('  1. Start server');
    console.log('  2. Login with admin account');
    console.log('  3. Navigate to /admin');
    console.log('  4. Check console logs');
    console.log('  5. Verify admin.ejs renders');
    console.log('  6. Test other admin routes');
});