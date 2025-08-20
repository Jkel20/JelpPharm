# Test Signup API
$uri = "http://localhost:5000/api/auth/signup"
$body = @{
    fullName = "Test User"
    username = "testuser"
    email = "test@example.com"
    phone = "0541234567"
    password = "TestPass123!"
    role = "Pharmacist"
    storeName = "Test Pharmacy"
    storeAddress = "123 Test Street, Accra"
} | ConvertTo-Json

Write-Host "Testing signup API..."
Write-Host "URL: $uri"
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
        $reader.Close()
    }
}
