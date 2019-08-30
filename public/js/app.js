'use strict';

//Toggle form show for church or pastor
$('.add-church-form').hide();
$('.add-pastor-form').hide();

$('.add-church-button').on('click', function () {
  if($('.add-pastor-button').hasClass('selected') === true){
    $('.add-pastor-form').hide();
    $('.add-pastor-button').removeClass('selected');
  }
  $('.add-church-form').toggle();
  $('.add-church-button').toggleClass('selected');
})

$('.add-pastor-button').on('click', function () {
  if($('.add-church-button').hasClass('selected') === true){
    $('.add-church-form').hide();
    $('.add-church-button').removeClass('selected');
  }
  $('.add-pastor-form').toggle();
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


  console.log(window.location)
