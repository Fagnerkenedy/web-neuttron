import { Navigate, useParams } from 'react-router-dom';
import { useAbility } from '../contexts/AbilityContext';

const AuthorizedRouteWrapper = ({ action, children }) => {
  const { org } = useParams();
  const { module } = useParams();
  const { ability, loading } = useAbility();

  if (loading) return null;

  if (!ability.can(action, module)) {
    return <Navigate to={`/${org}/not-authorized`} />;
  }

  return children;
};

export default AuthorizedRouteWrapper;
