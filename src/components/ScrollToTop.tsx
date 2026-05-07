import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll position on route change. React Router does not do this by
 * default, which is why landing on a new page (e.g. /auth/login or
 * /services/...) sometimes leaves the user mid-page or at the bottom.
 *
 * Behaviour:
 *   - Pure path change         → scroll window to (0, 0).
 *   - Path change with #hash   → scroll to the matching element when it
 *                                exists (so anchor links like "/#offers"
 *                                still work). Falls back to top if not.
 *   - History POP (back/fwd)   → leave the browser's restored position
 *                                untouched.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
