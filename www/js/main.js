// JavaScript for label effects only
$(window).load(function(){
    $(".col-3 input").val("");
    
    $(".input-effect input").focusout(function(){
        if($(this).val() != ""){
            $(this).addClass("has-content");
        }else{
            $(this).removeClass("has-content");
        }
    })
});

function publicSwitch() {
    if($('#groupPublicInput').prop('checked')) {
        $('#groupPublicInput').prop('checked', false);
        $('.switch__label').html('비공개');
    } else {
        $('#groupPublicInput').prop('checked', true);
        $('.switch__label').html('공개');
    }
    console.log($('#groupPublicInput').prop('checked'));
}