# TOCdoc - Transition of Care Portal

## 🚀 Quick Start (Pre-Alpha)

**For customers receiving this pre-alpha version:**

1. **Prerequisites**: Node.js 18+, PostgreSQL, and a free [Clerk account](https://clerk.dev)
2. **Copy environment template**: `cp env.example .env.local`
3. **Configure your Clerk keys** in `.env.local` (see SETUP.md for details)
4. **Set your database URL** in `.env.local`
5. **Run setup**: `npm run setup`
6. **Start the app**: `npm run dev`
7. **Verify setup**: `npm run verify` (optional)

📖 **Full instructions**: See SETUP.md  
📋 **What you're getting**: See CUSTOMER_DELIVERY.md  
🐛 **Known limitations**: See KNOWN_ISSUES.md

---

## Overview
TOCdoc is a HIPAA-compliant hospital discharge notification and transition of care portal designed to help physicians receive timely notifications about patient admissions and discharges, enabling them to provide effective follow-up care and maximize Medicare Advantage reimbursements.

## Core Features

### 1. Discharge Notifications (Non-PHI)
- **Admission Alerts**: "A patient assigned to your practice has been admitted"
- **Discharge Alerts**: "A patient assigned to your practice has been discharged"
- **No PHI**: Notifications contain NO Protected Health Information for HIPAA compliance
- **Multiple Channels**: Email and SMS notifications

### 2. Secure Portal Access
- **Role-Based Access**: Physicians see only their assigned patients
- **Essential Data Only**:
  - Patient name
  - Date of birth
  - Facility name
  - Admission/discharge dates
  - Diagnosis
  - Clinical notes (medications, follow-up studies, pending procedures)

### 3. Medicare Advantage Benefits
- **Quarterly Bonus Tracking**: Monitor transition of care coordination
- **3x Reimbursement**: Track follow-up eligible patients
- **Rehospitalization Prevention**: Timely follow-up coordination

### 4. HIPAA Compliance
- **30-Day Auto-Deletion**: Records automatically deleted after 30 days
- **Encrypted Storage**: All data encrypted at rest and in transit
- **Audit Logging**: Complete access logs for compliance
- **Business Associate Agreements**: Required for all physician users

## Demo Accounts

### Admin Account
- **Email**: `admin@hospital.com`
- **Access**: All patients across all physicians
- **Use Case**: Hospital administration, system oversight

### Physician Accounts
- **Dr. Smith**: `dr.smith@hospital.com`
- **Dr. Jones**: `dr.jones@hospital.com`
- **Access**: Only patients assigned to their practice

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Database**
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Portal**
   - Navigate to `http://localhost:3000`
   - Sign in with demo accounts above
   - View dashboard and patient data

## Key Demo Points

### Dashboard Stats
- **Total Patients**: Active patients in system
- **Recent Admissions**: Last 7 days
- **Recent Discharges**: Transition of care eligible
- **Follow-up Required**: Medicare Advantage bonus eligible

### Patient Management
- **Status Tracking**: Admitted, Discharged, Follow-up Due
- **Recent Activity**: Last 7 days of admissions/discharges
- **Clinical Notes**: Essential transition information

### Notification Settings
- **HIPAA-Safe**: Configure alerts without PHI
- **Immediate Delivery**: Real-time notifications for timely care
- **Multi-Channel**: Email and SMS options

## Technical Implementation

### Stack
- **Frontend**: Next.js 14, React, TypeScript
- **Authentication**: Clerk (HIPAA-compliant)
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI + Tailwind CSS
- **Hosting**: Designed for AWS/Azure/GCP HIPAA environments

### Security Features
- **Encrypted Database**: All patient data encrypted at rest
- **Secure Authentication**: Multi-factor authentication support
- **Session Management**: Automatic timeout for security
- **Access Control**: Role-based patient data access

## Business Value

### For Physicians
- **Increased Revenue**: Medicare Advantage quarterly bonuses
- **Higher Reimbursement**: 3x office visit rates for transition care
- **Improved Outcomes**: Timely follow-up reduces rehospitalization
- **Efficiency**: Automated notifications vs. manual hospital calls

### For Hospitals
- **Care Coordination**: Seamless physician communication
- **Compliance**: HIPAA-ready notification system
- **Patient Outcomes**: Reduced readmission rates
- **Integration Ready**: Manual data entry initially, API integration possible

## Compliance Notes

### HIPAA Requirements Met
- ✅ **PHI Protection**: No PHI in notifications
- ✅ **Secure Access**: Authentication required for patient data
- ✅ **Data Retention**: 30-day automatic deletion
- ✅ **Encryption**: TLS/SSL and database encryption
- ✅ **Access Logs**: Complete audit trail
- ✅ **BAA Ready**: Business Associate Agreement framework

### Next Steps for Production
- [ ] Penetration testing
- [ ] Vulnerability scanning
- [ ] BAA execution with physician practices
- [ ] Hospital EMR integration planning
- [ ] Mobile app development (React Native/Flutter)

---

**TOCdoc** - Bridging hospital discharge to primary care for better patient outcomes and physician reimbursement.
