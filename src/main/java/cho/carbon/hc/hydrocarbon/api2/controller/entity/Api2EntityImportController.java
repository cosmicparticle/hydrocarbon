package cho.carbon.hc.hydrocarbon.api2.controller.entity;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.hydrocarbon.admin.controller.modules.AdminModulesImportController;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.model.admin.service.AdminUserService;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityImportDictionary;
import cho.carbon.hc.hydrocarbon.model.modules.exception.ImportBreakException;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ImportTemplateCriteria;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplate;
import cho.carbon.hc.hydrocarbon.model.modules.service.ModulesImportService;
import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.JsonRequest;
import cn.sowell.copframe.dto.ajax.PollStatusResponse;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.copframe.spring.file.FileUtils;
import cn.sowell.copframe.web.poll.ProgressPollableThread;
import cn.sowell.copframe.web.poll.ProgressPollableThreadFactory;
import cn.sowell.copframe.web.poll.WorkProgress;

@RestController
@RequestMapping("/api2/entity/import")
public class Api2EntityImportController {

	@Resource
	ModulesImportService impService;
	
	@Resource
	ModulesService mService;
	
	@Resource
	FileUtils fileUtils;
	
	@Resource
	AuthorityService authService;
	
	@Resource
	AdminUserService uService; 
	
	Logger logger = Logger.getLogger(AdminModulesImportController.class);
	
	
	ProgressPollableThreadFactory pFactory = new ProgressPollableThreadFactory() {
		{
			setThreadExecutor(new ThreadPoolExecutor(6, 10, 5, TimeUnit.SECONDS, new SynchronousQueue<Runnable>()));
		}
	};
	
	
    @RequestMapping("/start/{menuId}")
	public ResponseJSON startImport(
			@RequestParam MultipartFile file,
			@PathVariable Long menuId,
			Integer fake,
			Integer exportFaildFile,
			ApiUser user) {
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		JSONObjectResponse jRes = new JSONObjectResponse();
        jRes.setStatus("error");
        ModuleMeta mData = mService.getModule(menu.getTemplateModule());
        if(mData != null) {
        	
        	Workbook wk = null;
        	Workbook copiedWorkbook = null;
        	try {
        		String fileName = file.getOriginalFilename();
        		boolean needExportFaildFile = Integer.valueOf(1).equals(exportFaildFile);
				if(fileName.endsWith(".xls")){
					wk = new HSSFWorkbook(file.getInputStream());
					copiedWorkbook = needExportFaildFile? new HSSFWorkbook(file.getInputStream()) : null;
        		}if(fileName.endsWith("xlsx")){
        			wk = new XSSFWorkbook(file.getInputStream());
        			copiedWorkbook = needExportFaildFile? new XSSFWorkbook(file.getInputStream()) : null;
        		}else{
        			jRes.put("msg", "文件格式错误，只支持xls和xlsx格式的文件。");
        		}
        	} catch (IOException e1) {
        		jRes.put("msg", "读取文件时发生错误");
        	}
        	Workbook copyWorkbook = copiedWorkbook;
        	if(wk != null){
        		Sheet sheet = wk.getSheetAt(0);
        		if(sheet != null){
        			final Workbook workbook = wk;
        			WorkProgress progress = new WorkProgress();
                	jRes.put("uuid", progress.getUUID());
                	ProgressPollableThread thread = pFactory.createThread(progress, p->{
                		impService.importData(sheet, p, menu.getTemplateModule(), user, 
                				!Integer.valueOf(1).equals(fake),
                				copyWorkbook);
                	}, (p,e)->{
                		if(e instanceof ImportBreakException) {
							logger.error("导入被用户停止", e);
						}else {
							logger.error("导入时发生未知异常", e);
						}
                	}, e->{
                		try {
    						workbook.close();
    					} catch (Exception e1) {
    						logger.error("关闭workbook时发生错误", e1);
    					}
                	});
        			thread.start();
        			jRes.setStatus("suc");
        			jRes.put("msg", "开始导入");
        		}else{
        			jRes.put("msg", "Excel文件内不存在表格");
        		}
        	}
        }else {
        	jRes.put("msg", "模块名不正确");
        }
        return jRes;
	}
	
