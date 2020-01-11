 
$(document).ready(function(){
   $('.sidenav').sideNav();

   //flash alerts
   var notice = $('.flash-notice')[0].innerText;
   var alert = $('.flash-alert')[0].innerText;

   if( notice  && notice.replace(/^\s+|\s+$/g,'').length >= 1 ) M.toast( notice,2000  )
   if( alert && alert.replace(/^\s+|\s+$/g,'').length >= 1  ) M.toast( alert,2000 )


 });
