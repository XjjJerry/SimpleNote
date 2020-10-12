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
		mdConverter: new showdown.Converter()
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
			var move = -this.selectedIndex * 300 + 140;
			$(".scroll-list").css("transform", "translateX(" + move + "px)");
		},
		toggleEditor() {
			let self = this;
			self.isShowEdit = self.isShowEdit ? false : true;
		},
		toggleSysMenu() {
			let self = this;
			self.isShowSysMenu = self.isShowSysMenu ? false : true;
		},
		addNote: function () {
			var self = this;

			var tmpFun = function () {
				self.noteList.push({
					content: null,
					md: null,
					saveTime: null
				});
				self.selectedIndex = self.noteList.length - 1;
				self.moveTo();
			};

			if (self.noteList.length != 0 && self.noteList[self.selectedIndex].content != self.tmpBuffer) {
				layer.open({
					content: '是否保存修改？',
					closeBtn: 0,
					shade: 0,
					btn: ['确定', "取消"],
					yes: function (index, layero) {
						self.saveNote();
						tmpFun();
						layer.close(index);
					},
					btn2: function (index, layero) {
						tmpFun();
						layer.close(index);
					}
				});
			} else {
				tmpFun();
			}
		},
		deleteNote: function () {
			var self = this;
			layer.confirm('确定删除该笔记？', {
				shade: 0
			}, function (index) {
				self.noteList.splice(self.selectedIndex, 1);
				self.selectedIndex--;
				if (self.selectedIndex < 0) {
					self.selectedIndex = 0;
				}
				self.moveTo();
				layer.close(index);
				ipc.send("saveNotes", {
					date: self.currentDate,
					list: self.noteList
				});
			});

		},
		saveNote: function () {
			var self = this;
			self.noteList[self.selectedIndex].content = self.tmpBuffer;
			self.noteList[self.selectedIndex].md = self.mdConverter.makeHtml(self.noteList[self.selectedIndex].content);
			self.noteList[self.selectedIndex].saveTime = getTime();

			ipc.send("saveNotes", {
				date: self.currentDate,
				list: self.noteList
			});
		},
		resetNote: function () {
			var self = this;
			self.tmpBuffer = self.noteList[self.selectedIndex].content;
		},
		closeWindow: function () {
			layer.confirm('确定退出？', {
				shade: 0
			}, function (index) {
				ipc.send("closeWindow");
			});
		},
		getNote() {
			let self = this;
			ipc.send("getNotes", {
				date: self.currentDate
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

		}
	},
	mounted: function () {
		var self = this;
		setInterval(function () {
			if (self.isShowEdit || self.noteList.length <= 1) {
				return;
			}
			self.selectedIndex++;
			if (self.selectedIndex >= self.noteList.length) {
				self.selectedIndex = 0;
			}
			self.moveTo();
		}, 5000);

		ipc.on('returnNotes', (event, arg) => {
			// console.log("+++++++++++++++++");
			// console.log(arg);
			self.noteList = arg.list;
			self.currentDate = arg.date;
			self.moveTo();
		});

		self.getNote();
	}
});