    @RequestMapping("/status")
    public PollStatusResponse statusOfImport(HttpSession session,
    		@RequestParam String uuid, 
    		Boolean interrupted, 
    		Integer msgIndex, 
    		Integer maxMsgCount, 
    		ApiUser user){
		PollStatusResponse status = new PollStatusResponse();
		WorkProgress progress = pFactory.getProgress(uuid);
        if(progress != null){
            if(progress.isCompleted()){
            	status.setCompleted();
            	status.put("failedRowsFileUUID", progress.getDataMap().get("failedRowsFileUUID"));
            	pFactory.removeProgress(uuid);
            }else {
            	if(interrupted == true) {
            		pFactory.stopWork(uuid);
            	}
            	if(progress.isBreaked()) {
            		status.setBreaked();
            		pFactory.removeProgress(uuid);
            	}
            }
            status.setCurrent(progress.getCurrent());
        	status.setTotalCount(progress.getTotal());
        	if(msgIndex != null) {
        		status.setMessageSequence(progress.getLogger().getMessagesFrom(msgIndex, maxMsgCount));
        	}
        	status.put("message", progress.getLastMessage());
        	status.put("lastInterval", progress.getLastItemInterval());
        	status.setUUID(uuid);
        	status.setSuccessStatus();
        }else{
        	status.setStatus("no found import progress");
        }
        return status;
    }
    
    
    @RequestMapping("/dict/{menuId}")
    public ResponseJSON dictionary(@PathVariable Long menuId, ApiUser user) {
    	SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
    	JSONObjectResponse jRes = new JSONObjectResponse();
    	EntityImportDictionary dict = impService.getDictionary(menu.getTemplateModule(), user);
    	jRes.put("fieldDictionary", dict);
    	return jRes;
    }
    
	
	@RequestMapping("/tmpls/{menuId}")
	public ResponseJSON getImportTemplates(@PathVariable Long menuId, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		ImportTemplateCriteria criteria = new ImportTemplateCriteria();
		criteria.setModule(menu.getTemplateModule());
		criteria.setUserId((String) user.getId());
		List<ModuleImportTemplate> tmpls = impService.getImportTemplates(criteria);
		JSONArray jTmpls = new JSONArray();
		for (ModuleImportTemplate tmpl : tmpls) {
			JSONObject jTmpl = new JSONObject();
			jTmpl.put("id", tmpl.getId());
			jTmpl.put("title", tmpl.getTitle());
			jTmpl.put("updateTime", tmpl.getUpdateTime() != null? tmpl.getUpdateTime().getTime(): null);
			jTmpls.add(jTmpl);
		}
		res.put("tmpls", JSON.toJSON(tmpls));
		return res;
	}
	
	@RequestMapping("/tmpl/{menuId}/{tmplId}")
	public ResponseJSON getImportTemplate(@PathVariable Long menuId, @PathVariable Long tmplId, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();
		authService.validateUserL2MenuAccessable(user, menuId);
		ModuleImportTemplate tmpl = impService.getImportTempalte(tmplId);
		res.put("tmpl", JSON.toJSON(tmpl));
		return res;
	}
	
	@RequestMapping("/save_tmpl/{menuId}")
	public ResponseJSON saveTemplate(@PathVariable Long menuId, 
			@RequestBody JsonRequest jReq, ApiUser user) {
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		JSONObjectResponse jRes = new JSONObjectResponse();
		JSONObject reqJson = jReq.getJsonObject();
		ModuleImportTemplate tmpl = AdminModulesImportController.toImportTemplate(menu.getTemplateModule(), reqJson, user);
		if(tmpl != null) {
			Long tmplId = impService.saveTemplate(tmpl);
			jRes.put("tmplId", tmplId);
			jRes.setStatus("suc");
		}else {
			jRes.setStatus("ungenerate import template");
		}
		return jRes;
	}
	
	@RequestMapping("/download_tmpl/{tmplId}")
	public ResponseEntity<byte[]> download(
			@PathVariable Long tmplId, ApiUser user){
		ModuleImportTemplate tmpl = impService.getImportTempalte(tmplId);
		if(tmpl != null) {
			try {
				byte[] tmplInputStream = impService.createImportTempalteBytes(tmpl);
				HttpHeaders headers = new HttpHeaders();
				headers.setContentDispositionFormData("attachment", new String(
						("导入模板(" + tmpl.getTitle() + ")" + ".xlsx").getBytes("UTF-8"),
						"iso-8859-1"));
				headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
				return new ResponseEntity<byte[]>(tmplInputStream, headers, HttpStatus.CREATED);
			} catch (Exception e) {
				logger.error("下载导出文件时发生错误", e);
			}
		}
		return null;
	}
	
}
