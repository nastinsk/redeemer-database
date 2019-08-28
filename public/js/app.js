'use strict';

// $('.select-button').on('click', function() {
//   $(this).next().removeClass('hide-me');
// });
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

  // $(".cross").hide();
  $(".menu").hide();
  $(".hamburger").click(function () {
    $(".menu").toggle("slow", 

  );
  });



