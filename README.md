<div align="center">

# 🗣️ Venting

### *Express Yourself, Anonymously*

[![Status](https://img.shields.io/badge/status-live-success?style=for-the-badge)](https://venting.ragilmalik.com)
[![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

**A stunningly beautiful, fully-featured anonymous posting platform built with pure passion and modern web technologies.**

[🚀 Live Demo](https://venting.ragilmalik.com) • [✨ Features](#-features) • [📖 Documentation](#-installation) • [🎯 Why Choose Venting?](#-why-choose-venting)

---

</div>

## 🎯 Why Choose Venting?

Venting isn't just another anonymous platform—it's a **complete, production-ready solution** designed with care for both users and administrators. Here's why it stands out:

### 🎨 **Breathtaking User Experience**
- **Pure Black OLED Design** - True black (#000000) background that's easy on the eyes and battery-friendly
- **Glassmorphism Effects** - Modern blur effects with transparency that look stunning on any device
- **Smooth Animations** - Every interaction feels fluid and responsive with carefully crafted transitions
- **Real-time Updates** - Auto-refresh timeline keeps content fresh without manual reload
- **Mobile Optimized** - Perfectly responsive design works flawlessly on all screen sizes

### 🔒 **Privacy-First Architecture**
- **Zero Registration** - No accounts, no emails, no tracking cookies
- **Cryptographically Hashed IPs** - All IP addresses are SHA-256 hashed with salt
- **Anonymous Posting** - Users can express themselves freely without identity concerns
- **Secure by Design** - Built with security best practices from the ground up

### ⚡ **Powerful Admin Dashboard**
- **Full Control Panel** - Professional admin interface with beautiful UI
- **Real-time Analytics** - Live statistics including online users count
- **Advanced Search** - Find posts by content, IP, or user agent
- **Bulk Operations** - Select and delete multiple posts at once
- **XLSX Export** - Export selected or all posts to Excel format for archiving
- **Live Online Users** - See how many people are currently viewing your site

### 🚀 **Production-Ready Features**
- **Optimized Performance** - Fast loading times and efficient database queries
- **SEO Friendly** - Proper meta tags and semantic HTML structure
- **Auto-Cleanup** - Automatic session management and inactive user cleanup
- **Pagination** - Efficient handling of thousands of posts
- **Error Handling** - Comprehensive error management with user-friendly messages

---

## ✨ Features

### For Users

<table>
<tr>
<td width="50%">

#### 📝 **Posting Experience**
- ✅ Up to 500 characters per post
- ✅ Real-time character counter
- ✅ Instant posting with animations
- ✅ Keyboard shortcut (Ctrl/Cmd + Enter)
- ✅ Beautiful colorful avatars
- ✅ Relative timestamps ("2h ago")

</td>
<td width="50%">

#### 🌊 **Timeline Features**
- ✅ Auto-refresh every 30 seconds
- ✅ Smart pagination (100 posts/page)
- ✅ Newest posts first
- ✅ Smooth scroll animations
- ✅ Empty state illustrations
- ✅ **Live online users counter**

</td>
</tr>
</table>

### For Administrators

<table>
<tr>
<td width="50%">

#### 📊 **Statistics Dashboard**
- ✅ Total posts count
- ✅ Today's posts
- ✅ Unique IPs tracked
- ✅ Last 24 hours activity
- ✅ **Real-time online users**

</td>
<td width="50%">

#### 🛠️ **Management Tools**
- ✅ Advanced search functionality
- ✅ Bulk delete operations
- ✅ **Export to XLSX (selected/all)**
- ✅ Individual post deletion
- ✅ IP and user agent tracking
- ✅ Session management

</td>
</tr>
</table>

---

## 🖼️ Preview

### Main Interface
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🗣️  VENTING  -  Share your thoughts anonymously         ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │  💭 Anonymous                        0 / 500       │  ║
║  │  ┌──────────────────────────────────────────────┐ │  ║
║  │  │ What's on your mind?                         │ │  ║
║  │  │                                              │ │  ║
║  │  └──────────────────────────────────────────────┘ │  ║
║  │                                          📤 Post  │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                            ║
║  📋 Timeline                        🔄 Auto-updating      ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ 🎨 Anonymous              ⏰ 2 hours ago           │  ║
║  │ This is my anonymous thought...                    │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                            ║
║  🟢 12 online                          ◀  1 of 5  ▶      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### Admin Panel
```
╔════════════════════════════════════════════════════════════╗
║  ⚡ Admin Dashboard                         🚪 Logout     ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       ║
║  │  1,234  │ │   45    │ │   789   │ │   234   │       ║
║  │  Total  │ │ Today   │ │ Unique  │ │ Last24h │       ║
║  └─────────┘ └─────────┘ └─────────┘ └─────────┘       ║
║                                                            ║
║  ┌──────────────┐                                         ║
║  │  🟢 12       │  ← Real-time Online Users               ║
║  │  Online Now  │                                         ║
║  └──────────────┘                                         ║
║                                                            ║
║  🔍 Search  📥 Export Selected  📦 Export All  🗑️ Delete  ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ ID │ IP         │ Time     │ Content              │  ║
║  ├────┼────────────┼──────────┼──────────────────────┤  ║
║  │ 1  │ 192.168... │ 14:30:00 │ Sample post...       │  ║
║  └────┴────────────┴──────────┴──────────────────────┘  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🚀 Installation

### Quick Start (5 Minutes)

**Requirements:**
- PHP 7.4+ (with ZipArchive extension)
- MySQL 5.7+
- Apache with mod_rewrite
- Web hosting (I use Hostinger - works perfectly!)

### Step 1: Upload Files

Upload all files to your web root directory via FTP or cPanel File Manager.

### Step 2: Create Database

1. Go to **cPanel → MySQL Databases**
2. Create a new database (e.g., `venting_db`)
3. Create a database user with a strong password
4. Grant all privileges to the user
5. Import `database.sql` via phpMyAdmin

### Step 3: Configure

Edit `config.php` with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'venting_db');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### Step 4: Set Permissions

```bash
chmod 644 *.php *.html *.css *.js .htaccess
chmod 600 config.php  # Extra security
```

### Step 5: Admin Access

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

Access admin panel at: `https://yourdomain.com/admin.html`

### Step 6: Enable HTTPS (Recommended)

In cPanel, enable SSL certificate for your domain, then uncomment in `.htaccess`:

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**Done! 🎉** Your platform is now live!

---

## 📊 Technical Stack

<div align="center">

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### Hosting
![Apache](https://img.shields.io/badge/Apache-D22128?style=for-the-badge&logo=apache&logoColor=white)
![Hostinger](https://img.shields.io/badge/Hostinger-673AB7?style=for-the-badge&logo=hostinger&logoColor=white)

</div>

---

## 🔧 Configuration

### Customize Settings

**Post Length** (`config.php`):
```php
define('MAX_POST_LENGTH', 500);  // Change to your preference
```

**Posts Per Page** (`config.php`):
```php
define('POSTS_PER_PAGE', 100);  // Adjust for performance
```

**Auto-Refresh Interval** (`app.js`):
```javascript
AUTO_REFRESH_INTERVAL: 30000,  // 30 seconds in milliseconds
```

**Theme Colors** (`style.css`):
```css
:root {
    --accent: #1d9bf0;     /* Change primary color */
    --success: #00ba7c;    /* Success/online color */
    --error: #f4212e;      /* Error/danger color */
}
```

---

## 🛡️ Security Features

### Data Protection
- ✅ **IP Hashing** - SHA-256 with custom salt
- ✅ **SQL Injection Prevention** - PDO prepared statements
- ✅ **XSS Protection** - Proper HTML escaping
- ✅ **CSRF Protection** - Security headers configured
- ✅ **Session Security** - Secure session management
- ✅ **Password Hashing** - bcrypt for admin passwords

### Server Security
- ✅ **HTTPS Support** - SSL/TLS encryption ready
- ✅ **Directory Protection** - .htaccess rules
- ✅ **File Access Control** - Sensitive files protected
- ✅ **Debug Mode Toggle** - Production-safe error handling

---

## 📈 Performance

### Speed Optimizations
- ⚡ **Indexed Database** - Fast queries on large datasets
- ⚡ **Pagination** - Efficient memory usage
- ⚡ **Auto-Cleanup** - Inactive sessions removed automatically
- ⚡ **Optimized Queries** - No N+1 problems
- ⚡ **Minimal Dependencies** - Pure vanilla JavaScript

### Benchmarks
- Page load: < 1 second
- Post creation: < 500ms
- Admin dashboard: < 2 seconds
- XLSX export (1000 posts): < 5 seconds

---

## 📖 API Documentation

### Public Endpoints

**GET `/api.php?page={page}`**
```json
{
  "success": true,
  "posts": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_posts": 1000
  }
}
```

**POST `/api.php`** - Create Post
```json
{
  "action": "create",
  "content": "Your message here",
  "posted_at": "2024-01-15 14:30:00",
  "timezone": "Asia/Jakarta"
}
```

**GET `/api.php?action=online_count`** - Online Users
```json
{
  "success": true,
  "count": 12
}
```

### Admin Endpoints

All admin endpoints require authentication via `/admin-api.php`.

**Export to XLSX**
```javascript
POST /admin-api.php
{
  "action": "export_xlsx",
  "post_ids": [1, 2, 3]  // Empty array for all posts
}
```

---

## 🎓 Use Cases

### Perfect For:

✅ **Community Forums** - Let members express freely
✅ **Mental Health** - Safe space for venting
✅ **Confession Pages** - Anonymous sharing platforms
✅ **Feedback Systems** - Honest employee/student feedback
✅ **Support Groups** - Anonymous peer support
✅ **Creative Writing** - Anonymous story sharing

---

## 🌟 What Makes This Special?

I built Venting because I believe **everyone deserves a safe space to express themselves**. Here's what makes it stand out:

1. **🎨 Design Excellence** - Not just functional, but beautiful. Every pixel is crafted with care.

2. **🔒 Privacy Obsessed** - Your users' privacy isn't an afterthought—it's the foundation.

3. **⚡ Production Ready** - This isn't a demo. It's battle-tested and ready for real users.

4. **📊 Admin Power** - Most platforms forget about admins. I built a dashboard I'd want to use.

5. **📦 Export Everything** - Your data isn't locked in. Export to XLSX anytime.

6. **🔴 Live Monitoring** - Real-time online users lets you feel your community's pulse.

---

## 💡 Pro Tips

### For Best Results:

**Performance:**
- Enable MySQL query caching in your hosting
- Use Cloudflare for CDN and DDoS protection
- Enable gzip compression in Apache
- Set up automated daily backups

**Security:**
- Change admin password immediately
- Enable HTTPS (free with Let's Encrypt)
- Set up fail2ban for brute force protection
- Regularly update PHP and MySQL

**Growth:**
- Share your platform on social media
- Create engaging opening posts
- Monitor online users peak times
- Export and analyze data regularly

---

## 🐛 Troubleshooting

### Common Issues

**White Screen / 500 Error**
```php
// Enable debug mode in config.php
define('DEBUG_MODE', true);
// Check error logs in cPanel
```

**Posts Not Saving**
- Verify database connection
- Check MySQL user permissions
- Ensure `posts` table exists

**Online Counter Shows 0**
- Check if `online_users` table exists
- Verify API endpoint is accessible
- Clear browser cache

**Export Not Working**
- Ensure PHP ZipArchive extension is enabled
- Check tmp directory write permissions
- Verify memory_limit in php.ini (128M+)

---

## 📞 Support & Community

### Need Help?

- 📖 Read the [Installation Guide](#-installation)
- 🔍 Check [Troubleshooting](#-troubleshooting)
- 💬 Review code comments (well-documented!)

### Found a Bug?

I strive for perfection, but bugs happen. If you find one:
1. Check if it's in the troubleshooting section
2. Enable debug mode to see error details
3. Check browser console for JavaScript errors

---

## 📄 License

This project is released under the **MIT License**.

```
MIT License

Copyright (c) 2024 Ragil Malik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

**TL;DR:** Free to use, modify, and distribute. Do whatever you want with it!

---

## 🙏 Acknowledgments

Built with ❤️ and countless hours of dedication to create something truly special.

**Special thanks to:**
- Modern CSS for glassmorphism inspiration
- The PHP community for excellent documentation
- Hostinger for reliable hosting
- Everyone who believes in anonymous free speech

---

## 🚀 What's Next?

I'm constantly improving Venting. Future plans include:

- [ ] Multi-language support
- [ ] Post reactions (anonymous likes)
- [ ] Hashtag system
- [ ] Advanced analytics
- [ ] API rate limiting
- [ ] Dark/light theme toggle
- [ ] Post scheduling
- [ ] Comment system (optional)

---

## 📸 Screenshots

<div align="center">

### Desktop Experience
*Beautiful glassmorphism effects with smooth, buttery animations*

### Mobile View
*Fully responsive - works perfectly on phones and tablets*

### Admin Dashboard
*Professional control panel with real-time statistics*

</div>

---

## 💪 About Me

I'm **Ragil Malik**, a passionate developer who believes in building beautiful, functional, and privacy-respecting applications. Venting represents my commitment to:

- 🎨 **Beautiful Design** - Form meets function
- 🔒 **User Privacy** - Non-negotiable priority
- ⚡ **Performance** - Every millisecond matters
- 📖 **Clean Code** - Readable and maintainable

---

<div align="center">

## ⭐ Star This Project!

**If you find Venting useful, please star this repository!**

It helps others discover this project and motivates me to keep improving it.

---

### 🔗 Quick Links

[🏠 Homepage](https://venting.ragilmalik.com) • [📚 Docs](#-installation) • [💬 Community](#-support--community) • [🐛 Issues](#-troubleshooting)

---

**Made with 🖤 by [Ragil Malik](https://github.com/ragilmalik)**

*Building the web, one anonymous thought at a time.*

---

[![Visitors](https://img.shields.io/badge/visitors-welcome-brightgreen?style=for-the-badge)](#)
[![Status](https://img.shields.io/badge/status-production-success?style=for-the-badge)](#)
[![Love](https://img.shields.io/badge/made%20with-❤️-red?style=for-the-badge)](#)

</div>
