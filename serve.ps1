$root = $PSScriptRoot
$port = 5173

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"

$mime = @{
    ".html" = "text/html"; ".htm" = "text/html"; ".css" = "text/css"; ".js" = "application/javascript"
    ".json" = "application/json"; ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
    ".gif" = "image/gif"; ".svg" = "image/svg+xml"; ".ico" = "image/x-icon"; ".txt" = "text/plain"
    ".woff" = "font/woff"; ".woff2" = "font/woff2"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
    } catch { break }
    $request = $context.Request
    $response = $context.Response
    try {
        $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
        if ($path -eq "/") { $path = "/index.html" }
        $filePath = Join-Path $root ($path.TrimStart("/"))
        $filePath = [System.IO.Path]::GetFullPath($filePath)
        if (-not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
        } elseif (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            $contentType = $mime[$ext]
            if (-not $contentType) { $contentType = "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }
    } catch {
        Write-Host "Error: $_"
        $response.StatusCode = 500
    } finally {
        $response.OutputStream.Close()
    }
}
