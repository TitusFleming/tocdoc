# Known Issues - TOCdoc Pre-Alpha

## 🐛 Current Limitations & Workarounds

### Notification System
**Issue**: Email and SMS notifications are not actually sent
- **Status**: Framework implemented, delivery services not connected
- **Workaround**: Check browser console for notification logs
- **Fix Timeline**: Alpha version (next release)

**Issue**: Real-time notifications not implemented
- **Status**: Notifications trigger on events but don't push to UI
- **Workaround**: Refresh page to see new data
- **Fix Timeline**: Alpha version

### Data Entry
**Issue**: Patient data must be entered manually
- **Status**: No hospital EMR integration yet
- **Workaround**: Use Admin Panel for batch patient creation
- **Fix Timeline**: Alpha/Beta versions

**Issue**: No automated admission/discharge feeds
- **Status**: Designed for hospital integration but not implemented
- **Workaround**: Manual entry by hospital admin users
- **Fix Timeline**: Beta version

### UI/UX Minor Issues
**Issue**: Loading states could be more polished
- **Status**: Basic loading indicators implemented
- **Workaround**: Wait for data to load (usually < 2 seconds)
- **Fix Timeline**: Alpha version

**Issue**: Patient detail pages use mock data
- **Status**: Individual patient pages show sample data
- **Workaround**: Use patient list view for real data
- **Fix Timeline**: Alpha version

**Issue**: No bulk operations for patient management
- **Status**: Must create patients one at a time through UI
- **Workaround**: Use API directly or database seeding for large datasets
- **Fix Timeline**: Alpha version

## ⚠️ Technical Considerations

### Database
**Note**: Uses PostgreSQL locally - customer needs to set this up
- **Setup Required**: Customer must install PostgreSQL
- **Migration**: Database schema changes may require re-seeding
- **Backup**: No automated backup system yet

### Authentication
**Note**: Requires Clerk account setup
- **Dependency**: Customer needs to create free Clerk account
- **Configuration**: Must configure Clerk keys in environment variables
- **Session**: Sessions expire based on Clerk settings (default 7 days)

### Performance
**Note**: Optimized for small datasets (< 1000 patients)
- **Current Capacity**: Works well with hundreds of patients
- **Scaling**: Database indexing may need optimization for larger datasets
- **Monitoring**: No performance monitoring implemented yet

## 🔒 Security Notes

### HIPAA Compliance
**Ready**: Core HIPAA requirements implemented
- ✅ Data encryption at rest and in transit
- ✅ Role-based access control
- ✅ 30-day data retention policy
- ✅ Secure authentication

**Not Yet Implemented**:
- 🔲 Audit logging (framework ready)
- 🔲 Multi-factor authentication (Clerk supports this)
- 🔲 Penetration testing
- 🔲 Business Associate Agreements

### Data Handling
**Safe**: No PHI in notifications (HIPAA compliant)
**Safe**: Role-based data filtering prevents unauthorized access
**Note**: Data stored locally on customer infrastructure

## 🚀 Roadmap Items

### High Priority (Alpha - 4-6 weeks)
1. **Real Email/SMS Delivery**: Connect to SendGrid/Twilio
2. **Enhanced Patient Details**: Complete patient detail pages
3. **Audit Logging**: Track all data access for compliance
4. **Bulk Operations**: Import/export patient data
5. **Real-time Updates**: WebSocket or polling for live updates

### Medium Priority (Beta - 8-12 weeks)
1. **Hospital Integration APIs**: RESTful APIs for EMR systems
2. **Advanced Analytics**: Medicare Advantage tracking dashboards
3. **Workflow Automation**: Automated follow-up reminders
4. **Mobile Optimization**: Touch-friendly interface
5. **Reporting Engine**: Compliance and utilization reports

### Lower Priority (Production - 16+ weeks)
1. **Multi-tenant Architecture**: Support multiple hospital systems
2. **HL7/FHIR Integration**: Healthcare data standards
3. **Native Mobile Apps**: iOS/Android applications
4. **Enterprise Security**: SSO, advanced authentication
5. **Advanced Workflow**: Custom care coordination workflows

## 🛠️ Development Setup Issues

### Common Problems & Solutions

**Problem**: Clerk keys not working
- **Solution**: Verify keys are copied correctly from Clerk dashboard
- **Check**: Make sure you're using the correct environment (test vs. production)

**Problem**: Database connection failed
- **Solution**: Ensure PostgreSQL is running and connection string is correct
- **Check**: Database name, username, password, host, and port

**Problem**: Build errors with TypeScript
- **Solution**: Run `npm install` to ensure all dependencies are installed
- **Check**: Node.js version should be 18 or higher

**Problem**: Roles not working correctly
- **Solution**: Complete the onboarding process after sign-up
- **Check**: User role is set in database (can verify via Prisma Studio)

**Problem**: Pages not loading after authentication
- **Solution**: Check that middleware.ts is properly configured
- **Check**: Clerk environment variables are set correctly

## 📞 Getting Help

### For Setup Issues
1. Check SETUP.md for detailed installation instructions
2. Verify all environment variables are set
3. Check browser console for error messages
4. Check server console for API errors

### For Feature Questions
1. Review CUSTOMER_DELIVERY.md for current feature status
2. Check README.md for feature documentation
3. Review the roadmap for planned enhancements

### For Technical Issues
1. Check browser developer tools for client-side errors
2. Check terminal/console for server-side errors
3. Verify database connection and data integrity
4. Clear browser cache and cookies if needed

---

**Remember**: This is a pre-alpha version focused on demonstrating core functionality and security. Many convenience features and integrations are planned for future releases. 