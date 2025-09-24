# 🏥 Tadawi - تَداوي

<div align="center">

![Tadawi Logo](public/logo.png)

**Healing connections are closer**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A//tadawi.vercel.app/-blue?style=for-the-badge&logo=vercel)](https://tadawi.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Laravel%20Cloud-green?style=for-the-badge&logo=laravel)](https://tadawi-app-deploy-main-zwrtj5.laravel.cloud/)
[![Frontend Repo](https://img.shields.io/badge/Frontend%20Repo-GitHub-black?style=for-the-badge&logo=github)](https://github.com/mostafaomar7/Tadawi)
[![Backend Repo](https://img.shields.io/badge/Backend%20Repo-GitHub-black?style=for-the-badge&logo=github)](https://github.com/KareemA-Saad/tadawi-app)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🚀 Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📦 Installation & Setup](#-installation--setup)
- [🌐 Live Demo](#-live-demo)
- [📚 API Documentation](#-api-documentation)
- [🏗️ Project Structure](#️-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Support](#-support)

---

## 🎯 Overview

**Tadawi** is a comprehensive healthcare platform that connects patients, pharmacies, and doctors for seamless medicine management and ordering. Built to address Egypt's medicine shortages and improve healthcare accessibility, Tadawi provides real-time medicine availability, smart alternatives, and digital prescription management.

### 🎯 Problem Statement

Egypt faces **structural and recurrent medicine shortages**, especially during economic and logistics challenges. Patients and pharmacies struggle with:
- Repeated stockouts of chronic and life-saving therapies
- Lack of real-time nationwide medicine visibility
- Absence of safe, pharmacist-validated alternatives
- Fragmented and mobile-only existing solutions

### 💡 Our Solution

Tadawi provides a **web-based multi-stakeholder platform** that:
- ✅ Connects patients to pharmacies nationwide
- ✅ Offers AI-powered medicine alternatives
- ✅ Provides digital prescription management with OCR
- ✅ Enables medicine donation and sharing
- ✅ Delivers real-time stock visibility

---

## 🚀 Features

### 👤 **Patient Features**
- **🔐 Authentication & Profile Management**
  - Secure registration and login
  - Google OAuth integration
  - Profile customization and medical history

- **🔍 Medicine Search & Discovery**
  - Advanced medicine search with filters
  - AI-powered alternative suggestions
  - Medicine availability notifications
  - Wishlist and favorites management

- **📄 Digital Prescription Management**
  - OCR-powered prescription scanning
  - Digital prescription upload and storage
  - Prescription history tracking

- **💊 Medicine Donation System**
  - Donate surplus medicines
  - Track donation history
  - Connect with needy patients

- **🌍 Travel Mode**
  - Check medicine availability across regions
  - Cross-border medicine support

### 🏥 **Pharmacy Features**
- **📊 Pharmacy Dashboard**
  - Real-time analytics and insights
  - Order management system
  - Stock level monitoring
  - Revenue tracking

- **📦 Stock Management**
  - Manual stock updates
  - Bulk JSON uploads
  - Expiry date tracking
  - Low stock alerts

- **📍 Location Services**
  - Google Maps integration
  - Location-based search
  - Delivery radius management

- **📋 Order Processing**
  - Order fulfillment workflow
  - Delivery management
  - Customer communication

### 👨‍⚕️ **Doctor Features**
- **👤 Professional Profiles**
  - Doctor registration and verification
  - Clinic information management
  - Specialization tracking

- **📝 Prescription Management**
  - Digital prescription creation
  - Patient prescription history
  - Alternative treatment suggestions

### 👨‍💼 **Admin Features**
- **📊 Comprehensive Dashboard**
  - User management (Patients, Doctors, Pharmacies)
  - Medicine database management
  - Order monitoring and analytics
  - System-wide insights

- **🔧 System Management**
  - Soft delete and data restoration
- Analytics for shortages and usage patterns  
  - Content moderation tools

### 🤖 **AI & Smart Systems**
- **🔍 Intelligent Medicine Search**
- AI-based alternative suggestions  
  - Medicine name correction
  - Smart search with autocomplete

- **⚠️ Drug Interaction Detection**
  - Real-time conflict checking
  - Safety warnings and alerts
  - Interaction severity assessment

- **📄 OCR Prescription Reader**
  - Handwriting recognition
  - Prescription data extraction
  - Digital prescription conversion

---

## 🛠️ Technology Stack

### **Frontend Technologies**
- **⚛️ React 19.1.1** - Modern UI framework
- **🎨 Tailwind CSS 3.4.17** - Utility-first CSS framework
- **📊 ApexCharts 5.3.5** - Interactive charts and graphs
- **🎭 Framer Motion 12.23.13** - Animation library
- **🔄 React Router DOM 7.8.2** - Client-side routing
- **📡 Axios 1.12.2** - HTTP client
- **🎨 React Bootstrap 2.10.10** - UI components

### **Backend Technologies**
- **🐘 Laravel 12.x** - PHP framework
- **🔐 Laravel Sanctum** - API authentication
- **🌐 Laravel Socialite** - OAuth integration
- **💳 PayPal SDK** - Payment processing
- **🌍 Guzzle HTTP** - HTTP client

### **Database & Storage**
- **🗄️ MySQL 8.0+** - Primary database
- **🔍 Eloquent ORM** - Database abstraction
- **📁 Laravel Storage** - File management

### **External Services**
- **🔍 Google OAuth** - Social authentication
- **🗺️ Google Maps API** - Location services
- **💊 RxNav API** - Drug database
- **💳 PayPal API** - Payment gateway
- **👁️ OCR Services** - Prescription scanning

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- PHP 8.1+ and Composer
- MySQL 8.0+
- Git

### **Frontend Setup**

1. **Clone the repository**
```bash
git clone https://github.com/mostafaomar7/Tadawi.git
cd Tadawi
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment configuration**
```bash
# Create environment file
cp .env.example .env

# Configure your environment variables
# Add your API endpoints and keys
```

4. **Start development server**
```bash
npm start
```

The application will be available at `http://localhost:3000`

### **Backend Setup**

1. **Clone the backend repository**
```bash
git clone https://github.com/KareemA-Saad/tadawi-app.git
cd tadawi-app
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Database configuration**
```bash
# Update .env with your database credentials
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tadawi
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

5. **Run migrations and seeders**
```bash
php artisan migrate:fresh --seed
```

6. **Start Laravel server**
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### **Production Deployment**

#### **Frontend (Vercel)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### **Backend (Laravel Cloud)**
```bash
# Configure your production environment
# Update .env with production database and API keys
# Deploy using Laravel Cloud or your preferred hosting
```

---

## 🌐 Live Demo

### **🔗 Production URLs**
- **🎨 Frontend App**: [https://tadawi.vercel.app/](https://tadawi.vercel.app/)
- **🔧 Backend API**: [https://tadawi-app-deploy-main-zwrtj5.laravel.cloud/](https://tadawi-app-deploy-main-zwrtj5.laravel.cloud/)

### **🧪 Demo Credentials**
```
Email: cairo.central@tadawi.com
Password: password
```

### **✨ Available Features in Demo**
- ✅ User Registration & Authentication
- ✅ Medicine Search & Discovery
- ✅ Pharmacy Management
- ✅ Order Processing
- ✅ Donation System
- ✅ Drug Interaction Checking
- ✅ Admin Dashboard
- ✅ Responsive Frontend Interface

---

## 📚 API Documentation

### **Base URLs**
```
Backend API: https://tadawi-app-deploy-main-zwrtj5.laravel.cloud/api/v1
Frontend App: https://tadawi.vercel.app/
```

### **Authentication Endpoints**
```
POST /auth/register              # User registration
POST /auth/login                 # User login
POST /auth/logout                # User logout
GET  /auth/me                    # Get current user
POST /auth/verify-otp            # Verify OTP
POST /auth/resend-otp            # Resend OTP
POST /auth/send-password-reset-otp # Send password reset OTP
POST /auth/reset-password        # Reset password
GET  /auth/google/redirect       # Google OAuth redirect
GET  /auth/google/callback       # Google OAuth callback
POST /auth/update-role           # Update user role
```

### **Medicine Endpoints**
```
GET  /medicines/search           # Search medicines
GET  /medicines                  # Get all medicines
POST /search/with-alternatives  # Search with alternatives
POST /medicine-correction/correct # Correct medicine name
GET  /medicine-correction/autocomplete # Medicine autocomplete
```

### **Pharmacy Endpoints**
```
GET  /pharmacies                # Get all pharmacies
GET  /pharmacies/nearby         # Get nearby pharmacies
GET  /pharmacies/{id}           # Get specific pharmacy
POST /pharmacies                # Create pharmacy profile
PUT  /pharmacies/{id}           # Update pharmacy profile
DELETE /pharmacies/{id}         # Delete pharmacy profile
GET  /pharmacies/my             # Get user's pharmacy
```

### **Order & Cart Endpoints**
```
GET  /orders                    # Get user orders
GET  /orders/{id}               # Get specific order
GET  /orders/stats               # Get order statistics
GET  /cart                      # Get user cart
POST /cart                      # Add item to cart
DELETE /cart/clear              # Clear cart
DELETE /cart/{item}            # Remove item from cart
GET  /cart/recommendations      # Get cart recommendations
```

### **Checkout & Payment Endpoints**
```
GET  /checkout/validate/{pharmacy_id}     # Validate cart for checkout
GET  /checkout/summary/{pharmacy_id}      # Get checkout summary
POST /checkout/initiate/{pharmacy_id}     # Initiate checkout
POST /checkout/paypal/{pharmacy_id}       # Process PayPal payment
GET  /checkout/payment-status/{order_id}  # Get payment status
```

### **Donation Endpoints**
```
GET  /donations                 # Get user donations
POST /donations                 # Create donation
GET  /donations/{id}            # Get specific donation
PUT  /donations/{id}            # Update donation
DELETE /donations/{id}          # Delete donation
GET  /donations-available       # Get available donations
GET  /donations-all             # Get all donations (public)
```

### **Stock Management Endpoints**
```
GET  /stock-batches             # Get stock batches
GET  /stock-batches/summary     # Get stock summary
GET  /stock-batches/expired     # Get expired batches
GET  /stock-batches/expiring-soon # Get expiring batches
GET  /stock-batches/low-stock   # Get low stock batches
POST /stock-batches             # Create stock batch
PUT  /stock-batches/{id}        # Update stock batch
DELETE /stock-batches/{id}     # Delete stock batch
```

### **Drug Interaction Endpoints**
```
POST /interactions/check        # Check drug interactions
```

### **Response Format**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "meta": {
    // Pagination or additional metadata
  }
}
```

---

## 🏗️ Project Structure

```
tadawi-frontend/
├── public/
│   ├── index.html
│   ├── logo.png
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Home/
│   │   │   ├── AllPharamacy/
│   │   │   ├── AlternativeSearch/
│   │   │   ├── Auth/
│   │   │   ├── Checkout/
│   │   │   ├── ConflictSystem/
│   │   │   ├── Donations/
│   │   │   ├── Header/
│   │   │   ├── Home/
│   │   │   ├── Orders/
│   │   │   ├── Patient/
│   │   │   ├── PharmacySearch/
│   │   │   ├── Profile/
│   │   │   └── ui/
│   │   └── PharmacyManagement.jsx
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   ├── charts/
│   │   │   ├── common/
│   │   │   ├── forms/
│   │   │   ├── icons/
│   │   │   ├── navbar/
│   │   │   └── sidebar/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **1. Fork the Repository**
```bash
# Frontend Repository
git clone https://github.com/mostafaomar7/Tadawi.git
cd Tadawi

# Backend Repository
git clone https://github.com/KareemA-Saad/tadawi-app.git
cd tadawi-app
```

### **2. Create Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

### **3. Make Your Changes**
- Follow PSR-12 coding standards for PHP
- Use ESLint and Prettier for JavaScript/React
- Write tests for new features
- Update documentation

### **4. Commit Your Changes**
```bash
git commit -m "Add amazing feature"
```

### **5. Push to Branch**
```bash
git push origin feature/amazing-feature
```

### **6. Create Pull Request**
- Describe your changes clearly
- Link any related issues
- Request review from maintainers

### **Development Guidelines**
- Follow SOLID principles
- Write modular, reusable code
- Use modern OOP patterns
- Ensure responsive design
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support, questions, or feature requests:

- 📧 **Email**: support@tadawi.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/mostafaomar7/Tadawi/issues)
- 📖 **Documentation**: [Project Wiki](https://github.com/mostafaomar7/Tadawi/wiki)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/mostafaomar7/Tadawi/discussions)

---

<div align="center">

**Made with ❤️ for Healthcare**

[![GitHub stars](https://img.shields.io/github/stars/mostafaomar7/Tadawi?style=social)](https://github.com/mostafaomar7/Tadawi/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mostafaomar7/Tadawi?style=social)](https://github.com/mostafaomar7/Tadawi/network)

</div>
