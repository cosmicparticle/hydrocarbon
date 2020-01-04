package cho.carbon.hc.hydrocarbon.api2.controller.entity;

import javax.annotation.Resource;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.PollStatusResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.dto.page.CommonPageInfo;
import cho.carbon.hc.copframe.dto.page.PageInfo;
import cho.carbon.hc.copframe.utils.date.FrameDateFormat;
import cho.carbon.hc.copframe.web.poll.WorkProgress;
import cho.carbon.hc.dataserver.model.abc.service.EntityQueryParameter;
import cho.carbon.hc.dataserver.model.abc.service.ModuleEntityService;
import cho.carbon.hc.dataserver.model.modules.bean.ExportDataPageInfo;
import cho.carbon.hc.dataserver.model.modules.pojo.EntityVersionItem;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQuery;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQueryPool;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.ArrayItemFilterService;
import cho.carbon.hc.dataserver.model.tmpl.service.DetailTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.entityResolver.ModuleEntityPropertyParser;
import cho.carbon.hc.hydrocarbon.SessionKey;
import cho.carbon.hc.hydrocarbon.api2.controller.Api2Constants;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.common.EntityQueryPoolUtils;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailParamter;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailResult;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.modules.bean.ExportFileResource;
import cho.carbon.hc.hydrocarbon.model.modules.service.ExportService;

@RestController
@RequestMapping(Api2Constants.URI_ENTITY + "/export")
public class Api2EntityExportController {
	
	@Resource
	ExportService eService;
	@Resource
	FrameDateFormat dateFormat;
	
	@Resource
	AuthorityService authService;
	
	@Resource
	TemplateGroupService tmplGroupService;
	
	static Logger logger = Logger.getLogger(Api2EntityExportController.class);
	
	
	@RequestMapping("/session_progress")
	public ResponseJSON getExportProgress(ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		//导出状态获取
		String uuid = (String) user.getCache(SessionKey.EXPORT_ENTITY_STATUS_UUID);
		if(uuid != null){
			WorkProgress progress = eService.getExportProgress(uuid);
			if(progress != null && !progress.isBreaked()){
				jRes.put("progressUUID", progress.getUUID());
			}
		}
		return jRes;
	}
	
	
	@Resource
	DetailTemplateService dtmplService;
	
	@Resource
	ModuleEntityService entityService;
	
	@Resource
	ArrayItemFilterService arrayItemFilterService;
	
