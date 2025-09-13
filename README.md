# Tadawi - تَداوي

**Healing connections are closer**

Tadawi is a **web-based multi-stakeholder platform** connecting patients, doctors, and pharmacies in Egypt to manage medicine availability, provide safe alternatives, and digitize prescriptions. The platform aims to reduce time-to-therapy, increase visibility of medicine stock, and improve access to life-saving treatments.

---

## Table of Contents

- [Problem Statement](#problem-statement)  
- [Existing Solutions](#existing-solutions)  
- [Target Audience](#target-audience)  
- [Solution Overview](#solution-overview)  
- [Features](#features)  
- [Technical Feasibility](#technical-feasibility)  
- [MVP & Scope](#mvp--scope)  
- [Future Plans](#future-plans)  
- [Database Schema Overview](#database-schema-overview)  
- [Installation & Running](#installation--running)  
- [Contributing](#contributing)  

---

## Problem Statement

Egypt’s medicine shortages are **structural and recurrent**, intensifying during FX and logistics shocks. Patients and pharmacies face repeated stockouts, especially for **chronic and life-saving therapies**. The current system lacks **real-time nationwide visibility** and safe, pharmacist-validated alternatives when brands are missing. Most existing solutions are **reactive, fragmented, and mobile-only**, leaving patients and small pharmacies underserved.

---

## Existing Solutions

| Solution | Limitation |
|----------|------------|
| Chefaa | Focuses mostly on pharmacies and delivery; lacks full patient-healthcare system integration. |
| MedHome (Daleel ElDawa) | More of a medicine directory; limited interactive ordering/delivery, sometimes outdated data. |
| IPharmacy | Suited for large pharmacy chains; small pharmacies and local areas are underserved. |

Tadawi differentiates itself by providing a **web-based interactive platform** with AI-powered suggestions and nationwide coverage.

---

## Target Audience

- **Patients** – Search for medicines, receive notifications, donate surplus medicines.  
- **Doctors** – Upload prescriptions, access patient data, recommend alternatives.  
- **Pharmacies** – Manage stock, view analytics, serve patients efficiently.  
- **Admins & Regulators** – Monitor shortages, view dashboards, generate reports.  

---

## Solution Overview

Tadawi solves the lack of treatments by connecting **patients to pharmacies nationwide**, offering:  

- **Medicine availability search**  
- **Smart alternative suggestions**  
- **Digital prescription upload with OCR**  
- **Personalized medicine profiles**  
- **Pharmacy dashboards with analytics**  
- **Donation and delivery system**  

---

## Features

### Patient
- Register/Login  
- Medicine search & wishlist  
- Prescription upload (OCR)  
- Medicine donation system  
- Notifications about medicine availability  
- Travel Mode to check cross-border availability  

### Doctor
- Register/Login  
- Manage profile & clinic info  
- Upload prescriptions  
- Suggest alternative treatments  

### Pharmacy
- Register/Login  
- Update stock manually or via JSON upload  
- Location info (Google Maps API)  
- Manage orders & deliveries  
- Receive patient reviews  

### Admin
- Full dashboard for Users, Medicines, Orders, Pharmacies  
- Soft delete and restore data  
- Analytics for shortages and usage patterns  

### AI & Smart Systems
- OCR model for prescription reading  
- AI-based alternative suggestions  
- Conflict detection between medicines  
- Donation validation  

---

## Technical Feasibility

- **Backend**: Laravel + Eloquent ORM + Laravel Scout  
- **Frontend**: React / Blade / Livewire (interactive dashboards)  
- **Database**: MySQL/PostgreSQL  
- **AI Features**: OCR for prescriptions, AI for alternative suggestions and conflict system  
- **APIs**: Google Maps for pharmacy locations  
- **Notifications**: Real-time alerts for medicine availability  

---

## MVP & Scope

**Minimum Viable Product (MVP) – 5 Days:**

1. Admin dashboard (Backend + Frontend)  
2. Patient module (Auth, search, donation system, AI for validation)  
3. Pharmacy module (Backend, stock management, AI alternatives, Maps API)  
4. OCR model for prescription reading  

---

## Future Plans

1. **Cross-Border Medicine Support Dashboard** – Monitor medicine availability abroad.  
2. **AI-based Prescription Reader** – OCR trained on doctor handwriting.  
3. **Medicine Donation Platform** – Connect surplus medicines to needy patients/charities.  
4. **Insurance & Payment Integration** – Enable direct payment and insurance support.  

---

## Database Schema Overview

- **Users**: Patients, Doctors, Pharmacies, Admins  
- **Profiles**: PatientProfiles, DoctorProfiles, PharmacyProfiles  
- **Medicines**: ActiveIngredients, TherapeuticClasses, Medicines, StockBatches  
- **Orders**: Orders, OrderMedicines, PrescriptionUploads  
- **Donations**: Donations  
- **Reviews**: Reviews  

Relationships:

- Users → Profiles (1:0..1)  
- Users → Orders / Donations / Reviews (1:N)  
- PharmacyProfiles → Stocks / Orders / Reviews (1:N)  
- Medicines → TherapeuticClasses (M:N)  
- Orders → Medicines (M:N)  

---

## Installation & Running

1. **Clone the repo**
```bash
git clone https://github.com/your-username/tadawi-web-platform.git
cd tadawi-web-platform
Install dependencies

npm install
composer install


Setup environment

cp .env.example .env
# Configure DB credentials and API keys
php artisan key:generate


Run migrations & seeders

php artisan migrate --seed


Start development server

npm start  # React frontend
php artisan serve  # Laravel backend
