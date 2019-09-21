package cho.carbon.hc.hydrocarbon.admin.controller.modules;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.entityResolver.EntityConstants;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.modules.exception.ImportBreakException;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ImportTemplateCriteria;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplate;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplateField;
import cho.carbon.hc.hydrocarbon.model.modules.service.ModulesImportService;
import cn.sowell.copframe.common.UserIdentifier;
import cn.sowell.copframe.dao.utils.UserUtils;
import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.JsonRequest;
import cn.sowell.copframe.dto.ajax.PollStatusResponse;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.copframe.spring.file.FileUtils;
import cn.sowell.copframe.utils.CollectionUtils;
import cn.sowell.copframe.utils.TextUtils;
import cn.sowell.copframe.web.poll.ProgressPollableThread;
import cn.sowell.copframe.web.poll.ProgressPollableThreadFactory;
import cn.sowell.copframe.web.poll.WorkProgress;

@Controller
@RequestMapping(AdminConstants.URI_MODULES + "/import")
public class AdminModulesImportController {
	public static final String SESSION_KEY_FIELD_NAMES = "field_names_";

	@Resource
	ModulesImportService impService;
	
	@Resource
	ModulesService mService;
	
	@Resource
	FileUtils fileUtils;
	
	@Resource
	AuthorityService authService;
	
	Logger logger = Logger.getLogger(AdminModulesImportController.class);
	
	
	ProgressPollableThreadFactory pFactory = new ProgressPollableThreadFactory() {
		{
			setThreadExecutor(new ThreadPoolExecutor(6, 10, 5, TimeUnit.SECONDS, new SynchronousQueue<Runnable>()));
		}
	};
	
