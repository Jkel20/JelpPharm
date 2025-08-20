# Test script for new role-based signup system
# This script tests both Administrator and Pharmacist signup

Write-Host "Testing new role-based signup system..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Test Administrator signup
Write-Host "`n1. Testing Administrator signup..." -ForegroundColor Yellow
$adminData = @{
    fullName = "Test Administrator"
    username = "testadmin"
    email = "testadmin@test.com"
    password = "TestPass123!"
    role = "ADMINISTRATOR"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -ContentType "application/json" -Body $adminData
    Write-Host "✅ Administrator signup successful!" -ForegroundColor Green
    Write-Host "   User ID: $($adminResponse.data.user.id)" -ForegroundColor Cyan
    Write-Host "   Role: $($adminResponse.data.user.role)" -ForegroundColor Cyan
    Write-Host "   Token: $($adminResponse.data.token)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Administrator signup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Pharmacist signup
Write-Host "`n2. Testing Pharmacist signup..." -ForegroundColor Yellow
$pharmacistData = @{
    fullName = "Test Pharmacist"
    username = "testpharm"
    email = "testpharm@test.com"
    password = "TestPass123!"
    role = "PHARMACIST"
    storeName = "Test Pharmacy"
    storeAddress = "123 Test Street, Test City"
} | ConvertTo-Json

try {
    $pharmacistResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -ContentType "application/json" -Body $pharmacistData
    Write-Host "✅ Pharmacist signup successful!" -ForegroundColor Green
    Write-Host "   User ID: $($pharmacistResponse.data.user.id)" -ForegroundColor Cyan
    Write-Host "   Role: $($pharmacistResponse.data.user.role)" -ForegroundColor Cyan
    Write-Host "   Store ID: $($pharmacistResponse.data.user.storeId)" -ForegroundColor Cyan
    Write-Host "   Token: $($pharmacistResponse.data.token)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Pharmacist signup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test invalid role (should fail)
Write-Host "`n3. Testing invalid role (should fail)..." -ForegroundColor Yellow
$invalidData = @{
    fullName = "Test Invalid"
    username = "testinvalid"
    email = "testinvalid@test.com"
    password = "TestPass123!"
    role = "INVALID_ROLE"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -ContentType "application/json" -Body $invalidData
    Write-Host "❌ Invalid role signup should have failed but succeeded!" -ForegroundColor Red
} catch {
    Write-Host "✅ Invalid role signup correctly failed: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "Role-based signup testing completed!" -ForegroundColor Green
