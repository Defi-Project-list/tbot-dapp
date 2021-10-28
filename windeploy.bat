@ECHO OFF
ECHO Building & Deploying...
npm run build
copy .\captain-definition .\dist\
cd .\dist\
git init -b master
git add .
git commit -m "Build"
caprover deploy --default
cd ..