	@RequestMapping("/go/{menuId}")
	public String goImport(@PathVariable Long menuId, Model model) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		ModuleMeta mMeta = mService.getModule(menu.getTemplateModule());
		model.addAttribute("module", mMeta);
		model.addAttribute("menu", menu);
		return AdminConstants.JSP_MODULES + "/modules_import_tmpl.jsp";
	}
	
	@ResponseBody
	@RequestMapping("/resolve_file/{menuId}")
	public ResponseJSON resolveFile(@PathVariable Long menuId, MultipartFile file) {
		authService.validateL2MenuAccessable(menuId);
		JSONObjectResponse jRes = new JSONObjectResponse();
		String fileName = file.getOriginalFilename();
		String suffix = null;
    	Workbook wk = null;
    	try {
    		if(fileName.endsWith(".xls")){
    			wk = new HSSFWorkbook(file.getInputStream());
    			suffix = ".xls";
    		}if(fileName.endsWith("xlsx")){
    			wk = new XSSFWorkbook(file.getInputStream());
    			suffix = ".xlsx";
    		}else{
    			jRes.put("msg", "文件格式错误，只支持xls和xlsx格式的文件。");
    		}
    	} catch (IOException e1) {
    		jRes.put("msg", "读取文件时发生错误");
    	}
    	if(wk != null){
    		int sheetCount = wk.getNumberOfSheets();
    		LinkedHashSet<String> names = new LinkedHashSet<>();
    		for (int i = 0; i < sheetCount; i++) {
				names.add(wk.getSheetName(i));
			}
    		jRes.put("names", names);
    		String uuid = TextUtils.uuid();
			try {
				fileUtils.saveFile(uuid + suffix, file.getInputStream());
				jRes.put("fileName", uuid + suffix);
				jRes.setStatus("suc");
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    	}
		return jRes;
	}
	
	@ResponseBody
    @RequestMapping("/do/{menuId}")
	public ResponseJSON doImport(
			@RequestParam MultipartFile file,
			@PathVariable Long menuId) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		JSONObjectResponse jRes = new JSONObjectResponse();
        jRes.setStatus("error");
        ModuleMeta mData = mService.getModule(menu.getTemplateModule());
        if(mData != null) {
        	
        	Workbook wk = null;
        	try {
        		String fileName = file.getOriginalFilename();
				if(fileName.endsWith(".xls")){
					wk = new HSSFWorkbook(file.getInputStream());
        		}if(fileName.endsWith("xlsx")){
        			wk = new XSSFWorkbook(file.getInputStream());
        		}else{
        			jRes.put("msg", "文件格式错误，只支持xls和xlsx格式的文件。");
        		}
        	} catch (IOException e1) {
        		jRes.put("msg", "读取文件时发生错误");
        	}
        	if(wk != null){
        		Sheet sheet = wk.getSheetAt(0);
        		if(sheet != null){
        			final Workbook workbook = wk;
        			UserIdentifier user = UserUtils.getCurrentUser();
        			WorkProgress progress = new WorkProgress();
                	jRes.put("uuid", progress.getUUID());
                	ProgressPollableThread thread = pFactory.createThread(progress, p->{
                		impService.importData(sheet, p, menu.getTemplateModule(), user, true, null);
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
	
	@ResponseBody
    @RequestMapping("/status")
    public PollStatusResponse statusOfImport(HttpSession session,
    		@RequestParam String uuid, 
    		Boolean interrupted, 
    		Integer msgIndex){
		PollStatusResponse status = new PollStatusResponse();
		WorkProgress progress = pFactory.getProgress(uuid);
        if(progress != null){
            if(progress.isCompleted()){
            	status.setCompleted();
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
        		status.setMessageSequence(progress.getLogger().getMessagesFrom(msgIndex));
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
	
	/*@ResponseBody
    @RequestMapping("/break")
    public JSONObjectResponse breakImport(HttpSession session, @RequestParam String uuid){
        JSONObjectResponse jRes = new JSONObjectResponse();
        ImportStatus importStatus = (ImportStatus) session.getAttribute(AdminConstants.KEY_IMPORT_STATUS + uuid);
        if(importStatus != null){
            importStatus.breakImport();
            jRes.setStatus("suc");
        }
        return jRes;
    }*/
	
	@RequestMapping("/tmpl/{menuId}")
	public String tmpl(
			@PathVariable Long  menuId,
			Model model
			) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		UserIdentifier user = UserUtils.getCurrentUser();
		ModuleMeta mMeta = mService.getModule(menu.getTemplateModule());
		ImportTemplateCriteria criteria = new ImportTemplateCriteria();
		criteria.setModule(menu.getTemplateModule());
		criteria.setUserId((String) user.getId());
		List<ModuleImportTemplate> tmpls = impService.getImportTemplates(criteria);
		model.addAttribute("tmpls", tmpls);
		model.addAttribute("module", mMeta);
		model.addAttribute("menu", menu);
		model.addAttribute("relationLabelKey", EntityConstants.LABEL_KEY);
		
		return AdminConstants.JSP_MODULES + "/modules_import_download.jsp";
	}
	
	@RequestMapping("/tmpl/show/{menuId}/{tmplId}")
	public String showTemplate(@PathVariable Long menuId, @PathVariable Long tmplId, Model model) {
		authService.validateL2MenuAccessable(menuId);
		ModuleImportTemplate tmpl = impService.getImportTempalte(tmplId);
		model.addAttribute("tmpl", tmpl);
		model.addAttribute("tmplFieldsJson", JSON.toJSON(tmpl.getFields()));
		return tmpl(menuId, model);
	}
	
	@ResponseBody
	@RequestMapping("/submit_field_names/{menuId}")
	public ResponseJSON submitFieldNames(@PathVariable Long menuId, 
			@RequestBody JsonRequest jReq, HttpSession session) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		JSONObjectResponse jRes = new JSONObjectResponse();
		JSONObject reqJson = jReq.getJsonObject();
		ModuleImportTemplate tmpl = toImportTemplate(menu.getTemplateModule(), reqJson, UserUtils.getCurrentUser());
		if(tmpl != null) {
			Long tmplId = impService.saveTemplate(tmpl);
			String uuid = TextUtils.uuid();
			session.setAttribute(SESSION_KEY_FIELD_NAMES + uuid, tmplId);
			jRes.put("uuid", uuid);
		}
		return jRes;
	}
	
	@RequestMapping("/download_tmpl/{uuid}")
	public ResponseEntity<byte[]> download(@PathVariable String uuid, HttpSession session){
		Long tmplId = (Long) session.getAttribute(SESSION_KEY_FIELD_NAMES + uuid);
		ModuleImportTemplate tmpl = impService.getImportTempalte(tmplId);
		if(tmpl != null) {
			try {
				byte[] tmplInputStream = impService.createImportTempalteBytes(tmpl);
				HttpHeaders headers = new HttpHeaders();
				headers.setContentDispositionFormData("attachment", new String(
						(tmpl.getTitle() + ".xlsx").getBytes("UTF-8"),
						"iso-8859-1"));
				headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
				return new ResponseEntity<byte[]>(tmplInputStream, headers, HttpStatus.CREATED);
			} catch (Exception e) {
				logger.error("下载导出文件时发生错误", e);
			}
		}
		return null;
	}
	
	@ResponseBody
	@RequestMapping("/save_tmpl/{menuId}")
	public ResponseJSON saveTmpl(
			@PathVariable Long menuId, 
			@RequestBody JsonRequest jReq) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		JSONObjectResponse jRes = new JSONObjectResponse();
		JSONObject reqJson = jReq.getJsonObject();
		try {
			ModuleImportTemplate tmpl = toImportTemplate(menu.getTemplateModule(), reqJson, UserUtils.getCurrentUser());
			Long tmplId = impService.saveTemplate(tmpl);
			jRes.put("tmplId", tmplId);
			jRes.put("tmplTitle", tmpl.getTitle());
			jRes.setStatus("suc");
		} catch (Exception e) {
			logger.error("保存导入模板时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}

	public static ModuleImportTemplate toImportTemplate(String module, JSONObject reqJson, UserIdentifier user) {
		Assert.hasText(module);
		
		JSONArray fieldArray = reqJson.getJSONArray("fields");
		if(fieldArray != null && !fieldArray.isEmpty()) {
			Set<ModuleImportTemplateField> fields = new LinkedHashSet<ModuleImportTemplateField>();
			CollectionUtils.appendTo(fieldArray, fields, item->{
				JSONObject fieldItem = (JSONObject) item; 
				ModuleImportTemplateField field = new ModuleImportTemplateField();
				field.setId(fieldItem.getLong("id"));
				field.setFieldId(fieldItem.getInteger("fieldId"));
				field.setCompositeId(fieldItem.getInteger("compositeId"));
				field.setFieldIndex(fieldItem.getInteger("fieldIndex"));
				return field;
			});
			int order = 1;
			for (ModuleImportTemplateField field : fields) {
				field.setOrder(order++);
			}
			String title = reqJson.getString("title");
			if(!TextUtils.hasText(title)) {
				title = "导入模板";
			}
			ModuleImportTemplate importTmpl = new ModuleImportTemplate();
			importTmpl.setTitle(title);
			importTmpl.setFields(fields);
			importTmpl.setModule(module);
			importTmpl.setCreateUserCode((String) user.getId());
			Long tmplId = reqJson.getLong("tmplId");
			if(tmplId != null) {
				importTmpl.setId(tmplId);
			}
			return importTmpl;
		}
		return null;
	}
	
	
	
	
}
