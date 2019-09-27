package cho.carbon.hc.hydrocarbon.common;

import java.util.Collection;
import java.util.Map;

import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.dataserver.model.abc.service.EntityQueryParameter;
import cho.carbon.hc.dataserver.model.abc.service.ModuleEntityService;
import cho.carbon.message.Message;
import cho.carbon.panel.IntegrationMsg;

public class EntityFusionRunner {
	
	public static void running(Boolean fuseMode, JSONObjectResponse jRes, Map<String, Object> entityMap,
			EntityQueryParameter param,ModuleEntityService entityService) {
		IntegrationMsg msg = null;
		if (Boolean.TRUE.equals(fuseMode)) {
			msg = entityService.fuseEntity(param, entityMap);
		} else {
			msg = entityService.mergeEntity(param, entityMap);
		}
		if (msg.success()) {
			jRes.put("entityCode", msg.getCode());
			jRes.setStatus("suc");
		} else {
			jRes.setStatus("refuse");
			
			jRes.put("refuseMsg", getFuseMsgStr(msg));

			jRes.put("refuseMsg", getErrorMsgStr(msg));
		}
	}
	
	public static AjaxPageResponse running(Boolean fuseMode, Map<String, Object> entityMap,
			EntityQueryParameter param,ModuleEntityService entityService,Long menuId) {
		IntegrationMsg msg = null;
		if (Boolean.TRUE.equals(fuseMode)) {
			msg = entityService.fuseEntity(param, entityMap);
		} else {
			msg = entityService.mergeEntity(param, entityMap);
		}
		if (msg.success()) {
			return AjaxPageResponse.CLOSE_AND_REFRESH_PAGE("保存成功", "entity_list_" + menuId);
		} else {
			return AjaxPageResponse.FAILD("保存失败:"+getFuseMsgStr(msg)+getErrorMsgStr(msg));
		}
	}
	
	public static String getFuseMsgStr(IntegrationMsg msg) {
		Collection<Message> msgs = msg.getRefuse();
		return toString(msgs);
	}
	
	public static String getErrorMsgStr(IntegrationMsg msg) {
		Collection<Message> msgs = msg.getError();
		return toString(msgs);
	}

	private static String toCompleteString(Collection<Message> msgs) {
		if (msgs != null && !msgs.isEmpty()) {
			StringBuilder sb = new StringBuilder();
			msgs.forEach(m -> {
				sb.append(m.toString());
				sb.append(";");
			});
			return sb.toString();
		}else {
			return "";
		}
	}
	
	private static String toString(Collection<Message> msgs) {
		if (msgs != null && !msgs.isEmpty()) {
			StringBuilder sb = new StringBuilder();
			msgs.forEach(m -> {
				sb.append(m.getName());
				sb.append(";");
			});
			return sb.toString();
		}else {
			return "";
		}
	}

}
