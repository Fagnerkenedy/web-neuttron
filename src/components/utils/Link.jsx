// Link.js
import { Link as RouterLink } from 'react-router-dom';
import { Typography } from 'antd';

const { Link: AntLink } = Typography;

// Exporta como se fosse o Link padrão
const Link = ({ to, children, ...rest }) => {
  return (
    <AntLink {...rest} style={{ cursor: 'pointer' }}>
      <RouterLink to={to} style={{ color: 'inherit' }}>
        {children}
      </RouterLink>
    </AntLink>
  );
};

export default Link;
