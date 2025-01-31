echo "Switching to branch master"
git checkout master

echo "Building app..."
npm run build

echo "Adding files to gir repository"
git add .
git commit -m "Enviado de forma automatica."
echo "Pushing to git.."
git push

echo "Deploying files to server..."
scp -r build/* ubuntu@crm.neuttron.com.br:/var/www/52.67.55.72