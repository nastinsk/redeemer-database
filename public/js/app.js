'use strict';

//Toggle form show for church or pastor
$('.add-church-form').hide();
$('.add-pastor-form').hide();
$('#single-pastor-edit-form').hide();
$('#single-church-edit-form').hide();
$('.line-break').hide();

// TODO: Determine if I want to hide the line-break... Could move where the div is and hide/show it before the toggle it was not affected by the div being toggled. Might solve the delay problem.

$('.update').on('click', function() {
  if($('.update').hasClass('pastor-update') === true){
    $("#single-pastor").toggle();
    $('#single-pastor-edit-form').toggle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if ($('.update').hasClass('church-update') === true){
    $("#single-church").toggle();
    $('#single-church-edit-form').toggle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
})

$('#cancel-change').on('click', function() {
  $('#single-pastor-edit-form').toggle();
  $('#single-church-edit-form').toggle();
  $("#single-pastor").toggle();
  $("#single-church").toggle();
  window.scrollTo({ top: 0, behavior: 'smooth' });
})

$('.add-church-button').on('click', function () {
  if($('.add-pastor-button').hasClass('selected') === true){
    $('.add-pastor-form').hide();
    $('.add-pastor-button').removeClass('selected');
    // $('.line-break').show();
  }
  $('.add-church-form').slideToggle(500);
  $('.add-church-button').toggleClass('selected');
})

$('.add-pastor-button').on('click', function () {
  if($('.add-church-button').hasClass('selected') === true){
    $('.add-church-form').hide();
    $('.add-church-button').removeClass('selected');
  }
  $('.add-pastor-form').slideToggle(500);
  $('.add-pastor-button').toggleClass('selected');
})

//Hamburger Menu
  $(".menu").hide();
  $(".hamburger").click(function () {
    $(".menu").toggle("slow");
  });

  //drop down menu animation
  $('.dropdown-el').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).toggleClass('expanded');
    $('#'+$(e.target).attr('for')).prop('checked',true);
  });
  $(document).click(function() {
    $('.dropdown-el').removeClass('expanded');
  });


  // console.log(window.location)


