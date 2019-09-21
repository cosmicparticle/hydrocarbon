package cho.carbon.hc.hydrocarbon.model.modules.pojo;

import java.util.Date;
import java.util.LinkedList;

public class ImportStatus {
	private Integer total;
	private Integer current;
	private boolean breakFlag = false;
	private LinkedList<Message> messages = new LinkedList<ImportStatus.Message>();
	private boolean endFlag = false;
	private long lastVeniTime;
	private long lastItemStartTime = 0;
	private long lastItemInterval = 0;
	
	public ImportStatus veni(){
		lastVeniTime = System.currentTimeMillis();
		return this;
	}
	public Integer getTotal() {
		return total;
	}
	public void setTotal(Integer total) {
		this.total = total;
	}
	public Integer getCurrent() {
		return current;
	}
	public void setCurrent(Integer current) {
		this.current = current;
	}
	
	public boolean breaked(){
		return breakFlag;
	}
	
	public void breakImport(){
		this.breakFlag = true;
	}
	
	public void setEnded(){
		this.endFlag  = true;
	}
	
	public boolean ended(){
		return endFlag;
	}
	
	public ImportStatus startItemTimer(){
		lastItemStartTime = System.currentTimeMillis();
		return this;
	}
	
	public ImportStatus endItemTimer(){
		lastItemInterval = System.currentTimeMillis() - lastItemStartTime;
		return this;
	}
	
	public String getCurrentMessage() {
		Message message = messages.getLast();
		if(message != null){
			return message.getMessage();
		}
		return null;
	}
	public void appendMessage(String msg) {
		this.messages.add(new Message(msg));
	}
	
	/**
	 * 获得最后两条消息之间的时间间隙
	 * @return
	 */
	public long lastInterval(){
		return lastItemInterval;
	}
	
	public long lastVeniInterval(){
		return System.currentTimeMillis() - lastVeniTime;
	}
	
	
	class Message{
		private String message;
		private Date createTime = new Date();
		
		public Message(String msg) {
			this.message = msg;
		}
		public String getMessage() {
			return message;
		}
		public void setMessage(String message) {
			this.message = message;
		}
		public Date getTime(){
			return createTime;
		}
	}
}
