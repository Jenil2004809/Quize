@echo off
cls
echo =========================================================================
echo             ONLINE QUIZ SYSTEM - CLOUDFLARE PUBLIC TUNNEL               
echo =========================================================================
echo.
echo Launching Live Direct HTTPS Cloudflare Public Tunnel...
echo.
echo Copy and share the trycloudflare.com HTTPS URL generated below:
echo =========================================================================
echo.

npx -y cloudflared tunnel --protocol http2 --url http://localhost:5173

pause
