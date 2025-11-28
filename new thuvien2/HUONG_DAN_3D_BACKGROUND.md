# 🎨 Hướng Dẫn Sử Dụng 3D Animated Background

## 📦 Tính năng
- Gradient background động với 4 màu
- Particles bay lơ lửng 3D
- Geometric shapes xoay
- Glass morphism effect cho các card
- Hoàn toàn responsive

## 🚀 Cách áp dụng cho trang khác

### BƯỚC 1: Copy CSS vào thẻ `<style>` (trong `<head>`)

Tìm phần này trong file `views/shop.ejs`:

```css
/* =========================
   🎨 3D ANIMATED BACKGROUND
   Copy từ đây...
   ========================= */
body {
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

/* ... tất cả CSS giữa 2 dòng comment ... */

/* =========================
   ... đến đây để copy sang trang khác
   ========================= */
```

**📋 Copy toàn bộ CSS này vào trang mới** (trong thẻ `<style>`)

---

### BƯỚC 2: Copy HTML vào `<body>` (ngay sau thẻ mở `<body>`)

```html
<!-- =========================
     🎨 3D ANIMATED BACKGROUND HTML
     Copy từ đây...
     ========================= -->
<!-- Floating particles background -->
<div class="particles-bg" id="particles-container"></div>

<!-- Content wrapper -->
<div class="content-wrapper">
<!-- ... đến đây (nhớ đóng </div> ở cuối body) -->
```

**📋 Copy 3 dòng này ngay sau `<body>`**

---

### BƯỚC 3: Đóng `</div>` trước thẻ `</body>`

Tìm đến **TRƯỚC** thẻ đóng `</body>`, thêm:

```html
</div>
<!-- End content wrapper -->
```

---

### BƯỚC 4: Copy JavaScript vào trước `</body>`

```javascript
<!-- =========================
     🎨 3D ANIMATED BACKGROUND JAVASCRIPT
     Copy từ đây...
     ========================= -->
<script>
  // Tạo particles động
  function createParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 30; // Số lượng particles
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random size (20px - 150px)
      const size = Math.random() * 130 + 20;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      // Random position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Random animation delay
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
      
      container.appendChild(particle);
    }
    
    // Tạo geometric shapes
    for (let i = 0; i < 5; i++) {
      const shape = document.createElement('div');
      shape.className = 'geo-shape';
      
      const size = Math.random() * 200 + 100;
      shape.style.width = size + 'px';
      shape.style.height = size + 'px';
      shape.style.left = Math.random() * 100 + '%';
      shape.style.top = Math.random() * 100 + '%';
      shape.style.borderRadius = Math.random() > 0.5 ? '50%' : '10px';
      shape.style.animationDelay = Math.random() * 5 + 's';
      
      container.appendChild(shape);
    }
  }
  
  // Khởi tạo particles khi trang load
  document.addEventListener('DOMContentLoaded', createParticles);
</script>
<!-- ... đến đây để copy JavaScript -->
```

**📋 Copy toàn bộ JavaScript này trước `</body>`**

---

## 🎨 Tùy chỉnh màu sắc

Thay đổi dòng này trong CSS để đổi màu gradient:

```css
background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe);
```

**Gợi ý màu đẹp:**
- Tím/Xanh: `#667eea, #764ba2, #f093fb, #4facfe` (mặc định)
- Cam/Đỏ: `#ff6b6b, #ee5a6f, #f7b731, #fc5c65`
- Xanh lá: `#38ef7d, #11998e, #06beb6, #48dbfb`
- Vàng/Cam: `#f2994a, #f2c94c, #ff6348, #ff9ff3`

---

## ⚙️ Tùy chỉnh hiệu ứng

### Thay đổi số lượng particles:
```javascript
const particleCount = 30; // Tăng/giảm số này (10-50)
```

### Thay đổi tốc độ gradient:
```css
animation: gradientShift 15s ease infinite; /* Giảm số = nhanh hơn */
```

### Thay đổi kích thước particles:
```javascript
const size = Math.random() * 130 + 20; // (min 20px, max 150px)
```

---

## 📁 Các trang đã áp dụng:
- ✅ `views/shop.ejs` - Cửa hàng sách

## 🔧 Troubleshooting

### Vấn đề: Nội dung bị che bởi particles
**Giải pháp:** Đảm bảo đã wrap nội dung trong `<div class="content-wrapper">`

### Vấn đề: Background không động
**Giải pháp:** Kiểm tra đã copy đầy đủ CSS và JavaScript

### Vấn đề: Lag/giật
**Giải pháp:** Giảm `particleCount` xuống 15-20

---

## 📸 Preview
- Gradient background: Tự động chuyển màu
- Particles: Bay lơ lửng 3D
- Cards: Glass morphism effect (trong suốt, blur)
- Hover: Scale + shadow effect

---

**✨ Enjoy your beautiful 3D background!**

