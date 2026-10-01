@echo off
title Dedicated MongoDB Quiz Instance (Port 27018)
echo ===================================================
echo  Starting Dedicated Quiz System MongoDB on Port 27018
echo  Data Directory: E:\Project\mongo_data
echo  Compass Connection URI: mongodb://localhost:27018
echo ===================================================
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --config "E:\Project\mongo_data\mongod.cfg"
