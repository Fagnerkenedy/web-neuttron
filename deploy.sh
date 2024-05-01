echo "Switching to branch master"
git checkout master

echo "Building app..."
npm run build

echo "Deploying files to server..."
scp -r build/* ubuntu@52.67.55.72:/var/www/52.67.55.72