	@RequestMapping({"/detail/{validateSign:\\d+}/{entityCode}",
						"/detail/{validateSign:user}",
						"/detail/{validateSign:user}/*"})
	public ResponseJSON detail(
				@PathVariable String validateSign, 
				@PathVariable(required=false) String entityCode,
				Long versionCode,
				Long nodeId,
				Long fieldGroupId,
				Long dtmplId,
				ApiUser user) {
		ValidateDetailParamter vparam = new ValidateDetailParamter(validateSign, user);
		vparam
			.setCode(entityCode)
			.setNodeId(nodeId)
			.setFieldGroupId(fieldGroupId)
			.setDetailTemplateId(dtmplId)
			;
		//检测用户的权限
		ValidateDetailResult vResult = authService.validateDetailAuth(vparam);
		TemplateDetailTemplate dtmpl = vResult.getDetailTemplate();
		JSONObjectResponse jRes = new JSONObjectResponse();
		//获得实体对象
		EntityQueryParameter queryParam = new EntityQueryParameter(dtmpl.getModule(), vResult.getEntityCode(), user);
		queryParam.setArrayItemCriterias(arrayItemFilterService.getArrayItemFilterCriterias(dtmpl.getId(), user));
		ModuleEntityPropertyParser entity = entityService.getEntityParser(queryParam);
		
		EntityVersionItem lastHistory = entityService.getLastHistoryItem(queryParam);
		if(versionCode != null && lastHistory != null && !versionCode.equals(lastHistory.getCode())) {
			entity = entityService.getHistoryEntityParser(queryParam, versionCode, null);
        }
        if(entity == null) {
        	entity = entityService.getEntityParser(queryParam);
        }
		
		try {
			String uuid = eService.exportDetailExcel(entity, dtmpl);
			if(uuid != null) {
				jRes.put("uuid", uuid);
				jRes.setStatus("suc");
			}
		} catch (Exception e) {
			logger.error("导出时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}
	
	/**
	 * 
	 * @param queryKey
	 * @param scope 查询范围，可取值包括all和current
	 * @param withDetail 为true时，同时会导出
	 * @param rangeStart 当scope为all时，导出的起始序号
	 * @param rangeEnd 当scope为all时，导出的终止序号
	 * @param session 
	 * @param user 
	 * @return
	 */
	@RequestMapping("/start/{menuId}/{queryKey}")
	public ResponseJSON startExport(
			@PathVariable String queryKey,
			@PathVariable Long menuId,
			ExportDataPageInfo ePageInfo,
			Boolean withDetail,
			ApiUser user
			) {
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		JSONObjectResponse jRes = new JSONObjectResponse();
		//导出状态获取
		String uuid = (String) user.getCache(SessionKey.EXPORT_ENTITY_STATUS_UUID);
		if(uuid != null){
			WorkProgress progress = eService.getExportProgress(uuid);
			if(progress != null && !progress.isBreaked()){
				jRes.setStatus("denied");
				jRes.put("message", "当前已经存在正在导出的进程");
			}
		}
		
		EntityQueryPool pool = EntityQueryPoolUtils.getEntityQueryPool(user);
		EntityQuery query = pool.getQuery(queryKey);
		if(query != null) {
			WorkProgress progress = new WorkProgress();
			PageInfo pageInfo = new CommonPageInfo();
			pageInfo.setPageNo(query.getPageNo());
			pageInfo.setPageSize(query.getPageSize());
			ePageInfo.setPageInfo(pageInfo);
			eService.startWholeExport(progress, query, ePageInfo, withDetail);
			jRes.put("uuid", progress.getUUID());
			progress.getDataMap().put("queryKey", queryKey);
			progress.getDataMap().put("menuId", menu.getId());
			progress.getDataMap().put("menuTitle", menu.getTitle());
			progress.getDataMap().put("exportPageInfo", ePageInfo);
			progress.getDataMap().put("withDetail", withDetail);
			user.setCache(SessionKey.EXPORT_ENTITY_STATUS_UUID, progress.getUUID());
		}
		return jRes;
	}
	
	@RequestMapping("/status")
	public PollStatusResponse statusOfExport(@RequestParam String uuid, Boolean interrupted, ApiUser user){
		PollStatusResponse status = new PollStatusResponse();
		status.put("uuid", uuid);
		WorkProgress progress = eService.getExportProgress(uuid);
		if(progress != null){
			progress.veni();
			if(Boolean.TRUE.equals(interrupted)){
				eService.stopExport(uuid);
				status.setBreaked();
			}else{
				status.setCurrent(progress.getCurrent());
				status.setTotalCount(progress.getTotal());
				if(progress.isCompleted()) {
					status.setCompleted();
				}else if(progress.isBreaked()) {
					status.setBreaked();
				}
				status.setStatusMessage(progress.getLastMessage());
				status.putData(progress.getResponseData());
			}
			status.setSuccessStatus();
		}else{
			status.setStatus("error");
			status.setStatusMessage("导出已超时，请重新导出");
		}
		return status;
	}
	
	@RequestMapping("/download/{uuid}")
	public ResponseEntity<byte[]> download(@PathVariable String uuid, ApiUser user){
		ExportFileResource resource = eService.getDownloadResource(uuid);
		if(resource != null) {
			try {
				HttpHeaders headers = new HttpHeaders();
				headers.setContentDispositionFormData("attachment", new String(
						resource.getExportName().getBytes("UTF-8"),
						"iso-8859-1"));
				headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
				return new ResponseEntity<byte[]>(FileUtils.readFileToByteArray(resource.getFile().getFile()), headers, HttpStatus.CREATED);
			} catch (Exception e) {
				logger.error("下载导出文件时发生错误", e);
			}
		}
		return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}
	
	@RequestMapping("/work/{uuid}")
	public ResponseJSON loadWork(@PathVariable String uuid, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		WorkProgress progress = eService.getExportProgress(uuid);
		if(progress != null) {
			jRes.put("queryKey", progress.getDataMap().get("queryKey"));
			jRes.put("menuId", progress.getDataMap().get("menuId"));
			jRes.put("menuTitle", progress.getDataMap().get("menuTitle"));
			jRes.put("uuid", uuid);
			ExportDataPageInfo ePageInfo = (ExportDataPageInfo) progress.getDataMap().get("exportPageInfo");
			jRes.put("scope", ePageInfo.getScope());
			jRes.put("rangeStart", ePageInfo.getRangeStart());
			jRes.put("rangeEnd", ePageInfo.getRangeEnd());
			jRes.put("withDetail", progress.getDataMap().get("withDetail"));
		}
		return jRes;
	}
}
