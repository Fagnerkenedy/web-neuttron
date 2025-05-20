import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1];
    const moduleName = pathParts[2];
    const navigate = useNavigate();
    return <Result
        status="404"
        title="Ops!"
        subTitle="Desculpe, mas houve um erro ou a Página que você está procurando não existe."
        extra={<Button type="primary" onClick={() => navigate(`/${org}/${moduleName}/upload/home`)}>Voltar à Página inicial.</Button>}
    />


}

export default NotFound;