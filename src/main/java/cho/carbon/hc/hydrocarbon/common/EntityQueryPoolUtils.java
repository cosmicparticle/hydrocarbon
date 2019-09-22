package cho.carbon.hc.hydrocarbon.common;

import javax.servlet.http.HttpSession;

import cho.carbon.hc.copframe.common.UserIdentifier;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQueryPool;
import cho.carbon.hc.hydrocarbon.SessionKey;

public class EntityQueryPoolUtils {
	public static EntityQueryPool getEntityQueryPool(HttpSession session, UserIdentifier user) {
		EntityQueryPool pool = (EntityQueryPool) session.getAttribute(SessionKey.ENTITY_QUERY_POOL);
		if(pool == null) {
			synchronized (SessionKey.ENTITY_QUERY_POOL) {
				pool = (EntityQueryPool) session.getAttribute(SessionKey.ENTITY_QUERY_POOL);
				if(pool == null) {
					pool = new EntityQueryPool(user);
					session.setAttribute(SessionKey.ENTITY_QUERY_POOL, pool);
				}
			}
		}
		return pool;
	}
	
	public static EntityQueryPool getEntityQueryPool(ApiUser user) {
		EntityQueryPool pool = (EntityQueryPool) user.getCache(SessionKey.ENTITY_QUERY_POOL);
		if(pool == null) {
			synchronized (user) {
				pool = (EntityQueryPool) user.getCache(SessionKey.ENTITY_QUERY_POOL);
				if(pool == null) {
					pool = new EntityQueryPool(user);
					user.setCache(SessionKey.ENTITY_QUERY_POOL, pool);
				}
			}
		}
		return pool;
	}
}
