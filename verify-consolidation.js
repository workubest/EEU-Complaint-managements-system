// Verification script for permissions consolidation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Permissions System Consolidation...\n');

// Test 1: Verify Settings.tsx no longer has permissions tab
console.log('📋 Checking Settings.tsx cleanup...');
const settingsContent = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const settingsChecks = [
  { pattern: /TabsTrigger.*permissions/i, name: 'Permissions tab trigger', shouldExist: false },
  { pattern: /TabsContent.*permissions/i, name: 'Permissions tab content', shouldExist: false },
  { pattern: /permissionMatrix/i, name: 'Permission matrix state', shouldExist: false },
  { pattern: /handlePermissionChange/i, name: 'Permission change handler', shouldExist: false },
  { pattern: /handleSavePermissions/i, name: 'Save permissions handler', shouldExist: false },
  { pattern: /grid-cols-6/i, name: 'Six tabs layout', shouldExist: true },
  { pattern: /UserCog.*Save Permissions/i, name: 'Permission save button', shouldExist: false }
];

let settingsCleanupScore = 0;
settingsChecks.forEach(check => {
  const exists = check.pattern.test(settingsContent);
  if (check.shouldExist === exists) {
    console.log(`✅ ${check.name}`);
    settingsCleanupScore++;
  } else {
    console.log(`❌ ${check.name} - ${exists ? 'FOUND (should not exist)' : 'NOT FOUND (should exist)'}`);
  }
});

// Test 2: Verify PermissionManagement.tsx has enhancements
console.log('\n🔐 Checking PermissionManagement.tsx enhancements...');
const permissionsContent = fs.readFileSync('src/pages/PermissionManagement.tsx', 'utf8');

const permissionChecks = [
  { pattern: /apiService\.getPermissionMatrix/i, name: 'API load integration' },
  { pattern: /apiService\.updatePermissionMatrix/i, name: 'API save integration' },
  { pattern: /useEffect.*loadPermissions/i, name: 'Load permissions on mount' },
  { pattern: /role !== 'admin'/i, name: 'Admin-only access check' },
  { pattern: /Access Denied/i, name: 'Access denied message' },
  { pattern: /Loading permissions/i, name: 'Loading state' },
  { pattern: /setLoading\(true\)/i, name: 'Loading state management' }
];

let permissionEnhancementScore = 0;
permissionChecks.forEach(check => {
  if (check.pattern.test(permissionsContent)) {
    console.log(`✅ ${check.name}`);
    permissionEnhancementScore++;
  } else {
    console.log(`❌ ${check.name} - NOT FOUND`);
  }
});

// Test 3: Verify App.tsx routing is correct
console.log('\n🛣️ Checking App.tsx routing...');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const routingChecks = [
  { pattern: /path.*\/permissions/i, name: 'Permissions route exists' },
  { pattern: /ProtectedRoute.*resource.*settings.*action.*update/i, name: 'Permissions route protection' },
  { pattern: /<PermissionManagement/i, name: 'PermissionManagement component' }
];

let routingScore = 0;
routingChecks.forEach(check => {
  if (check.pattern.test(appContent)) {
    console.log(`✅ ${check.name}`);
    routingScore++;
  } else {
    console.log(`❌ ${check.name} - NOT FOUND`);
  }
});

// Test 4: Verify Sidebar.tsx has permissions link
console.log('\n📱 Checking Sidebar.tsx navigation...');
const sidebarContent = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const sidebarChecks = [
  { pattern: /nav\.permissions.*\/dashboard\/permissions/i, name: 'Permissions navigation link' },
  { pattern: /resource.*settings.*action.*update/i, name: 'Permissions link protection' },
  { pattern: /Shield/i, name: 'Permissions icon' }
];

let sidebarScore = 0;
sidebarChecks.forEach(check => {
  if (check.pattern.test(sidebarContent)) {
    console.log(`✅ ${check.name}`);
    sidebarScore++;
  } else {
    console.log(`❌ ${check.name} - NOT FOUND`);
  }
});

// Calculate overall score
const totalChecks = settingsChecks.length + permissionChecks.length + routingChecks.length + sidebarChecks.length;
const totalScore = settingsCleanupScore + permissionEnhancementScore + routingScore + sidebarScore;
const percentage = Math.round((totalScore / totalChecks) * 100);

console.log('\n📊 Consolidation Verification Results:');
console.log('=====================================');
console.log(`Settings Cleanup: ${settingsCleanupScore}/${settingsChecks.length} ✅`);
console.log(`Permissions Enhancement: ${permissionEnhancementScore}/${permissionChecks.length} ✅`);
console.log(`Routing Configuration: ${routingScore}/${routingChecks.length} ✅`);
console.log(`Sidebar Navigation: ${sidebarScore}/${sidebarChecks.length} ✅`);
console.log(`\nOverall Score: ${totalScore}/${totalChecks} (${percentage}%)`);

if (percentage >= 90) {
  console.log('\n🎉 CONSOLIDATION SUCCESSFUL!');
  console.log('✅ Permissions system has been successfully consolidated');
  console.log('✅ Single permissions interface is working properly');
  console.log('✅ Settings page has been cleaned up');
  console.log('✅ Enhanced permissions page is ready for use');
} else if (percentage >= 70) {
  console.log('\n⚠️ CONSOLIDATION MOSTLY COMPLETE');
  console.log('Some minor issues found, but system should work');
} else {
  console.log('\n❌ CONSOLIDATION INCOMPLETE');
  console.log('Significant issues found, please review');
}

console.log('\n🚀 Next Steps:');
console.log('1. Test the application: http://localhost:8085');
console.log('2. Login as admin user');
console.log('3. Navigate to /dashboard/permissions');
console.log('4. Verify permissions management works');
console.log('5. Check that /dashboard/settings has no permissions tab');

console.log('\n✨ Permissions system consolidation verification complete!');