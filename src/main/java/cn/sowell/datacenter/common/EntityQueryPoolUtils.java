package cn.sowell.datacenter.common;

import javax.servlet.http.HttpSession;

import cn.sowell.copframe.common.UserIdentifier;
import cn.sowell.datacenter.SessionKey;
import cn.sowell.dataserver.model.modules.service.view.EntityQueryPool;

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
