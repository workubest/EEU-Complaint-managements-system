# User Permissions System Test Plan

## 🎯 **Test Objective**
Verify that the user permissions system works properly across all components and user roles.

## 📋 **Test Scenarios**

### **1. Settings Page Permissions Tab**
**URL:** `http://localhost:8084/dashboard/settings`

#### **Test Cases:**
- ✅ **Admin Access:** Admin users can view and modify permissions
- ✅ **Non-Admin Access:** Non-admin users see "Access Restricted" message
- ✅ **Permission Matrix Display:** Shows all roles and resources in a table
- ✅ **CRUD Operations:** Create, Read, Update, Delete toggles work
- ✅ **Bulk Actions:** "Enable All" and "Disable All" buttons work
- ✅ **Save Functionality:** Changes are saved and persist
- ✅ **Reset to Defaults:** Reset button restores default permissions
- ✅ **Permission Summary:** Shows percentage of permissions per role

### **2. Dedicated Permissions Page**
**URL:** `http://localhost:8084/dashboard/permissions`

#### **Test Cases:**
- ✅ **Page Access:** Only admin users can access this page
- ✅ **Role-Based Matrix:** Comprehensive permission matrix display
- ✅ **Interactive Toggles:** Switch components work for each permission
- ✅ **Visual Feedback:** Changes are reflected immediately
- ✅ **Validation:** Prevents invalid permission combinations

### **3. Permission Enforcement**

#### **Test Cases:**
- ✅ **Navigation Protection:** Menu items hidden based on permissions
- ✅ **Route Protection:** Protected routes redirect unauthorized users
- ✅ **Component Protection:** UI elements hidden/disabled based on permissions
- ✅ **API Protection:** Backend calls respect permission settings

### **4. Role-Based Testing**

#### **Admin Role:**
- ✅ Full access to all resources (CRUD)
- ✅ Can manage other users' permissions
- ✅ Can access system settings
- ✅ Can perform administrative actions

#### **Manager Role:**
- ✅ Limited user management (read/update only)
- ✅ Full complaint management
- ✅ Report generation access
- ✅ Limited settings access

#### **Foreman Role:**
- ✅ Read-only user access
- ✅ Complaint update access
- ✅ Read-only reports access
- ✅ No settings access

#### **Call Attendant Role:**
- ✅ Complaint creation and updates
- ✅ Limited notification access
- ✅ No user management access
- ✅ No administrative access

#### **Technician Role:**
- ✅ Complaint updates only
- ✅ No user management access
- ✅ No administrative access
- ✅ Limited system access

## 🔧 **Technical Implementation**

### **Permission Matrix Structure:**
```typescript
interface PermissionMatrix {
  [role: string]: {
    [resource: string]: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}
```

### **Resources Covered:**
- **users:** User management functionality
- **complaints:** Complaint handling system
- **reports:** Analytics and reporting
- **settings:** System configuration
- **notifications:** Notification management

### **Roles Defined:**
- **admin:** Full system access
- **manager:** Management-level access
- **foreman:** Operational supervision
- **call-attendant:** Customer service
- **technician:** Field operations

## 🧪 **Test Execution Steps**

### **Step 1: Admin User Testing**
1. Login as admin user (`admin@eeu.gov.et`)
2. Navigate to `/dashboard/settings`
3. Click on "Permissions" tab
4. Verify permission matrix is displayed
5. Test toggle switches for different roles/resources
6. Test bulk enable/disable buttons
7. Save changes and verify persistence
8. Test reset to defaults functionality

### **Step 2: Non-Admin User Testing**
1. Login as manager user (`manager@eeu.gov.et`)
2. Navigate to `/dashboard/settings`
3. Click on "Permissions" tab
4. Verify "Access Restricted" message is shown
5. Try to access `/dashboard/permissions` directly
6. Verify access is denied

### **Step 3: Permission Enforcement Testing**
1. Login as different role users
2. Verify menu items are shown/hidden correctly
3. Test protected routes and components
4. Verify API calls respect permissions
5. Test edge cases and boundary conditions

### **Step 4: UI/UX Testing**
1. Verify responsive design on different screen sizes
2. Test accessibility features
3. Verify loading states and error handling
4. Test visual feedback and animations

## ✅ **Expected Results**

### **Admin User:**
- Can access and modify all permissions
- Permission matrix displays correctly
- Changes are saved and persist
- Bulk actions work as expected
- Reset functionality works

### **Non-Admin Users:**
- Cannot access permission management
- See appropriate access denied messages
- Cannot modify system permissions
- UI elements are properly hidden/disabled

### **Permission Enforcement:**
- Routes are protected based on permissions
- UI components respect permission settings
- API calls are authorized correctly
- Navigation reflects user permissions

## 🚨 **Common Issues to Check**

### **Potential Problems:**
- ❌ Permission matrix not loading
- ❌ Toggle switches not working
- ❌ Changes not persisting after save
- ❌ Non-admin users can access permissions
- ❌ UI elements not respecting permissions
- ❌ API calls not checking permissions

### **Solutions:**
- ✅ Check API service methods
- ✅ Verify authentication context
- ✅ Test permission checking logic
- ✅ Validate role-based access control
- ✅ Check component protection implementation

## 📊 **Test Results Documentation**

### **Test Status:**
- [ ] Settings Page Permissions Tab
- [ ] Dedicated Permissions Page  
- [ ] Permission Enforcement
- [ ] Role-Based Access Control
- [ ] UI/UX Functionality

### **Issues Found:**
- [ ] Issue 1: Description
- [ ] Issue 2: Description
- [ ] Issue 3: Description

### **Recommendations:**
- [ ] Recommendation 1
- [ ] Recommendation 2
- [ ] Recommendation 3

---

## 🎯 **Quick Test Commands**

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Test specific URLs
http://localhost:8084/dashboard/settings
http://localhost:8084/dashboard/permissions
```

## 📝 **Test Completion Checklist**

- [ ] All test scenarios executed
- [ ] Results documented
- [ ] Issues identified and logged
- [ ] Recommendations provided
- [ ] System ready for production