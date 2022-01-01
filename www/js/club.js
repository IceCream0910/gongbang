
console.log("club.js", userid);
var joinedClubId;
var groupIdsList = [];
var groupsList = [];

var leadsRef = database.ref('users/'+userid);
leadsRef.on('value', function(snapshot) {
    var cnt =0;
    var userInfo_ForGroup = [];
    snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        userInfo_ForGroup[cnt] = childData;
        cnt++;
    });
    userInfo_ForGroup.filter((a) => a);
    joinedClubId = userInfo_ForGroup[2]; //현재 가입된 그룹 id 저장(없으면 none)

    console.log(joinedClubId);

    if(joinedClubId == 'none' || joinedClubId==null || joinedClubId==undefined) {
        $('#friends-noneGroup').show();
        $('#friends-active').hide();
        $('#groupScreen-noneGroup').show();
        $('#groupScreen-active').hide();
        $('#createGroupFloatingButton').show();
        $('#exitGroupFloatingButton').hide();
    } else {
        //스터디그룹 가입 되어있음
        $('#friends-noneGroup').hide();
        $('#friends-active').show();
        $('#groupScreen-noneGroup').hide();
        $('#groupScreen-active').show();
        $('#createGroupFloatingButton').hide();
        $('#exitGroupFloatingButton').show();
    }
});

var groupsRef = database.ref('groups/');
groupsRef.on('value', function(snapshot) {
    if(snapshot.val() != null) {
        var data = snapshot.val();
        groupIdsList = Object.values((data.idsList));
        groupsList = data;
        drawGroupList(data);
        console.log(groupIdsList);
        getMyGroupInfo();
    }
});

function drawGroupList(data) {
    var length = groupIdsList.length;
    for(var i=0; i<length; i++) {
        var key = groupIdsList[i];
        console.log(data[key]);
        $('#groupList').prepend('<div class="cards group-cards" onclick="javascript:openGroupJoinModal(\''+data[key].id+'\');"><div class="card-item"><div class="card-info"><h3 class="card-title" style="font-size:18px;">'+data[key].name+'</h3> <p class="card-intro">'+data[key].description+'</p><p class="card-intro"></p></div></div></div>');

    }
}

function clearAddGroupForm() {
    $(".col-3 input").val("");
    $('#groupPublicInput').prop('checked', true);
    $('.switch__label').html('공개');
}

function addGroupBtn() {
    var name = $('#groupNameInput').val();
    var description = $('#groupDescriptionInput').val();
    var isPublic = $('#groupPublicInput').prop('checked');

    console.log(name, description);
    if(name=='' || name==null || description=='' || description==null) {
        $('#error').html('모든 항목을 입력해주세요.');
        setTimeout(function() {
            $('#error').html('');

          }, 3000);
        
    } else {
        makeGroup(name, description, isPublic);
        $('#createGroup-modal-overlay, #createGroup-modal').removeClass('active');
    }
}

function makeGroup(name, description, isPublic) {
    var groupid = '';
    while(checkDuplication(groupid) || groupid=='') {
        var groupid = generateId(); //중복인 경우 다시 생성
    } 
       firebase.database().ref('groups/' + groupid + '/').set({
                id: groupid,
                name: name,
                description: description,
                isPublic : isPublic,
                hostUserId : userid
            });
        
        firebase.database().ref('groups/idsList').push(groupid);
        firebase.database().ref('users/'+userid+'/joinedClub').update(groupid);
   
}

function generateId() {
        return Math.random().toString(36).substr(2, 16);
}

function checkDuplication(data) {
    var duplicationNum = groupIdsList.indexOf(data);
    if(duplicationNum > 0) {
        return true; //중복 있음
    }else {
        return false; //중복 없음    
    }
}

function openGroupJoinModal(groupid) {
    $('#groupId').html(groupid);
    groupData= groupsList[groupid];
    var title = groupData.name;
    var description = groupData.description;
    var hostUserId = groupData.hostUserId;
    $('#groupInfo-modal-overlay, #groupInfo-modal').addClass('active');
    $('#groupinfo-title').html(title);
    $('#groupinfo-description').html(description);
} 

function joinGroupBtn() {
   var groupid_forJoin =  $('#groupId').html();
   console.log(groupid_forJoin);
   firebase.database().ref('users/'+userid+'/joinedClub').set(groupid_forJoin);
   $('#groupInfo-modal-overlay, #groupInfo-modal').removeClass('active');
//스터디그룹 가입 되어있음
$('#friends-noneGroup').hide();
$('#friends-active').show();
$('#groupScreen-noneGroup').hide();
$('#groupScreen-active').show();
$('#createGroupFloatingButton').hide();
$('#exitGroupFloatingButton').show();
joinedClubId = groupid_forJoin;
getMyGroupInfo();
}

function getMyGroupInfo() {
    var groupData = groupsList[joinedClubId];
    
    var title = groupData.name;
    var description = groupData.description;
    var hostUserId = groupData.hostUserId;
    $('#groupPage-title').html(title);
    $('#groupPage-description').html(description);

}