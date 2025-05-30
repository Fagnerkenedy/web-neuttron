echo "Switching to branch master"
git checkout master

echo "Pulling app..."
git pull --no-rebase

echo "Switching to folder dist"
cd dist

echo "Coppying files to online folder"
cp -r * /var/www/52.67.55.72

echo "Executed Successfully"