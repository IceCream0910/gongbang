var selectedDate = new Date();
var nowDate = moment(new Date()).format('YYYYMMDD');

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBSfxqNJ3oqKOy2ttFR7SfTHsgZnu3HFsE",
    authDomain: "gongbang-5cf69.firebaseapp.com",
    projectId: "gongbang-5cf69",
    storageBucket: "gongbang-5cf69.appspot.com",
    messagingSenderId: "550274824511",
    appId: "1:550274824511:web:7dd4da4ab49c394b213b8a",
    measurementId: "G-YM600EEXBL",
    databaseURL: "https://gongbang-5cf69-default-rtdb.firebaseio.com"

};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
    var database = firebase.database();
}



//vue
const app = Vue.createApp({
    data(){
      return {
        newTodo: "",
        todoList: [],
        userid_global: "",
      }
    },
    methods: {
      editMode(todo){
        todo.text = todo.text.trim();
        
        if(todo.text.length > 0){
           todo.edit = !todo.edit;
        }
      },
      deleteTodo(todo){
        this.todoList = this.todoList.filter(t => t.id != todo.id) 
    },
      addTodo(){
        if(this.newTodo.trim().length > 0){
          this.todoList.push({
            id: new Date().getTime(),
            text: this.newTodo.trim(),
            completed: false,
            edit: false
          });
        }
        this.newTodo = "";
      },
      todoFirebaseUpdate(){
$.ajax({
    type: "GET",
    url: "../auth/profile",
    success: function(result) {
        if (result != "unlogin") {
            userid = result.id;
            this.userid_global = userid;
            if(app.$data.todoList) {
                var pushedDate = moment(selectedDate).format('YYYYMMDD');
                firebase.database().ref('users/'+userid+'/').child('todoData').child(pushedDate).set(app.$data.todoList);
            }
        }
    }
});
      }
    },
    watch: {
        todoList: {
            deep: true,
            // todoList data가 변경되었을 때
            handler() {
                if(app.$data.todoList) {
                    this.todoFirebaseUpdate();
                }
                
            }
        },
    },
    computed: {
      completedCount(){
        return this.todoList.filter(t => t.completed).length;
      }
    }
  }).mount("#app");
//vue end


var cnt=0;
for(var i=-3; i<4; i++) {
    var now = new Date();
    cDate =  new Date(now.setDate(now.getDate() + i));

    var week = ['일', '월', '화', '수', '목', '금', '토']; var dayOfWeek = week[cDate.getDay()];

    if(i==0) {
        $('.calendar').append('<div class="calendar-item today active" onclick="javascript:selectDate(\''+cDate+'\', this);"><span>'+dayOfWeek+'</span><br><span>'+cDate.getDate()+'</span></div>')
    } else {
        $('.calendar').append('<div class="calendar-item" onclick="javascript:selectDate(\''+cDate+'\', this);"><span>'+dayOfWeek+'</span><br><span>'+cDate.getDate()+'</span></div>')
    }

   
    cnt++;
}

var elements = document.getElementsByClassName("calendar-item");

function selectDate(date, target) {
    $(target).addClass('active');
    $(elements).not(target).removeClass('active');
    selectedDate = date;

    //데이터 베이스 갱신
    var uid= ''
    var userInfo = [];
    $.ajax({
        type: "GET",
        url: "../auth/profile",
        success: function(result) {
            var cnt =0;
            if (result != "unlogin") {
                uid = result.id;
                //console.log(uid);
                var leadsRef = firebase.database().ref('users/'+uid);
    leadsRef.on('value', function(snapshot) {
        userInfo = [];
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          userInfo[cnt] = childData;
          cnt++;
        });
        userInfo.filter((a) => a);
        if(userInfo[6]) {
            var targetDate = moment(selectedDate).format('YYYYMMDD');
            var result = userInfo[6][targetDate];
            if(result) {
              app.$data.todoList = result
            } else {
                app.$data.todoList = []
            }
           
        }
    });
            }
        }
    });
}


var uid= ''
var userInfo = [];
$.ajax({
    type: "GET",
    url: "../auth/profile",
    success: function(result) {
        var cnt =0;
        if (result != "unlogin") {
            uid = result.id;
            //console.log(uid);
            var leadsRef = firebase.database().ref('users/'+uid);
leadsRef.on('value', function(snapshot) {
    userInfo = [];
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
      userInfo[cnt] = childData;
      cnt++;
    });
    userInfo.filter((a) => a);
    console.log(userInfo);
    if(userInfo[6]) {
        var targetDate = moment(selectedDate).format('YYYYMMDD');
        var result = userInfo[6][targetDate];
        if(userInfo[6][nowDate]) {
          var todayResult = userInfo[6][nowDate];
          var todayTotalCheckList = todayResult.length;
          var todayTotalCompletions = 0;
          $.each(todayResult, function(idx, row) {
              if(todayResult[idx].completed == true) {
                todayTotalCompletions++;
              }
          })
          
          var todayProgress = parseInt(todayTotalCompletions/todayTotalCheckList*100);
          $('#today-progress').html(todayProgress+'%');
          firebase.database().ref('users/'+uid+'/todayProgress').set(todayProgress);
  
        }else {
          var todayProgress = 0;
          $('#today-progress').html(todayProgress+'%');
          firebase.database().ref('users/'+uid+'/todayProgress').set(todayProgress);
  
        }
       
        if(result) {
          app.$data.todoList = result
        } else {
            app.$data.todoList = []
        }
       
    }
});
        }
    }
});
