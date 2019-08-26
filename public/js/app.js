'use strict';

// $('.select-button').on('click', function() {
//   $(this).next().removeClass('hide-me');
// });
$('.add-church-form').hide();
$('.add-pastor-form').hide();

$('.add-church-button').on('click', function() {
  $('.add-church-form').toggle();
  $('.add-church-button').toggleClass('selected');
})

$('.add-pastor-button').on('click', function() {
  $('.add-pastor-form').toggle();
  $('.add-pastor-button').toggleClass('selected');
})
