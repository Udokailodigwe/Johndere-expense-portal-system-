import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../features/user/userSlice";

const ProtectedRoutes = ({ children, roles }) => {
  const { user, isLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!user && !isLoading && !hasCheckedAuth) {
      dispatch(getCurrentUser()).then((result) => {
        setHasCheckedAuth(true);
      });
    }
  }, [dispatch, user, isLoading, hasCheckedAuth]);

  if (isLoading || (!user && !hasCheckedAuth)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user && hasCheckedAuth) {
    return <Navigate to="/activate-account?form=login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/index" replace />;
  }

  return children;
};
export default ProtectedRoutes;
