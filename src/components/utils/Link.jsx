// Link.js
import { Link as RouterLink } from 'react-router-dom';
import { Typography } from 'antd';

const { Link: AntLink } = Typography;

// Exporta como se fosse o Link padrão
const Link = ({ to, children, ...rest }) => {
  return (
    <AntLink {...rest}>
      <RouterLink to={to}>
        {children}
      </RouterLink>
    </AntLink>
  );
};

export default Link;
