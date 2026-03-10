#!/bin/bash

# 1️⃣ Start MongoDB in background
"/c/Program Files/MongoDB/Server/8.2/bin/mongod.exe" --dbpath "C:/data/db" &

# Wait a few seconds for MongoDB
sleep 5

# 2️⃣ Start Backend in new terminal
cd "/c/Documents/think-books/backend"
start cmd /k "npm start"

# 3️⃣ Start Frontend in new terminal
cd "/c/Documents/think-books/frontend"
start cmd /k "npm start"