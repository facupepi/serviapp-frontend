import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que automáticamente hace scroll al tope de la página 
 * cuando cambia la ruta actual.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;