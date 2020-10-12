const {
	ipcRenderer: ipc
} = nodeRequire('electron');

var getTime = function () {
	var now = new Date();
	var tmp = {
		mon: now.getMonth() + 1,
		day: now.getDate(),
		hour: now.getHours(),
		min: now.getMinutes(),
		sec: now.getSeconds(),
	};
	var year = now.getFullYear();
	for (let key in tmp) {
		if (tmp[key] < 10) {
			tmp[key] = "0" + tmp[key];
		}
	}
	return year + "-" + tmp.mon + "-" + tmp.day + " " + tmp.hour + ":" + tmp.min + ":" + tmp.sec;
};

var getDate = function () {
	var now = new Date();
	var tmp = {
		year: now.getFullYear(),
		mon: now.getMonth() + 1,
		day: now.getDate(),
	};
	for (let key in tmp) {
		if (tmp[key] < 10) {
			tmp[key] = "0" + tmp[key];
		}
	}
	return tmp.year + "-" + tmp.mon + "-" + tmp.day;
};

var app = new Vue({
	el: '#app',
	data: {
		selectedIndex: 0,
		tmpBuffer: null,
		isShowEdit: false,
		isShowSysMenu: false,
		noteList: [],
		currentDate: getDate(),
		dateRange: getDate() + " ~ " + getDate(),
		isListAll: false,
		mdConverter: new showdown.Converter(),
		slideTimmer: null,
	},
	methods: {
		moveTo: function (index) {
			var self = this;
			if (index != null) {
				this.selectedIndex = index;
			}
			if (self.noteList[self.selectedIndex] == null) {
				self.tmpBuffer = null;
				self.selectedIndex = 0;
				$(".scroll-list").css("transform", "translateX(0px)");
				return;
			}
			self.tmpBuffer = self.noteList[self.selectedIndex].content;
			self.dateRange = self.noteList[self.selectedIndex].enableRange;
			var move = -this.selectedIndex * 300 + 140;
			$(".scroll-list").css("transform", "translateX(" + move + "px)");
		},
		switchNote(index) {
			let self = this;
			self.chageToSave(function () {
				self.moveTo(index);
			});
		},
		toggleEditor() {
			let self = this;

			if (self.isShowEdit == true && self.isListAll == true) {
				self.getNote(self.currentDate);
				self.isListAll = false;
			}
			self.isShowEdit = self.isShowEdit ? false : true;

		},
		toggleSysMenu() {
			let self = this;
			self.isShowSysMenu = self.isShowSysMenu ? false : true;
		},
		chageToSave(callback) {
			var self = this;
			if (self.noteList.length != 0 && (self.noteList[self.selectedIndex].content != self.tmpBuffer || self.noteList[self.selectedIndex].enableRange != self.dateRange)) {
				layer.open({
					content: '是否保存修改？',
					closeBtn: 0,
					shade: 0,
					btn: ['确定', "取消"],
					yes: function (index, layero) {
						self.saveNote();
						callback();
						layer.close(index);
					},
					btn2: function (index, layero) {
						// 判断是否新增项，若是直接删除
						if (self.noteList[self.selectedIndex].id == null) {
							self.noteList.pop();
						}
						callback();
						layer.close(index);
					}
				});
			} else {
				callback();
			}
		},
		addNote: function () {
			let self = this;

			let tmpFun = function () {
				self.noteList.push({
					id: null,
					content: null,
					md: null,
					saveTime: null,
					enableRange: getDate() + " ~ " + getDate()
				});
				self.selectedIndex = self.noteList.length - 1;
				self.moveTo();
			};
			self.chageToSave(tmpFun);
		},
		deleteNote: function () {
			var self = this;
			let id = self.noteList[self.selectedIndex].id;
			function tmp() {
				self.noteList.splice(self.selectedIndex, 1);
				self.selectedIndex--;
				if (self.selectedIndex < 0) {
					self.selectedIndex = 0;
				}
				self.moveTo();
			}
			layer.confirm('确定删除该笔记？', {
				shade: 0
			}, function (index) {
				layer.close(index);
				if (id != null) {
					ipc.send("deleteNote", {
						id: id
					});
					// 删除笔记响应		
					ipc.once('deleteNote_res', (event, arg) => {
						if (arg.status == 1) {
							tmp();
						} else {
							console.error("删除失败");
						}
					});
				} else {
					tmp();
				}
			});

		},
		saveNote: function () {
			var self = this;
			self.noteList[self.selectedIndex].content = self.tmpBuffer;
			self.noteList[self.selectedIndex].md = self.mdConverter.makeHtml(self.noteList[self.selectedIndex].content);
			self.noteList[self.selectedIndex].saveTime = getTime();
			self.noteList[self.selectedIndex].enableRange = self.dateRange;
			if (self.noteList[self.selectedIndex].id == null) {
				ipc.send("addNote", {
					note: self.noteList[self.selectedIndex]
				});
				// 新增笔记响应		
				ipc.once('addNote_res', (event, arg) => {
					if (arg.status == 1) {
						self.noteList[self.selectedIndex].id = arg.id;
					} else {
						console.error("新增失败");
					}
				});
			} else {
				ipc.send("updateNote", {
					note: self.noteList[self.selectedIndex]
				});
				// 更新笔记响应		
				ipc.once('updateNote_res', (event, arg) => {
					if (arg.status == 1) {
						self.noteList[self.selectedIndex].id = arg.id;
					} else {
						console.error("更新失败");
					}
				});
			}

		},
		resetNote: function () {
			var self = this;
			self.tmpBuffer = self.noteList[self.selectedIndex].content;
			self.dateRange = self.noteList[self.selectedIndex].enableRange;
		},
		closeWindow: function () {
			layer.confirm('确定退出？', {
				shade: 0
			}, function (index) {
				ipc.send("closeWindow");
			});
		},
		getNote(selectedDate) {
			let self = this;
			ipc.send("getNotes", {
				date: selectedDate
			});
			// 获取数据响应		
			ipc.once('getNotes_res', (event, arg) => {
				if (arg.status == 1) {
					self.noteList = arg.list;
					self.moveTo();
				} else {
					console.error("获取笔记失败");
				}
			});
		},

		// 菜单功能
		menuAbout() {
			layer.open({
				title: '关于',
				content: "<h2 style='color:rgb(44,46,58);'>Simple Note</h2> \
						  <p>Version : 1.0.0</p> \
						  <p>Author : Jerry</p>\
						  <p>date : 2020-10-12 </p>"
			});
		},
		menuSet() {

		},
		menuAll() {
			let self = this;
			self.isListAll = self.isListAll ? false : true;
			if (self.isListAll) {
				self.getNote();
			} else {
				self.getNote(self.currentDate);
			}
		}
	},
	mounted: function () {
		var self = this;
		function slide() {
			if (self.isShowEdit || self.noteList.length <= 1) {
				return;
			}
			self.selectedIndex++;
			if (self.selectedIndex >= self.noteList.length) {
				self.selectedIndex = 0;
			}
			self.moveTo();
		}
		self.slideTimmer = setInterval(slide, 5000);

		$(".scroll-list").mouseenter(function () {
			clearInterval(self.slideTimmer);
			self.slideTimmer = null;
		});

		$(".scroll-list").mouseleave(function () {
			if (self.slideTimmer != null) {
				clearInterval(self.slideTimmer);
				self.slideTimmer = null;
			}
			self.slideTimmer = setInterval(slide, 5000);
		});

		//初始化日期控件
		layui.use('laydate', function () {
			var laydate = layui.laydate;
			laydate.render({
				elem: '#enableDateInput',
				range: "~",
				trigger: 'click',
				done: function (value, date, endDate) {
					console.log(value);
					self.dateRange = value;
				}
			});
		});

		// 获取数据
		self.getNote(self.currentDate);
	}
});