# 🗣️ Venting - Anonymous Thoughts Platform

<div align="center">

![Venting Banner](https://img.shields.io/badge/Venting-Anonymous%20Platform-1d9bf0?style=for-the-badge)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4?style=for-the-badge&logo=php)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

**A beautiful, anonymous Twitter-like platform where users can share their thoughts freely without accounts or sign-ups.**

[Features](#features) • [Installation](#installation) • [Configuration](#configuration) • [Usage](#usage) • [Tech Stack](#tech-stack)

</div>

---

## ✨ Features

### 🎨 **Stunning Dark Theme**
- **Pure Black (#000000)** background for true OLED-friendly design
- **Glassmorphism effects** with backdrop blur and transparency
- **Smooth animations** and transitions for delightful user experience
- **Gradient accents** with subtle animated background effects

### 🔒 **Complete Privacy**
- ✅ **No user accounts** - No sign-up, no login, no tracking
- ✅ **100% Anonymous** - No personally identifiable information stored
- ✅ **IP Privacy** - IP addresses are hashed with salt for security
- ✅ **Browser Privacy** - User agent information is hashed

### 📝 **Powerful Posting**
- ✅ **Extended character limit** - Up to 5,000 characters per post
- ✅ **Real-time character counter** with visual feedback
- ✅ **Instant posting** with smooth animations
- ✅ **Keyboard shortcut** - Ctrl/Cmd + Enter to post

### 📱 **Dynamic Timeline**
- ✅ **Auto-refresh** - Timeline updates every 30 seconds automatically
- ✅ **Smart pagination** - 100 posts per page for optimal performance
- ✅ **Newest first** - Posts sorted from newest to oldest
- ✅ **Relative timestamps** - "2 hours ago" style time display
- ✅ **Colorful avatars** - Unique gradient avatars for each post

### 🚀 **Performance & Compatibility**
- ✅ **Optimized for Hostinger** shared hosting
- ✅ **Lightweight** - Fast loading times
- ✅ **Responsive design** - Works on all devices
- ✅ **Cross-browser compatible** - Modern browsers supported
- ✅ **SEO friendly** - Proper meta tags and semantic HTML

---

## 🖼️ Preview

### Desktop View
```
┌─────────────────────────────────────────────────┐
│  🗣️ Venting                                     │
│  Share your thoughts anonymously                │
├─────────────────────────────────────────────────┤
│  What's on your mind?                 0 / 5000  │
│  ┌───────────────────────────────────────────┐ │
│  │ Type your thoughts here...                │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│  🛈 Your post is anonymous           📤 Post   │
├─────────────────────────────────────────────────┤
│  Timeline                      🔄 Auto-updating │
│  ┌───────────────────────────────────────────┐ │
│  │ 👤 Anonymous        2 hours ago           │ │
│  │ This is my anonymous thought...           │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- **Web Server**: Apache with mod_rewrite enabled
- **PHP**: Version 7.4 or higher
- **MySQL**: Version 5.7 or higher
- **Hosting**: Hostinger shared hosting (or similar)

### Step 1: Upload Files

Upload all files to your Hostinger web hosting via FTP or File Manager:

```
venting/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── app.js              # JavaScript application
├── api.php             # API endpoint
├── config.php          # Configuration file
├── database.sql        # Database schema
├── .htaccess          # Apache configuration
└── README.md          # This file
```

### Step 2: Create Database

1. **Log in to Hostinger cPanel**
2. **Go to MySQL Databases**
3. **Create a new database** (e.g., `venting_db`)
4. **Create a database user** with a strong password
5. **Add user to database** with all privileges
6. **Import `database.sql`** via phpMyAdmin

### Step 3: Configure Database Connection

Edit `config.php` and update with your database credentials:

```php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'venting_db');          // Your database name
define('DB_USER', 'your_username');        // Your database username
define('DB_PASS', 'your_password');        // Your database password
```

### Step 4: Set Permissions

Ensure proper file permissions:

```bash
chmod 644 *.php
chmod 644 *.html
chmod 644 *.css
chmod 644 *.js
chmod 644 .htaccess
chmod 600 config.php  # Extra security for config
```

### Step 5: Enable HTTPS (Recommended)

1. In Hostinger, enable **SSL certificate** for your domain
2. Uncomment HTTPS redirect in `.htaccess`:

```apache
# Uncomment these lines:
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Step 6: Test Your Installation

1. Visit `https://venting.ragilmalik.com`
2. Try posting an anonymous thought
3. Check if the timeline loads properly
4. Verify auto-refresh is working

---

## ⚙️ Configuration

### Basic Settings

Edit `config.php` to customize:

```php
// Maximum characters per post
define('MAX_POST_LENGTH', 5000);

// Posts displayed per page
define('POSTS_PER_PAGE', 100);

// Debug mode (set to false in production)
define('DEBUG_MODE', false);
```

### Auto-Refresh Interval

Edit `app.js` to change auto-refresh timing:

```javascript
const CONFIG = {
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds (in milliseconds)
    // ...
};
```

### Styling Customization

Edit CSS variables in `style.css`:

```css
:root {
    --color-bg: #000000;              /* Background color */
    --color-primary: #1d9bf0;         /* Primary accent color */
    --glass-bg: rgba(255, 255, 255, 0.05);  /* Glass effect */
    /* ... */
}
```

---

## 📖 Usage

### For Users

1. **Visit the website** - No account needed!
2. **Type your thoughts** in the text area (up to 5,000 characters)
3. **Click "Post"** or press `Ctrl/Cmd + Enter`
4. **Your post appears** in the timeline instantly
5. **Browse posts** using pagination
6. **Timeline auto-updates** every 30 seconds

### For Administrators

#### View Database Statistics

Connect to MySQL and run:

```sql
-- Total posts
SELECT COUNT(*) as total_posts FROM posts;

-- Posts today
SELECT COUNT(*) as posts_today
FROM posts
WHERE DATE(created_at) = CURDATE();

-- Most active hours
SELECT HOUR(posted_at) as hour, COUNT(*) as count
FROM posts
GROUP BY HOUR(posted_at)
ORDER BY count DESC;
```

#### Clean Old Posts (Optional)

To keep database lean, you can periodically delete old posts:

```sql
-- Delete posts older than 6 months
DELETE FROM posts
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

#### Backup Database

Regular backups via cPanel phpMyAdmin:
1. Select your database
2. Click "Export"
3. Choose "Quick" method
4. Download SQL file

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with glassmorphism
- **Vanilla JavaScript** - No frameworks, pure performance

### Backend
- **PHP 7.4+** - Server-side logic
- **MySQL 5.7+** - Data persistence
- **PDO** - Secure database access

### Security
- **Prepared Statements** - SQL injection prevention
- **XSS Protection** - HTML escaping
- **CSRF Protection** - Secure headers
- **IP Hashing** - Privacy protection
- **Rate Limiting Ready** - Easy to implement

### Hosting
- **Apache** - Web server
- **mod_rewrite** - Clean URLs
- **SSL/TLS** - HTTPS encryption

---

## 🔒 Security Features

### Data Privacy
- IP addresses are **hashed with salt** (SHA-256)
- User agents are **hashed** (SHA-256)
- No cookies or tracking mechanisms
- No personal data collection

### Application Security
- SQL injection prevention via **PDO prepared statements**
- XSS prevention via **HTML escaping**
- CSRF protection via **security headers**
- File access protection via **.htaccess**
- Input validation and sanitization

### Server Security
- **HTTPS enforced** (when enabled)
- **Security headers** configured
- **Directory browsing disabled**
- **Sensitive files protected**

---

## 📊 Database Schema

```sql
posts
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── content (TEXT, NOT NULL)
├── ip_hash (VARCHAR(64), NOT NULL)
├── user_agent_hash (VARCHAR(64), NOT NULL)
├── posted_at (DATETIME, NOT NULL)
├── browser_timezone (VARCHAR(100), NULLABLE)
└── created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

**Indexes:**
- `idx_created_at` - Fast sorting by creation time
- `idx_posted_at` - Fast sorting by post time

---

## 🌐 API Endpoints

### GET `/api.php?page={page}`

**Description:** Retrieve posts with pagination

**Parameters:**
- `page` (optional) - Page number (default: 1)

**Response:**
```json
{
    "success": true,
    "posts": [...],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_posts": 450,
        "posts_per_page": 100
    }
}
```

### POST `/api.php`

**Action: create**

**Description:** Create a new post

**Body:**
```json
{
    "action": "create",
    "content": "Your anonymous thought...",
    "posted_at": "2024-01-15 14:30:00",
    "timezone": "America/New_York"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Post created successfully",
    "post_id": 123
}
```

**Action: latest**

**Description:** Get posts since a timestamp (for auto-refresh)

**Body:**
```json
{
    "action": "latest",
    "since": "2024-01-15 14:30:00"
}
```

**Response:**
```json
{
    "success": true,
    "posts": [...],
    "count": 3
}
```

---

## 🐛 Troubleshooting

### Issue: White screen / 500 error

**Solution:**
1. Check PHP error logs in cPanel
2. Verify database credentials in `config.php`
3. Ensure all files have proper permissions
4. Enable `DEBUG_MODE` temporarily to see errors

### Issue: Posts not saving

**Solution:**
1. Verify database connection
2. Check if table `posts` exists
3. Ensure database user has INSERT permissions
4. Check browser console for JavaScript errors

### Issue: Timeline not loading

**Solution:**
1. Check if `api.php` is accessible
2. Verify database has posts
3. Check browser console for fetch errors
4. Ensure mod_rewrite is enabled

### Issue: Auto-refresh not working

**Solution:**
1. Check browser console for errors
2. Ensure you're on page 1
3. Verify JavaScript is enabled
4. Check if tab is active (auto-refresh pauses on hidden tabs)

---

## 🚀 Performance Tips

### Database Optimization

```sql
-- Add indexes if not present
ALTER TABLE posts ADD INDEX idx_created_at (created_at DESC);

-- Optimize table periodically
OPTIMIZE TABLE posts;
```

### Caching (Advanced)

Add to `.htaccess` for static file caching:

```apache
<IfModule mod_headers.c>
    <FilesMatch "\.(css|js)$">
        Header set Cache-Control "max-age=2592000, public"
    </FilesMatch>
</IfModule>
```

### CDN Integration (Optional)

Consider using a CDN for static assets:
- Cloudflare (free tier available)
- jsDelivr for libraries
- Font CDNs for web fonts

---

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |
| Opera   | 76+     |

**Note:** Modern browsers with ES6+ support required.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 Venting Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🤝 Contributing

While this is a simple project, improvements are welcome!

### Ideas for contributions:
- Rate limiting implementation
- Moderation tools
- Post reporting system
- More theme options
- Mobile app version
- API enhancements

---

## 🌟 Roadmap

- [ ] Admin panel for moderation
- [ ] Post reactions/likes (anonymous)
- [ ] Hashtag support
- [ ] Search functionality
- [ ] Export data feature
- [ ] Dark/Light theme toggle
- [ ] Multiple language support

---

## 📞 Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review Hostinger documentation
- Check browser console for errors

---

## 🎉 Acknowledgments

Built with ❤️ for anonymous expression and free speech.

**Special thanks to:**
- The open-source community
- Modern CSS for glassmorphism effects
- Hostinger for reliable shared hosting

---

## 📸 Screenshots

### Desktop Experience
Beautiful glassmorphism effects with smooth animations

### Mobile Experience
Fully responsive design works perfectly on all devices

### Timeline View
Clean, modern feed with colorful avatars and relative timestamps

---

<div align="center">

**⭐ If you find this project useful, please star it! ⭐**

Made with 🖤 by developers who value privacy

[⬆ Back to Top](#-venting---anonymous-thoughts-platform)

</div>
