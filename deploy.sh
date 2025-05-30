echo "Switching to branch master"
git checkout master

echo "Building app..."
npm run build

echo "Adding files to git repository"
git add .
git commit -m "Enviado de forma automatica."
echo "Pushing to git.."
git push

echo "Deploying files to server..."
scp -i "C:/Users/fagne/.ssh/neuttron-server.pem" -r dist/* ubuntu@crm.neuttron.com.br:/home/ubuntu/temp_deploy/

echo "Accessing server"
ssh -i "C:/Users/fagne/.ssh/neuttron-server.pem" ubuntu@crm.neuttron.com.br

echo "Moving to web folder"
sudo mv /home/ubuntu/temp_deploy/* /var/www/52.67.55.72/

echo "✅ Deploy finalizado com sucesso!"