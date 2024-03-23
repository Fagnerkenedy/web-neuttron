echo "Switching to branch master"
git checkout master

echo "Building app..."
npm rum build

echo "Deploying files to server..."
scp -r build/* ubuntu@192.168.100.116:/var/www/neuttron.com.br